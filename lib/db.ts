import { DynamoDBClient, ScanCommand, QueryCommand, PutItemCommand, UpdateItemCommand, DeleteItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

const TABLE_NAME = 'automagicly-reviews';
const GSI_NAME = 'status-created_at-index';

function getClient() {
  return new DynamoDBClient({
    region: process.env.REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.DB_ACCESS_KEY_ID!,
      secretAccessKey: process.env.DB_SECRET_ACCESS_KEY!,
    }
  });
}

// Type definitions for our database
export interface Review {
  id: string;
  name?: string;
  email?: string;
  company?: string;
  rating: number;
  review_text: string;
  service_type: string;
  status: 'pending' | 'approved' | 'rejected';
  featured?: boolean;
  approval_token?: string;
  token_expires_at?: number;
  created_at: number;
  approved_at?: number;
  updated_at: number;
}

// Get reviews with optional filtering
export async function getReviews(status?: string): Promise<Review[]> {
  try {
    const client = getClient();

    if (status && status !== 'all') {
      // Use GSI to query by status
      const command = new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: GSI_NAME,
        KeyConditionExpression: '#status = :status',
        ExpressionAttributeNames: {
          '#status': 'status'
        },
        ExpressionAttributeValues: marshall({
          ':status': status
        }),
        ScanIndexForward: false // Sort by created_at DESC
      });

      const response = await client.send(command);
      const reviews = response.Items?.map(item => unmarshall(item) as Review) || [];

      // Filter for approved reviews with 3+ stars
      if (!status || status === 'approved') {
        return reviews.filter(r => r.rating >= 3);
      }

      return reviews;
    } else {
      // Scan all reviews
      const command = new ScanCommand({
        TableName: TABLE_NAME
      });

      const response = await client.send(command);
      const reviews = response.Items?.map(item => unmarshall(item) as Review) || [];

      // Sort by created_at DESC
      reviews.sort((a, b) => b.created_at - a.created_at);

      return reviews;
    }
  } catch (error) {
    console.error('Error getting reviews:', error);
    throw error;
  }
}

// Create a new review
export async function createReview(review: Omit<Review, 'id' | 'created_at' | 'updated_at'>): Promise<Review> {
  try {
    const client = getClient();
    const now = Date.now();
    const id = crypto.randomUUID();

    const newReview: Review = {
      ...review,
      id,
      created_at: now,
      updated_at: now
    };

    const command = new PutItemCommand({
      TableName: TABLE_NAME,
      Item: marshall(newReview)
    });

    await client.send(command);
    return newReview;
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
}

// Update a review
export async function updateReview(
  id: string,
  updates: { status?: 'pending' | 'approved' | 'rejected'; featured?: boolean }
): Promise<Review | null> {
  try {
    const client = getClient();
    const updateExpressions: string[] = ['#updated_at = :updated_at'];
    const expressionAttributeNames: Record<string, string> = {
      '#updated_at': 'updated_at'
    };
    const expressionAttributeValues: any = {
      ':updated_at': Date.now()
    };

    if (updates.status !== undefined) {
      updateExpressions.push('#status = :status');
      expressionAttributeNames['#status'] = 'status';
      expressionAttributeValues[':status'] = updates.status;

      if (updates.status === 'approved') {
        updateExpressions.push('#approved_at = :approved_at');
        expressionAttributeNames['#approved_at'] = 'approved_at';
        expressionAttributeValues[':approved_at'] = Date.now();
      }
    }

    if (updates.featured !== undefined) {
      updateExpressions.push('#featured = :featured');
      expressionAttributeNames['#featured'] = 'featured';
      expressionAttributeValues[':featured'] = updates.featured;
    }

    const command = new UpdateItemCommand({
      TableName: TABLE_NAME,
      Key: marshall({ id }),
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: marshall(expressionAttributeValues),
      ReturnValues: 'ALL_NEW'
    });

    const response = await client.send(command);
    return response.Attributes ? unmarshall(response.Attributes) as Review : null;
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
}

// Delete a review
export async function deleteReview(id: string): Promise<boolean> {
  try {
    const client = getClient();
    const command = new DeleteItemCommand({
      TableName: TABLE_NAME,
      Key: marshall({ id })
    });

    await client.send(command);
    return true;
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
}
