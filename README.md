# Secret Pastebin (Next.js + Neon Postgres)

A secure, serverless pastebin application built with **Next.js 16** and **Neon PostgreSQL**. This project allows users to create text pastes with configurable expiration times (TTL) and view-count limits.

## 🚀 Features

- **Persistence:** Uses a real PostgreSQL database (Neon) to ensure data survives across requests and serverless cold starts.
- **Deterministic Testing:** Supports the `x-test-now-ms` header to simulate time for automated expiration testing.
- **Safe Rendering:** Content is rendered using standard React data binding to prevent XSS (Script Execution).
- **IST Support:** Displays all timestamps in **Indian Standard Time (IST)** for a localized user experience while maintaining UTC consistency in the database.
- **Ephemeral Pastes:** Pastes automatically become unavailable (404) once they expire or reach their view limit.

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Database:** [Neon Postgres](https://neon.tech)
- **Driver:** `@neondatabase/serverless` (Direct SQL approach)
- **ID Generation:** `nanoid`

---

## 📋 Database Schema

The persistence layer is managed in Neon with the following table structure. You can run this in your Neon SQL console:

```sql
CREATE TABLE "Paste" (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE,
  max_views INTEGER,
  remaining_views INTEGER
);
```

## 💻 Steps to Run Locally

Follow these instructions to set up the project on your local machine:

1. Prerequisites

    Node.js (v18.x or later)

    npm or yarn

    A Neon.tech account

2. Clone the Repository
    ```Bash
    git clone <repository-url>
    cd <project-folder>
    ```

3. Install Dependencies
    ```Bash
    npm install
    ```

4. Configure Environment Variables

    Create a file named .env in the root directory and add your connection string:

    ```Code snippet
    # Get this from your Neon Dashboard
    DATABASE_URL="postgresql://[user]:[password]@[host]/neondb?sslmode=require"
    
    # Required for enabling the x-test-now-ms testing features
    TEST_MODE="1"
    ```

5. Run the Application
    ```Bash
    npm run dev
    ```
    The application will be available at http://localhost:3000.

## 📖 API Documentation
    
1. Health Check

    `GET /api/healthz`

    Returns: `{ "ok": true }` (200 OK) if the database is reachable.

2. Create Paste

    `POST /api/pastes`

    Body:
    ```JSON
    {
    "content": "Secret message",
    "ttl_seconds": 3600,
    "max_views": 5
    }
    ```
    Returns: 201 Created with the id and shareable url.


3. Fetch Paste (API)
    
    `GET /api/pastes/:id`

    - Header Support: Supports `x-test-now-ms` (UTC milliseconds) to simulate a specific time for expiry checks.

    - Returns: JSON data of the paste. Returns `404` if expired or view limit reached.

## 🧪 Testing Expiry (Deterministic Time)
This application supports deterministic time testing. You can override the current server time using the x-test-now-ms header.

1. Create a paste with ttl_seconds: 60.

2. Send a GET request to /api/pastes/:id.

3. Add Header: x-test-now-ms: 2524608000000 (Jan 1, 2050).

4. The API will return 404 Not Found because the simulated time is in the future relative to the TTL.

## 🛡️ Security
- No Script Execution: All content is rendered as plain text within `<pre>` tags. React's automatic escaping ensures that any embedded `<script>` tags are rendered as text and not executed.

- Atomic Updates: View counts are decremented directly in the SQL query `(SET remaining_views = remaining_views - 1)` to prevent race conditions during high concurrent traffic.

## 🇮🇳 Timezone Handling
Timestamps are stored in UTC in the database to ensure compatibility with `x-test-now-ms` testing and global consistency. However, the UI displays dates in Indian Standard Time (IST) using the `Asia/Kolkata` timezone for a seamless user experience.