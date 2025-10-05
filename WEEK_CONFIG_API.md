# Week Configuration API Documentation

## Overview

This API provides endpoints for managing custom week configurations using the `/api/v1/week-config` route structure as specified.

## Base URL

```
/api/v1/week-config
```

## Authentication

All endpoints require authentication. The API expects:

- `req.user.id` - User ID for createdBy/lastModifiedBy fields
- Authentication middleware must be applied

## API Endpoints

### 1. Get Week Configuration by Year and Month

**GET** `/api/v1/week-config/:year/:month`

Gets the week configuration for a specific month. If no custom configuration exists, returns a default week structure.

**Parameters:**

- `year` (number): The year (e.g., 2024)
- `month` (number): The month (1-12)

**Response:**

```json
{
  "year": 2024,
  "month": 3,
  "weeks": [
    {
      "weekNumber": 1,
      "startDate": "2024-03-01T00:00:00.000Z",
      "endDate": "2024-03-07T23:59:59.999Z",
      "isActive": true
    },
    {
      "weekNumber": 2,
      "startDate": "2024-03-08T00:00:00.000Z",
      "endDate": "2024-03-14T23:59:59.999Z",
      "isActive": true
    }
  ],
  "isDefault": true
}
```

**Error Responses:**

- `400` - Invalid year or month
- `500` - Server error

### 2. Create or Update Week Configuration

**POST** `/api/v1/week-config`

Creates a new week configuration or updates an existing one.

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
      "isActive": true,
      "notes": "First week of March"
    },
    {
      "weekNumber": 2,
      "startDate": "2024-03-08T00:00:00.000Z",
      "endDate": "2024-03-14T23:59:59.999Z",
      "isActive": true
    }
  ]
}
```

**Response:**

```json
{
  "_id": "...",
  "year": 2024,
  "month": 3,
  "weeks": [...],
  "createdBy": "...",
  "lastModifiedBy": "...",
  "isDefault": false,
  "createdAt": "2024-03-01T00:00:00.000Z",
  "updatedAt": "2024-03-01T00:00:00.000Z"
}
```

**Error Responses:**

- `400` - Invalid input data or validation errors
- `401` - User authentication required
- `500` - Server error

### 3. Delete Week Configuration

**DELETE** `/api/v1/week-config/:year/:month`

Deletes the week configuration for a specific month.

**Parameters:**

- `year` (number): The year
- `month` (number): The month (1-12)

**Response:**

```json
{
  "message": "Week configuration deleted successfully"
}
```

**Error Responses:**

- `400` - Invalid year or month
- `404` - Week configuration not found
- `500` - Server error

### 4. Get All Configurations for a Year

**GET** `/api/v1/week-config/year/:year`

Gets all week configurations for a specific year, sorted by month.

**Parameters:**

- `year` (number): The year

**Response:**

```json
[
  {
    "_id": "...",
    "year": 2024,
    "month": 1,
    "weeks": [...],
    "createdBy": "...",
    "isDefault": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  {
    "_id": "...",
    "year": 2024,
    "month": 2,
    "weeks": [...],
    "createdBy": "...",
    "isDefault": false,
    "createdAt": "2024-02-01T00:00:00.000Z"
  }
]
```

**Error Responses:**

- `400` - Invalid year
- `500` - Server error

## Validation Rules

### Week Configuration

- `year`: Required, must be a valid year
- `month`: Required, must be between 1-12
- `weeks`: Required, must be an array with at least 1 week
- Only one configuration per year/month combination (unique constraint)

### Week Structure

- `weekNumber`: Required, must be sequential starting from 1
- `startDate`: Required, must be a valid date
- `endDate`: Required, must be a valid date
- `startDate` must be before `endDate`
- Weeks cannot overlap in date ranges
- Weeks must cover the entire month
- `isActive`: Optional, defaults to true
- `notes`: Optional, maximum 500 characters

## Helper Functions

### generateDefaultWeekConfig(year, month)

Generates a default week configuration with Monday-Sunday weeks that cover the entire month.

### validateWeeks(weeks, year, month)

Validates the week configuration and returns an array of error messages.

## Error Handling

The API includes comprehensive error handling for:

- Invalid date formats
- Database connection errors
- Validation errors
- Authorization errors
- Duplicate configuration errors

## Usage Examples

### Get March 2024 Configuration

```bash
curl -X GET "https://your-api.com/api/v1/week-config/2024/3" \
  -H "Authorization: Bearer your-token"
```

### Create Custom Configuration

```bash
curl -X POST "https://your-api.com/api/v1/week-config" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{
    "year": 2024,
    "month": 3,
    "isDefault": false,
    "weeks": [
      {
        "weekNumber": 1,
        "startDate": "2024-03-01T00:00:00.000Z",
        "endDate": "2024-03-07T23:59:59.999Z",
        "isActive": true,
        "notes": "First week of March"
      }
    ]
  }'
```

### Get All 2024 Configurations

```bash
curl -X GET "https://your-api.com/api/v1/week-config/year/2024" \
  -H "Authorization: Bearer your-token"
```

### Delete Configuration

```bash
curl -X DELETE "https://your-api.com/api/v1/week-config/2024/3" \
  -H "Authorization: Bearer your-token"
```

## Features

- ✅ **Default Week Generation** - Automatically generates Monday-Sunday weeks
- ✅ **Unique Constraints** - One configuration per year/month
- ✅ **Comprehensive Validation** - Overlap detection, month coverage, sequential weeks
- ✅ **User Tracking** - Created/modified by user tracking
- ✅ **Error Handling** - Detailed error messages and proper HTTP status codes
- ✅ **TypeScript Support** - Full type safety
- ✅ **MongoDB Integration** - Optimized queries and indexing
