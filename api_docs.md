# Crontab Manager - API Documentation

This document describes all the API endpoints for the Crontab Manager application.

## Base URL
All API requests are prefixed with:
```
/api/v1
```

---

## Authentication Endpoints

### 1. Register User
Create a new user account.
* **URL Path:** `/auth/register`
* **HTTP Method:** `POST`
* **Headers:**
  * `Content-Type: application/json`
* **Request Body:**
  ```json
  {
    "username": "johndoe",
    "password": "securepassword123"
  }
  ```
  * `username`: String (required) - The username of the user (at least 3 characters).
  * `password`: String (required) - Password must be at least 6 characters.

* **Success Response (201 Created):**
  ```json
  {
    "message": "User registered successfully.",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "603d2b...",
      "username": "johndoe"
    }
  }
  ```

* **Error Responses:**
  * **400 Bad Request:**
    ```json
    {
      "error": "Registration failed.",
      "details": "Username must be at least 3 characters long."
    }
    ```

---

### 2. User Login
Authenticate an existing user and obtain a JWT session token.
* **URL Path:** `/auth/login`
* **HTTP Method:** `POST`
* **Headers:**
  * `Content-Type: application/json`
* **Request Body:**
  ```json
  {
    "username": "johndoe",
    "password": "securepassword123"
  }
  ```

* **Success Response (200 OK):**
  ```json
  {
    "message": "Login successful.",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "603d2b...",
      "username": "johndoe"
    }
  }
  ```

* **Error Responses:**
  * **401 Unauthorized:**
    ```json
    {
      "error": "Login failed.",
      "details": "Invalid username or password"
    }
    ```

---

### 3. Get Current User Info
Retrieve profile details of the currently authenticated user.
* **URL Path:** `/auth/me`
* **HTTP Method:** `GET`
* **Headers:**
  * `Authorization: Bearer <token>`
* **Request Body:** None

* **Success Response (200 OK):**
  ```json
  {
    "user": {
      "id": "603d2b...",
      "username": "johndoe"
    }
  }
  ```

* **Error Responses:**
  * **401 Unauthorized:**
    ```json
    {
      "error": "Unauthorized."
    }
    ```

---

## Cron Job Endpoints

### 1. List All Cron Jobs
Retrieve all cron jobs configured by the authenticated user.
* **URL Path:** `/cron`
* **HTTP Method:** `GET`
* **Headers:**
  * `Authorization: Bearer <token>`
* **Request Body:** None

* **Success Response (200 OK):**
  ```json
  {
    "jobs": [
      {
        "_id": "603d2c...",
        "userId": "603d2b...",
        "name": "Check Service Status",
        "schedule": "*/5 * * * *",
        "command": "curl -X GET https://example.com/health",
        "isActive": true,
        "createdAt": "2026-05-20T07:15:00.000Z",
        "updatedAt": "2026-05-20T07:15:00.000Z"
      }
    ]
  }
  ```

---

### 2. Create Cron Job
Create and schedule a new cron job.
* **URL Path:** `/cron` or `/cron/schedule`
* **HTTP Method:** `POST`
* **Headers:**
  * `Authorization: Bearer <token>`
  * `Content-Type: application/json`
* **Request Body:**
  ```json
  {
    "name": "Database Backup",
    "schedule": "0 0 * * *",
    "url": "https://api.example.com/backup"
  }
  ```
  * `name`: String (optional) - A descriptive name.
  * `schedule`: String (required) - A valid 5-field cron expression.
  * `url`: String (required) - The URL which will be pinged via `curl -X GET <url>`

* **Success Response (201 Created):**
  ```json
  {
    "message": "Cron job created and scheduled successfully.",
    "job": {
      "_id": "603d2c...",
      "userId": "603d2b...",
      "name": "Database Backup",
      "schedule": "0 0 * * *",
      "command": "curl -X GET https://api.example.com/backup",
      "isActive": true,
      "createdAt": "2026-05-20T07:15:00.000Z",
      "updatedAt": "2026-05-20T07:15:00.000Z"
    }
  }
  ```

---

### 3. Update Cron Job
Modify an existing cron job's configuration.
* **URL Path:** `/cron/:id`
* **HTTP Method:** `PUT`
* **Headers:**
  * `Authorization: Bearer <token>`
  * `Content-Type: application/json`
* **Request Body (All fields optional):**
  ```json
  {
    "name": "Updated Job Name",
    "schedule": "0 12 * * *",
    "command": "curl -X GET https://api.example.com/new-backup",
    "isActive": false
  }
  ```

* **Success Response (200 OK):**
  ```json
  {
    "message": "Cron job updated successfully.",
    "job": {
      "_id": "603d2c...",
      "userId": "603d2b...",
      "name": "Updated Job Name",
      "schedule": "0 12 * * *",
      "command": "curl -X GET https://api.example.com/new-backup",
      "isActive": false,
      "createdAt": "2026-05-19T10:00:00.000Z",
      "updatedAt": "2026-05-20T07:20:00.000Z"
    }
  }
  ```

---

### 4. Delete Cron Job
Delete a cron job and remove it from the active scheduler.
* **URL Path:** `/cron/:id`
* **HTTP Method:** `DELETE`
* **Headers:**
  * `Authorization: Bearer <token>`
* **Request Body:** None

* **Success Response (200 OK):**
  ```json
  {
    "message": "Cron job deleted and stopped successfully."
  }
  ```

---

### 5. Get Execution Logs
Fetch history logs of cron job runs.
* **URL Path:** `/cron/logs`
* **HTTP Method:** `GET`
* **Headers:**
  * `Authorization: Bearer <token>`
* **Query Parameters:**
  * `jobId` (optional): Filter logs for a specific cron job ID.
  * `limit` (optional): Number of records to return.

* **Success Response (200 OK):**
  ```json
  {
    "logs": [
      {
        "_id": "603d2e...",
        "jobId": "603d2c...",
        "status": "success",
        "output": "pg_dump completed successfully.",
        "durationMs": 450,
        "executedAt": "2026-05-20T07:20:00.000Z"
      }
    ]
  }
  ```
