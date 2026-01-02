# N8N RAG Chatbot Setup Guide

This guide will help you set up an AI chatbot using n8n that only answers questions from your custom knowledge base documents.

## Overview

The chatbot uses **RAG (Retrieval Augmented Generation)** which means:
- It searches your custom documents first
- Only answers based on information found in your documents
- Won't make up answers or use general knowledge
- Provides source citations

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Website   │────▶│ N8N Chatbot  │────▶│   OpenAI    │
│ ChatWidget  │     │   Workflow   │     │  GPT-4/3.5  │
└─────────────┘     └──────┬───────┘     └─────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  Pinecone    │
                    │ Vector Store │
                    └──────────────┘
```

## Prerequisites

1. **n8n Instance** (Cloud or Self-hosted)
   - Sign up at [n8n.cloud](https://n8n.cloud) OR
   - Self-host with Docker: `docker run -it --rm --name n8n -p 5678:5678 -v ~/.n8n:/home/node/.n8n n8nio/n8n`

2. **OpenAI API Key**
   - Get from: https://platform.openai.com/api-keys
   - You'll need this for embeddings and chat completions

3. **Pinecone Account** (Free tier available)
   - Sign up at: https://www.pinecone.io
   - Create an index with dimensions: 1536 (for OpenAI embeddings)
   - Note your API key and index name

## Step 1: Set up Pinecone Vector Store

1. **Create Pinecone Account**
   - Go to https://www.pinecone.io
   - Sign up for free account

2. **Create Index**
   ```
   Index Name: automagicly-knowledge-base
   Dimensions: 1536
   Metric: cosine
   ```

3. **Get API Keys**
   - Save your Pinecone API Key
   - Save your Environment (e.g., `us-east-1-aws`)

## Step 2: Create N8N Workflows

### Workflow 1: Document Ingestion

This workflow processes and stores your documents.

**Purpose**: Upload documents → Split into chunks → Create embeddings → Store in Pinecone

**Steps**:
1. In n8n, create new workflow called "Document Ingestion"
2. Add these nodes:

```
Webhook (Trigger)
  ↓
Extract File Data
  ↓
Document Splitter (chunk size: 1000, overlap: 200)
  ↓
OpenAI Embeddings
  ↓
Pinecone Vector Store (Upsert)
```

**Detailed Node Configuration**:

**Node 1: Webhook**
- Method: POST
- Path: `/ingest-document`
- Response Mode: Last Node
- Accept file uploads: Enable

**Node 2: Extract Binary Data**
- Extract: From URL or File
- Property Name: `data`

**Node 3: Document Splitter**
- Chunk Size: 1000
- Chunk Overlap: 200

**Node 4: OpenAI Embeddings**
- Model: text-embedding-ada-002
- Input: `{{ $json.pageContent }}`

**Node 5: Pinecone Upsert**
- Index: `automagicly-knowledge-base`
- Vector: `{{ $json.embedding }}`
- Metadata:
  ```json
  {
    "text": "{{ $json.pageContent }}",
    "source": "{{ $('Webhook').item.json.fileName }}"
  }
  ```

### Workflow 2: RAG Chatbot

This is your main chatbot that answers customer questions.

**Purpose**: Question → Search documents → Generate answer → Return response

**Steps**:
1. Create new workflow called "RAG Chatbot"
2. Add these nodes:

```
Webhook (Trigger)
  ↓
OpenAI Embeddings (convert question to vector)
  ↓
Pinecone Query (find relevant documents)
  ↓
Aggregate Results
  ↓
OpenAI Chat (generate answer from context)
  ↓
Respond to Webhook
```

**Detailed Node Configuration**:

**Node 1: Webhook**
- Method: POST
- Path: `/chat`
- Response Mode: Last Node
- Body Parameters:
  ```json
  {
    "message": "string",
    "conversationId": "string (optional)"
  }
  ```

**Node 2: OpenAI Embeddings**
- Model: text-embedding-ada-002
- Input: `{{ $json.body.message }}`

**Node 3: Pinecone Query**
- Index: `automagicly-knowledge-base`
- Top K: 5 (retrieve 5 most relevant chunks)
- Vector: `{{ $json.embedding }}`
- Include Metadata: Yes

**Node 4: Aggregate**
- Aggregation: Combine all results
- Code:
  ```javascript
  const results = items.map(item => item.json.metadata.text);
  const context = results.join('\n\n');
  return [{
    json: {
      context,
      question: $('Webhook').item.json.body.message,
      sources: items.map(item => item.json.metadata.source)
    }
  }];
  ```

**Node 5: OpenAI Chat**
- Model: gpt-4-turbo-preview (or gpt-3.5-turbo for lower cost)
- System Message:
  ```
  You are AutoMagicly's helpful AI assistant. Answer questions ONLY using the provided context from our knowledge base.

  Rules:
  1. Only answer based on the context provided
  2. If the context doesn't contain the answer, say "I don't have that information in my knowledge base. Please contact our team for help."
  3. Be helpful, friendly, and professional
  4. Keep answers concise but complete
  5. Cite sources when possible

  Context from knowledge base:
  {{ $json.context }}
  ```
- User Message: `{{ $json.question }}`

**Node 6: Respond to Webhook**
- Response Body:
  ```json
  {
    "success": true,
    "message": "{{ $json.choices[0].message.content }}",
    "sources": "{{ $('Aggregate').item.json.sources }}",
    "conversationId": "{{ $('Webhook').item.json.body.conversationId }}"
  }
  ```

## Step 3: Configure n8n Credentials

1. **OpenAI Credentials**
   - Go to Settings → Credentials
   - Add "OpenAI" credential
   - Enter your API key

2. **Pinecone Credentials**
   - Add "Pinecone" credential
   - Enter API Key
   - Enter Environment
   - Enter Index Name

## Step 4: Get Your Webhook URLs

1. Activate both workflows
2. Note the webhook URLs:
   - Document Ingestion: `https://your-n8n-instance.com/webhook/ingest-document`
   - Chatbot: `https://your-n8n-instance.com/webhook/chat`

