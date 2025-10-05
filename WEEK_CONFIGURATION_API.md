# Week Configuration API Documentation

## Overview

This API provides endpoints for managing custom week configurations in your application. Each configuration defines how weeks are structured for a specific year and month.

## Base URL

```
/api/v1/week-configurations
```

## Data Models

### WeekConfiguration

```typescript
{
  _id: ObjectId,
  year: number,           // Required, indexed
  month: number,          // Required, 1-12, indexed
  weeks: [Week],          // Array of week definitions
  createdBy: ObjectId,    // Reference to User
  lastModifiedBy: ObjectId, // Reference to User
  isDefault: boolean,     // Default configuration flag
  createdAt: Date,
  updatedAt: Date
}
```

### Week

```typescript
{
  weekNumber: number,     // 1-6
  startDate: Date,        // Required
  endDate: Date,          // Required
  isActive: boolean,      // Default: true
  notes: string           // Optional, max 500 chars
}
```

## API Endpoints

### 1. Get All Week Configurations

**GET** `/api/v1/week-configurations`

**Query Parameters:**

- `year` (number, optional): Filter by year
- `month` (number, optional): Filter by month
- `isActive` (boolean, optional): Filter by active weeks
- `isDefault` (boolean, optional): Filter by default configurations
- `createdBy` (string, optional): Filter by creator ID

**Response:**

```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "...",
      "year": 2024,
      "month": 3,
      "weeks": [...],
      "createdBy": {...},
      "isDefault": false,
      "createdAt": "2024-03-01T00:00:00.000Z",
      "updatedAt": "2024-03-01T00:00:00.000Z"
    }
  ]
}
```

### 2. Get Week Configuration by ID

**GET** `/api/v1/week-configurations/:id`

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "...",
    "year": 2024,
    "month": 3,
    "weeks": [...],
    "createdBy": {...},
    "isDefault": false
  }
}
```

### 3. Get Week Configuration by Year and Month

**GET** `/api/v1/week-configurations/year/:year/month/:month`

**Example:** `/api/v1/week-configurations/year/2024/month/3`

### 4. Get Default Week Configuration

**GET** `/api/v1/week-configurations/default`

### 5. Get Weeks in Date Range

**GET** `/api/v1/week-configurations/date-range?startDate=2024-03-01&endDate=2024-03-31`

**Query Parameters:**

- `startDate` (string, required): Start date in ISO format
- `endDate` (string, required): End date in ISO format

### 6. Create Week Configuration

**POST** `/api/v1/week-configurations`

**Request Body:**

```json
{
  "year": 2024,
  "month": 3,
  "isDefault": false,
  "weeks": [
    {
      "weekNumber": 1,
      "startDate": "2024-03-01T00:00:00.000Z",
      "endDate": "2024-03-07T23:59:59.999Z",
      "notes": "First week of March"
    },
    {
      "weekNumber": 2,
      "startDate": "2024-03-08T00:00:00.000Z",
      "endDate": "2024-03-14T23:59:59.999Z"
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Week configuration created successfully",
  "data": {
    "_id": "...",
    "year": 2024,
    "month": 3,
    "weeks": [...],
    "createdBy": {...},
    "isDefault": false
  }
}
```

### 7. Update Week Configuration

**PUT** `/api/v1/week-configurations/:id`

**Request Body:** Same as create, all fields optional

### 8. Toggle Week Status

**PATCH** `/api/v1/week-configurations/:id/weeks/:weekNumber/toggle`

**Request Body:**

```json
{
  "isActive": false
}
```

### 9. Delete Week Configuration

**DELETE** `/api/v1/week-configurations/:id`

**Response:**

```json
{
  "success": true,
  "message": "Week configuration deleted successfully"
}
```

## Validation Rules

### Week Configuration

- `year`: Required, must be a valid year
- `month`: Required, must be between 1-12
- `weeks`: Required, must be an array with at least 1 week
- Only one configuration per year/month combination
- Only one default configuration at a time

### Week

- `weekNumber`: Required, must be between 1-6
- `startDate`: Required, must be a valid date
- `endDate`: Required, must be a valid date
- `startDate` must be before `endDate`
- Weeks cannot overlap in date ranges
- `notes`: Optional, maximum 500 characters

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "message": "Invalid week date ranges: start date must be before end date"
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "message": "User authentication required"
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Week configuration not found"
}
```

### 409 Conflict

```json
{
  "success": false,
  "message": "Week configuration already exists for 2024/3"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Failed to create week configuration",
  "error": "Detailed error message"
}
```

## Usage Examples

### Create a March 2024 Configuration

```bash
curl -X POST https://your-api.com/api/v1/week-configurations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{
    "year": 2024,
    "month": 3,
    "isDefault": true,
    "weeks": [
      {
        "weekNumber": 1,
        "startDate": "2024-03-01T00:00:00.000Z",
        "endDate": "2024-03-07T23:59:59.999Z",
        "notes": "First week of March"
      },
      {
        "weekNumber": 2,
        "startDate": "2024-03-08T00:00:00.000Z",
        "endDate": "2024-03-14T23:59:59.999Z"
      }
    ]
  }'
```

### Get All Configurations for 2024

```bash
curl -X GET "https://your-api.com/api/v1/week-configurations?year=2024" \
  -H "Authorization: Bearer your-token"
```

### Toggle Week 2 Status

```bash
curl -X PATCH https://your-api.com/api/v1/week-configurations/64f8a1b2c3d4e5f6a7b8c9d0/weeks/2/toggle \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{"isActive": false}'
```

## Features

- ✅ Full CRUD operations
- ✅ Year/month based querying
- ✅ Date range filtering
- ✅ Default configuration management
- ✅ Week status toggling
- ✅ Overlap validation
- ✅ User tracking (created/modified by)
- ✅ Comprehensive error handling
- ✅ TypeScript support
- ✅ MongoDB integration
- ✅ Population of user references
