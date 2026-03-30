# AWS Services Technical Details

This document provides a deep dive into the configuration and implementation of AWS services within the Cooking Web App.

## Compute: AWS Lambda (The Engine)

In this project, **AWS Lambda** is not just a place to run code; it's the core of our "Micro-Lambda" architecture. Instead of one large backend, we've broken down the logic into independent, specialized functions.

### Architecture: The "Micro-Lambda" Approach

Each major feature (Meals, Pantry, Groceries, Ideas, Plans) has its own dedicated Lambda function.

- **Isolation**: A bug in the `PantryFunction` won't crash the `MealFunction`.
- **Granularity**: If users are checking their grocery lists frequently, only the `GroceryFunction` scales up, saving costs.
- **Specialized Resources**: AI-heavy functions (like `GroceryWorker`) have more memory and longer timeouts than simple CRUD functions.

### How they work: API Gateway & Handlers

1.  **Proxy Integration**: API Gateway acts as a "proxy". It takes the entire HTTP request and passes it as a JSON `event` to the Lambda function.
2.  **The Handler**: Every function starts at a `lambdaHandler` (in `/src/handlers`). This handler is responsible for:
    - Extracting the `userId` from the Cognito context (claims).
    - Routing the request based on `httpMethod` (GET, POST, etc.).
    - Returning a standardized JSON response using the `buildResponse` utility.

### Worker vs. API Functions

We distinguish between two types of Lambdas:

- **API Functions**: Triggered directly by the user via HTTP. They must be fast (low timeout) to keep the UI responsive.
- **Worker Functions**: Triggered internally by API Functions. They handle the "heavy lifting" like AI generation. This allows the API to return a `taskID` immediately while the Worker runs in the background.

### Environment & Configuration

- **Runtime**: Node.js 24.x (using modern ESM syntax).
- **Environment Variables**: We use `TABLE_NAME` to ensure each function knows exactly which DynamoDB table to talk to.
- **Bundling**: We use **esbuild** to "tree-shake" the code, removing unused libraries and minifying the final package. This keeps "cold starts" extremely fast.

---

## Data: Amazon DynamoDB

We utilize DynamoDB for its millisecond latency and seamless scaling.

### Table Configuration

- **Billing Mode**: `PAY_PER_REQUEST` (On-demand), ensuring zero cost when idle and infinite scaling during meal-planning rushes.
- **Data Lifecycle**: **Time-to-Live (TTL)** is enabled on the `ttl` attribute, allowing for automatic cleanup of transient data without manual overhead (e.g. counter of generated meals for the day).
- **SDK**: Built with `@aws-sdk/lib-dynamodb`, leveraging the `DynamoDBDocumentClient` to automatically handle JSON-to-AttributeValue marshaling.

---

## Intelligence: Amazon Bedrock (AI)

The "Smart" features of the app are powered by **Amazon Bedrock**, orchestrating the **Anthropic Claude Haiku 3.5** model.

### AI Workflow (Grocery & Ideas)

1.  **Context Assembly**: The service fetches User Preferences (dietary, allergies), current Pantry items, and Planned Meals.
2.  **Prompt Engineering**: A structured system prompt is generated, instructing the model to return **only** a valid JSON array of specific objects.
3.  **Strict JSON Enforcement**: The prompt includes specific examples and constraints (e.g., "Assign each ingredient to the latest shopping day BEFORE the meal").
4.  **Error Handling**: If the AI returns invalid JSON, the system catches the error, marks the background Task as failed, and logs it to CloudWatch for debugging.

---

## Security: Amazon Cognito

User identity is managed by a dedicated **Cognito User Pool**.

### Authentication Features

- **Social Integration**: Integrated with **Google Identity Provider** via Hosted UI and OAuth 2.0.
- **Hosted UI Domain**: `cooking-app-auth` manages the login/signup flow.
- **Attribute Mapping**: Google `email` and `sub` (unique ID) are mapped directly to Cognito attributes.
- **JWT Authorization**: API Gateway validates the ID Token and injects the `sub` into the Lambda `event.requestContext`, ensuring every DB query is scoped to the correct user.

---

## Observability & Management

- **CloudWatch Logs**: All Handlers and Workers log structured JSON, including request IDs and detailed error stacks.
- **Application Insights**: Automatically monitors Lambda throttles, DynamoDB latencies, and API Gateway 5xx errors, providing a holistic dashboard for system health.
- **AWS SAM & CloudFormation**: The entire stack is defined in `template.yaml`, enabling "Infrastructure as Code" (IaC) for consistent deployments across environments.