## Step 5: Upload Your Documents

### Option A: Via API (Recommended for automation)

```bash
curl -X POST https://your-n8n-instance.com/webhook/ingest-document \
  -F "file=@/path/to/your/document.pdf" \
  -F "fileName=company-knowledge.pdf"
```

### Option B: Via n8n Manual Trigger

1. Add a "Manual Trigger" before the webhook in Document Ingestion workflow
2. Add a "Read File" node
3. Select your document
4. Execute the workflow

### Supported Document Types
- PDF
- TXT
- DOCX
- Markdown
- HTML

## Step 6: Update Website ChatWidget

Your ChatWidget component needs to call the n8n chatbot endpoint. Update `.env.local`:

```bash
N8N_CHAT_WEBHOOK_URL="https://your-n8n-instance.com/webhook/chat"
```

The ChatWidget component is already set up to use this environment variable!

## Step 7: Test Your Chatbot

1. Open your website
2. Click the chat icon
3. Ask a question about your business
4. The bot should only answer from your uploaded documents

## Sample Documents to Upload

Create these knowledge base documents:

### 1. `services.md`
```markdown
# AutoMagicly Services

## AI Audit
We provide comprehensive AI audits to identify automation opportunities in your business.
Price: Custom quote
Duration: 2-4 weeks

## Workflow Automation
We build custom automation workflows using tools like n8n, Zapier, and Make.
Price: Starting at $2,500
Timeline: 1-3 weeks

## AI Integration
We integrate AI capabilities into your existing systems.
Price: Custom quote
```

### 2. `faq.md`
```markdown
# Frequently Asked Questions

## How long does an AI audit take?
Our AI audits typically take 2-4 weeks depending on company size.

## Do you offer ongoing support?
Yes! We offer monthly retainer packages for ongoing automation support.

## What tools do you use?
We specialize in n8n, Zapier, Make, OpenAI, and custom integrations.
```

### 3. `pricing.md`
```markdown
# Pricing

## AI Audit: $1,500 - $5,000
- Full business process analysis
- Automation opportunity identification
- ROI calculations
- Implementation roadmap

## Workflow Automation: Starting at $2,500
- Custom workflow design
- Tool integration
- Testing and deployment
- Training and documentation
```

## Advanced Features

### Conversation Memory

To add conversation history, update the chatbot workflow:

1. Add a "Supabase" or "Database" node to store conversations
2. Before OpenAI Chat, retrieve last 5 messages
3. Include them in the chat context

### Multiple Knowledge Bases

Create different Pinecone indexes for:
- General FAQ
- Technical documentation
- Pricing information
- Blog content

Query all indexes and combine results for comprehensive answers.

### Admin Interface

Create a simple admin page to:
- Upload new documents
- View chatbot analytics
- Update knowledge base
- See conversation logs

## Monitoring & Maintenance

### Check Chatbot Performance

1. **In n8n**:
   - View execution logs
   - Monitor errors
   - Check response times

2. **In Pinecone**:
   - Monitor index stats
   - Check vector count
   - View query performance

### Update Knowledge Base

When you update your services or information:
1. Upload new document via the ingestion workflow
2. Old information is automatically replaced if filenames match
3. Test the chatbot to ensure answers are updated

## Costs

**Monthly Estimates**:
- **n8n Cloud**: $20/month (Starter plan)
- **OpenAI API**: ~$5-20/month (depends on usage)
- **Pinecone**: Free tier (sufficient for small businesses)

**Total**: ~$25-40/month

## Troubleshooting

### Chatbot Returns Generic Answers

**Problem**: Bot isn't using your documents
**Solution**:
- Check Pinecone index has vectors
- Verify OpenAI embeddings are working
- Ensure chunk size isn't too large

### "I don't have that information"

**Problem**: Bot can't find relevant context
**Solution**:
- Add more documents on that topic
- Try rephrasing the question
- Increase Top K in Pinecone query (from 5 to 10)

### Slow Responses

**Problem**: Chatbot takes >5 seconds
**Solution**:
- Use gpt-3.5-turbo instead of gpt-4
- Reduce Top K in Pinecone query
- Optimize chunk sizes

## Next Steps

1. ✅ Set up n8n instance
2. ✅ Create Pinecone index
3. ✅ Import both workflows
4. ✅ Configure credentials
5. ✅ Upload your first documents
6. ✅ Test the chatbot
7. ✅ Monitor and refine

## Support

For issues with this setup:
- Check n8n documentation: https://docs.n8n.io
- Pinecone docs: https://docs.pinecone.io
- OpenAI docs: https://platform.openai.com/docs

Your chatbot will now only answer from YOUR knowledge base!
