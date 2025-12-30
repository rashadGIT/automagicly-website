import { NextResponse } from 'next/server';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';

export async function POST() {
  try {
    const client = new DynamoDBClient({
      region: process.env.REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.DB_ACCESS_KEY_ID!,
        secretAccessKey: process.env.DB_SECRET_ACCESS_KEY!,
      }
    });

    const sampleReviews = [
      {
        id: 'review-' + Date.now() + '-1',
        name: 'John Doe',
        email: 'john@example.com',
        company: 'Tech Corp',
        rating: 5,
        review_text: 'AutoMagicly transformed our calendar management! The team was professional and delivered exceptional results.',
        service_type: 'Calendar Integration',
        status: 'approved',
        featured: true,
        created_at: Date.now() - 86400000 * 7, // 7 days ago
        approved_at: Date.now() - 86400000 * 7,
        updated_at: Date.now() - 86400000 * 7
      },
      {
        id: 'review-' + Date.now() + '-2',
        name: 'Sarah Johnson',
        email: 'sarah@business.com',
        company: 'Marketing Pro',
        rating: 5,
        review_text: 'Outstanding service! They automated our entire booking process and saved us countless hours.',
        service_type: 'Booking Automation',
        status: 'approved',
        featured: false,
        created_at: Date.now() - 86400000 * 5, // 5 days ago
        approved_at: Date.now() - 86400000 * 5,
        updated_at: Date.now() - 86400000 * 5
      },
      {
        id: 'review-' + Date.now() + '-3',
        name: 'Michael Chen',
        email: 'michael@startup.io',
        company: 'InnovateTech',
        rating: 4,
        review_text: 'Great experience working with AutoMagicly. The team was responsive and delivered quality automation solutions.',
        service_type: 'Workflow Automation',
        status: 'approved',
        featured: true,
        created_at: Date.now() - 86400000 * 3, // 3 days ago
        approved_at: Date.now() - 86400000 * 3,
        updated_at: Date.now() - 86400000 * 3
      }
    ];

    // Insert each review
    for (const review of sampleReviews) {
      const command = new PutItemCommand({
        TableName: 'automagicly-reviews',
        Item: marshall(review)
      });
      await client.send(command);
    }

    return NextResponse.json({
      success: true,
      message: `Added ${sampleReviews.length} sample reviews`,
      count: sampleReviews.length
    });
  } catch (error: any) {
    console.error('Error seeding reviews:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      errorName: error.name
    }, { status: 500 });
  }
}
