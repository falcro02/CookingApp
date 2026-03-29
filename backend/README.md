# Backend

This is the backend for the Cooking App, built using **AWS SAM (Serverless Application Model)**.

## Tech Stack

-   **Runtime**: Node.js 24.x
-   **Framework**: AWS SAM (Lambda + API Gateway)
-   **Database**: DynamoDB (Single Table Design)
-   **AI**: AWS Bedrock (Claude 4.5 Haiku)
-   **Testing**: Jest

## Structure

-   `src/handlers/`: Lambda function entry points.
-   `src/services/`: Business logic.
-   `src/dto/`: Data Transfer Objects for API requests/responses.
-   `tests/`: Unit and integration tests.

## Local Development

The backend uses **Docker Compose** to run a local instance of DynamoDB.

1. **Start Local Environment**:

    ```bash
    npm run dev
    ```

    This command starts DynamoDB, initializes the `CookingAppData` table, opens the admin GUI, and starts the SAM local API.

2. **DynamoDB Admin GUI**:
   Available at http://localhost:8001 once the dev server is running.

3. **SAM Local API**:
   The API is exposed at http://localhost:3000.

## Available Scripts

-   `npm run dev`: Full local setup (DB + API).
-   `npm run start`: Start only the SAM local API (requires DB already running).
-   `npm run test`: Run unit tests.
-   `npm run build`: Run `sam build`.
-   `npm run db:start`: Start DynamoDB local container.
-   `npm run db:gui`: Open DynamoDB admin interface.

## Deployment

The backend is deployed via SAM:

```bash
npm run deploy
```

_Note: This is usually called from the root via `npm run deploy`._
