import { DynamoDBClient, GetItemCommand, PutItemCommand, UpdateItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { randomUUID } from 'crypto';
import {
  AuditSession,
  AuditMessage,
  ConfidenceScores,
  PainPoint,
  Recommendation,
  ContactInfo,
  DEFAULT_CONFIDENCE,
  DISCOVERY_QUESTIONS,
  SESSION_TTL_MS
} from './audit-types';

const TABLE_NAME = 'automagicly-audit-sessions';
const GSI_NAME = 'status-createdAt-index';

// UUID generation with fallback
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return randomUUID();
}

// Get DynamoDB client
function getClient() {
  if (!process.env.DB_ACCESS_KEY_ID || !process.env.DB_SECRET_ACCESS_KEY) {
    throw new Error('Missing required DynamoDB credentials (DB_ACCESS_KEY_ID or DB_SECRET_ACCESS_KEY)');
  }

  return new DynamoDBClient({
    region: process.env.REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.DB_ACCESS_KEY_ID,
      secretAccessKey: process.env.DB_SECRET_ACCESS_KEY,
    }
  });
}

// Create a new audit session
export async function createAuditSession(contactInfo?: ContactInfo): Promise<AuditSession> {
  const client = getClient();
  const now = Date.now();
  const sessionId = generateUUID();

  // Create first message with discovery question 1
  const firstMessage: AuditMessage = {
    role: 'assistant',
    content: DISCOVERY_QUESTIONS[0],
    timestamp: now,
    questionNumber: 1,
    isFixed: true
  };

  const session: AuditSession = {
    sessionId,
    createdAt: now,
    updatedAt: now,
    expiresAt: now + SESSION_TTL_MS,
    state: 'DISCOVERY',
    questionCount: 1,
    contactInfo,
    messages: [firstMessage],
    confidence: DEFAULT_CONFIDENCE,
    painPoints: [],
    status: 'active'
  };

  const command = new PutItemCommand({
    TableName: TABLE_NAME,
    Item: marshall(session, { removeUndefinedValues: true })
  });

  await client.send(command);
  return session;
}

// Get an audit session by ID
export async function getAuditSession(sessionId: string): Promise<AuditSession | null> {
  const client = getClient();

  const command = new GetItemCommand({
    TableName: TABLE_NAME,
    Key: marshall({ sessionId })
  });

  const response = await client.send(command);

  if (!response.Item) {
    return null;
  }

  return unmarshall(response.Item) as AuditSession;
}

// Update session with new message and state
export async function updateAuditSession(
  sessionId: string,
  updates: {
    userMessage?: string;
    assistantMessage?: string;
    questionNumber?: number;
    isFixedQuestion?: boolean;
    state?: AuditSession['state'];
    confidence?: ConfidenceScores;
    painPoints?: PainPoint[];
    recommendations?: Recommendation[];
    escalationReason?: string;
    nextSteps?: string;
    status?: AuditSession['status'];
  }
): Promise<AuditSession | null> {
  const client = getClient();
  const now = Date.now();

  // Build update expressions
  const updateExpressions: string[] = ['#updatedAt = :updatedAt'];
  const expressionAttributeNames: Record<string, string> = {
    '#updatedAt': 'updatedAt'
  };
  const expressionAttributeValues: Record<string, any> = {
    ':updatedAt': now
  };

  // First, get the current session to update messages array
  const currentSession = await getAuditSession(sessionId);
  if (!currentSession) {
    return null;
  }

  // Build new messages array
  const newMessages = [...currentSession.messages];

  if (updates.userMessage) {
    newMessages.push({
      role: 'user',
      content: updates.userMessage,
      timestamp: now
    });
  }

  if (updates.assistantMessage) {
    newMessages.push({
      role: 'assistant',
      content: updates.assistantMessage,
      timestamp: now,
      questionNumber: updates.questionNumber,
      isFixed: updates.isFixedQuestion
    });
  }

  // Always update messages
  updateExpressions.push('#messages = :messages');
  expressionAttributeNames['#messages'] = 'messages';
  expressionAttributeValues[':messages'] = newMessages;

  // Update question count if new question asked
  if (updates.questionNumber !== undefined) {
    updateExpressions.push('#questionCount = :questionCount');
    expressionAttributeNames['#questionCount'] = 'questionCount';
    expressionAttributeValues[':questionCount'] = updates.questionNumber;
  }

  if (updates.state !== undefined) {
    updateExpressions.push('#state = :state');
    expressionAttributeNames['#state'] = 'state';
    expressionAttributeValues[':state'] = updates.state;
  }

  if (updates.confidence !== undefined) {
    updateExpressions.push('#confidence = :confidence');
    expressionAttributeNames['#confidence'] = 'confidence';
    expressionAttributeValues[':confidence'] = updates.confidence;
  }

  if (updates.painPoints !== undefined) {
    updateExpressions.push('#painPoints = :painPoints');
    expressionAttributeNames['#painPoints'] = 'painPoints';
    expressionAttributeValues[':painPoints'] = updates.painPoints;
  }

  if (updates.recommendations !== undefined) {
    updateExpressions.push('#recommendations = :recommendations');
    expressionAttributeNames['#recommendations'] = 'recommendations';
    expressionAttributeValues[':recommendations'] = updates.recommendations;
  }

  if (updates.escalationReason !== undefined) {
    updateExpressions.push('#escalationReason = :escalationReason');
    expressionAttributeNames['#escalationReason'] = 'escalationReason';
    expressionAttributeValues[':escalationReason'] = updates.escalationReason;
  }

  if (updates.nextSteps !== undefined) {
    updateExpressions.push('#nextSteps = :nextSteps');
    expressionAttributeNames['#nextSteps'] = 'nextSteps';
    expressionAttributeValues[':nextSteps'] = updates.nextSteps;
  }

  if (updates.status !== undefined) {
    updateExpressions.push('#status = :status');
    expressionAttributeNames['#status'] = 'status';
    expressionAttributeValues[':status'] = updates.status;
  }

  const command = new UpdateItemCommand({
    TableName: TABLE_NAME,
    Key: marshall({ sessionId }),
    UpdateExpression: `SET ${updateExpressions.join(', ')}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: marshall(expressionAttributeValues, { removeUndefinedValues: true }),
    ReturnValues: 'ALL_NEW'
  });

  const response = await client.send(command);
  return response.Attributes ? unmarshall(response.Attributes) as AuditSession : null;
}

// Get sessions by status (for admin dashboard)
export async function getAuditSessionsByStatus(status: string): Promise<AuditSession[]> {
  const client = getClient();

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
    ScanIndexForward: false // Sort by createdAt DESC
  });

  const response = await client.send(command);
  return response.Items?.map(item => unmarshall(item) as AuditSession) || [];
}

// Mark session as abandoned (for cleanup)
export async function abandonAuditSession(sessionId: string): Promise<void> {
  const client = getClient();

  const command = new UpdateItemCommand({
    TableName: TABLE_NAME,
    Key: marshall({ sessionId }),
    UpdateExpression: 'SET #status = :status, #updatedAt = :updatedAt',
    ExpressionAttributeNames: {
      '#status': 'status',
      '#updatedAt': 'updatedAt'
    },
    ExpressionAttributeValues: marshall({
      ':status': 'abandoned',
      ':updatedAt': Date.now()
    })
  });

  await client.send(command);
}
