# AI Chat Application API Specification

## Base URL
```
https://api.yourdomain.com/v1
```

## Authentication
All API endpoints require Bearer token authentication:
```
Authorization: Bearer <access_token>
```

## API Endpoints

### 1. Conversations

#### Create a new conversation
```
POST /conversations
```

Request body:
```json
{
  "title": "Optional custom title",
  "model": "gpt-4",  // or other AI model identifier
  "system_prompt": "Optional system instructions"
}
```

Response (201 Created):
```json
{
  "conversation_id": "conv_abc123",
  "title": "Custom title",
  "created_at": "2025-01-02T10:30:00Z",
  "model": "gpt-4",
  "system_prompt": "Optional system instructions",
  "message_count": 0
}
```

#### List conversations
```
GET /conversations
```

Query parameters:
- `limit` (optional): Number of conversations per page (default: 20)
- `offset` (optional): Pagination offset
- `order` (optional): "desc" (default) or "asc"

Response (200 OK):
```json
{
  "conversations": [
    {
      "conversation_id": "conv_abc123",
      "title": "Custom title",
      "created_at": "2025-01-02T10:30:00Z",
      "last_message_at": "2025-01-02T10:35:00Z",
      "message_count": 5,
      "preview": "Last message preview..."
    }
  ],
  "total": 100,
  "has_more": true
}
```

#### Get conversation details
```
GET /conversations/{conversation_id}
```

Response (200 OK):
```json
{
  "conversation_id": "conv_abc123",
  "title": "Custom title",
  "created_at": "2025-01-02T10:30:00Z",
  "model": "gpt-4",
  "system_prompt": "Optional system instructions",
  "message_count": 5,
  "last_message_at": "2025-01-02T10:35:00Z"
}
```

### 2. Messages

#### Send a message
```
POST /conversations/{conversation_id}/messages
```

Request body:
```json
{
  "content": "User's message content",
  "attachments": [
    {
      "type": "image",
      "url": "https://example.com/image.jpg"
    }
  ]
}
```

Response (201 Created):
```json
{
  "message_id": "msg_xyz789",
  "conversation_id": "conv_abc123",
  "role": "user",
  "content": "User's message content",
  "attachments": [
    {
      "type": "image",
      "url": "https://example.com/image.jpg"
    }
  ],
  "created_at": "2025-01-02T10:35:00Z"
}
```

#### Get conversation messages
```
GET /conversations/{conversation_id}/messages
```

Query parameters:
- `limit` (optional): Number of messages per page (default: 50)
- `before` (optional): Message ID to fetch messages before
- `after` (optional): Message ID to fetch messages after

Response (200 OK):
```json
{
  "messages": [
    {
      "message_id": "msg_xyz789",
      "conversation_id": "conv_abc123",
      "role": "user",
      "content": "User's message content",
      "attachments": [],
      "created_at": "2025-01-02T10:35:00Z"
    },
    {
      "message_id": "msg_abc456",
      "conversation_id": "conv_abc123",
      "role": "assistant",
      "content": "AI assistant's response",
      "created_at": "2025-01-02T10:35:02Z",
      "metadata": {
        "tokens": 147,
        "model": "gpt-4",
        "finish_reason": "stop"
      }
    }
  ],
  "has_more": false
}
```

### 3. Stream Response

#### Stream AI response
```
POST /conversations/{conversation_id}/messages/stream
```

Uses server-sent events (SSE) for streaming responses.

Request body:
```json
{
  "content": "User's message content"
}
```

SSE Response format:
```
event: message
data: {"delta": "AI", "finish_reason": null}

event: message
data: {"delta": " assistant's", "finish_reason": null}

event: message
data: {"delta": " response", "finish_reason": "stop"}
```

### 4. Error Responses

All error responses follow this format:
```json
{
  "error": {
    "code": "error_code",
    "message": "Human-readable error message",
    "details": {
      // Additional error details if available
    }
  }
}
```

Common HTTP status codes:
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 429 Too Many Requests
- 500 Internal Server Error

## Best Practices

1. **Versioning**
   - Include API version in URL path (/v1)
   - Use semantic versioning for breaking changes

2. **Rate Limiting**
   - Include rate limit headers:
     ```
     X-RateLimit-Limit: 100
     X-RateLimit-Remaining: 95
     X-RateLimit-Reset: 1640995200
     ```

3. **Pagination**
   - Use cursor-based pagination for messages
   - Use offset pagination for conversations
   - Include total count when feasible

4. **Caching**
   - Use ETags for conversation and message lists
   - Include appropriate Cache-Control headers

5. **Security**
   - Enforce HTTPS only
   - Implement request signing for sensitive operations
   - Use JWT or similar for authentication
   - Implement request timeouts

6. **Performance**
   - Compress responses using gzip/brotli
   - Implement connection pooling
   - Use appropriate indexes in database

7. **Monitoring**
   - Log all API requests with unique request IDs
   - Include request ID in response headers:
     ```
     X-Request-ID: req_abc123
     ```

8. **Error Handling**
   - Return detailed error messages in development
   - Sanitize error details in production
   - Log all errors with stack traces

