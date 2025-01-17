# API Documentation

## Base URL
```
Production: https://api.municipal-feedback.com/v1
Development: http://localhost:3000/v1
```

## Authentication

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}

Response:
{
  "token": "string",
  "refreshToken": "string",
  "user": {
    "id": "string",
    "email": "string",
    "role": "string"
  }
}
```

### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "string"
}

Response:
{
  "token": "string",
  "refreshToken": "string"
}
```

## Feedback Management

### Submit Feedback
```http
POST /feedback
Content-Type: application/json
Authorization: Bearer <token>

{
  "description": "string",
  "category": "string",
  "location": {
    "latitude": number,
    "longitude": number,
    "address": "string"
  },
  "images": ["string"] // Base64 encoded images
}

Response:
{
  "id": "string",
  "status": "string",
  "createdAt": "string"
}
```

### Get Feedback List
```http
GET /feedback
Authorization: Bearer <token>
Query Parameters:
- status: string
- municipality: string
- page: number
- limit: number

Response:
{
  "items": [{
    "id": "string",
    "description": "string",
    "category": "string",
    "status": "string",
    "location": {
      "latitude": number,
      "longitude": number,
      "address": "string"
    },
    "createdAt": "string",
    "updatedAt": "string"
  }],
  "total": number,
  "page": number,
  "limit": number
}
```

### Update Feedback Status
```http
PATCH /feedback/:id/status
Content-Type: application/json
Authorization: Bearer <token>

{
  "status": "string",
  "comment": "string"
}

Response:
{
  "id": "string",
  "status": "string",
  "updatedAt": "string"
}
```

## Municipality Management

### Get Municipality List
```http
GET /municipalities
Authorization: Bearer <token>
Query Parameters:
- city: string
- page: number
- limit: number

Response:
{
  "items": [{
    "id": "string",
    "name": "string",
    "city": "string",
    "boundaries": {
      "type": "Polygon",
      "coordinates": [[[number]]]
    }
  }],
  "total": number,
  "page": number,
  "limit": number
}
```

### Get Municipality Statistics
```http
GET /municipalities/:id/statistics
Authorization: Bearer <token>
Query Parameters:
- startDate: string
- endDate: string

Response:
{
  "totalFeedback": number,
  "resolvedFeedback": number,
  "averageResolutionTime": number,
  "categoryDistribution": {
    "category": number
  }
}
```

## Location Services

### Get Virtual QR Code
```http
GET /location/qr
Authorization: Bearer <token>
Query Parameters:
- latitude: number
- longitude: number

Response:
{
  "qrCode": "string",
  "location": {
    "latitude": number,
    "longitude": number,
    "municipality": {
      "id": "string",
      "name": "string"
    }
  }
}
```

## User Management

### Create User
```http
POST /users
Content-Type: application/json
Authorization: Bearer <token>

{
  "email": "string",
  "password": "string",
  "role": "string",
  "municipalityId": "string"
}

Response:
{
  "id": "string",
  "email": "string",
  "role": "string"
}
```

### Update User
```http
PATCH /users/:id
Content-Type: application/json
Authorization: Bearer <token>

{
  "email": "string",
  "role": "string",
  "municipalityId": "string"
}

Response:
{
  "id": "string",
  "email": "string",
  "role": "string"
}
```

## Subscription Management

### Create Subscription
```http
POST /subscriptions
Content-Type: application/json
Authorization: Bearer <token>

{
  "municipalityId": "string",
  "plan": "string",
  "paymentMethod": {
    "type": "string",
    "token": "string"
  }
}

Response:
{
  "id": "string",
  "status": "string",
  "validUntil": "string"
}
```

### Get Subscription Status
```http
GET /subscriptions/:id
Authorization: Bearer <token>

Response:
{
  "id": "string",
  "status": "string",
  "plan": "string",
  "validUntil": "string",
  "features": ["string"]
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "ValidationError",
  "message": "string",
  "details": {}
}
```

### 401 Unauthorized
```json
{
  "error": "UnauthorizedError",
  "message": "string"
}
```

### 403 Forbidden
```json
{
  "error": "ForbiddenError",
  "message": "string"
}
```

### 404 Not Found
```json
{
  "error": "NotFoundError",
  "message": "string"
}
```

### 500 Internal Server Error
```json
{
  "error": "InternalServerError",
  "message": "string"
}
```

## Rate Limiting
- Rate limit: 100 requests per 15 minutes
- Rate limit header: `X-RateLimit-Limit`
- Remaining requests header: `X-RateLimit-Remaining`
- Reset time header: `X-RateLimit-Reset`

## Webhooks

### Feedback Status Update
```http
POST <webhook_url>
Content-Type: application/json

{
  "event": "feedback.status_update",
  "data": {
    "feedbackId": "string",
    "status": "string",
    "updatedAt": "string"
  }
}
```

### Subscription Status Update
```http
POST <webhook_url>
Content-Type: application/json

{
  "event": "subscription.status_update",
  "data": {
    "subscriptionId": "string",
    "status": "string",
    "updatedAt": "string"
  }
}
``` 