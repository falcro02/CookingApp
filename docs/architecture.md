# Backend Architecture

The Cooking Web App backend is a high-performance, **Serverless Micro-services** ecosystem built on AWS. It is designed for maximum scalability while maintaining a clean separation of concerns through a layered architectural pattern.

## Request/Response Lifecycle

Every request follows a standardized journey through the system:

1.  **Ingress**: The request hits **Amazon API Gateway**.
2.  **Authentication**: The **Cognito Authorizer** validates the JWT token in the `Authorization` header.
3.  **Bypass (Local)**: If running locally (`AWS_SAM_LOCAL`), the handler bypasses Cognito and uses a mock user ID (`USER#LOCAL_TEST_ID`).
4.  **Routing**: The specific **Lambda Handler** receives the event, parses the `httpMethod` and `pathParameters`, and routes to the appropriate service method.
5.  **Business Logic**: The **Service Layer** executes domain logic, validates input (e.g., `weekDay` range), and coordinates between different repositories.
6.  **Data Access**: The **Repository Layer** interacts with **DynamoDB** using the `AWS SDK V3`.
7.  **Exit**: A standardized response is built using the `buildResponse` utility, ensuring consistent CORS headers and JSON formatting.

## Modular Layered Pattern

The codebase is strictly organized to ensure maintainability:

- **Handlers (`/src/handlers`)**: The "entry points". They are lean and only handle HTTP-related concerns (parsing, status codes).
- **Services (`/src/services`)**: The "brain". This is where business rules live. Services are reusable and independent of the transport layer (HTTP/Events).
- **Repositories (`/src/repositories`)**: The "data gatekeepers". They abstract DynamoDB complexities.
- **Entities (`/src/entities`)**: Define the structure of data as it exists in DynamoDB.
- **DTOs (`/src/dto`)**: Data Transfer Objects for specific cross-service communications (e.g., IA worker payloads).

## Single-Table Design (DynamoDB)

We use a single DynamoDB table (`CookingAppData`) to store all application entities. This minimizes round-trips and simplifies resource management.

### Identity Pattern

- **Partition Key (PK)**: `USER#<cognito_sub_guid>`
- **Sort Key (SK)**: Used for item typing and relationships.

### SK Mapping Table

| Entity                 | SK Pattern            | Example                   |
| :--------------------- | :-------------------- | :------------------------ |
| **Meal**               | `MEAL#<timestamp_id>` | `MEAL#1710765432000`      |
| **Grocery Item**       | `GROCERY#<id>`        | `GROCERY#1710765432000_1` |
| **User Preference**    | `PREFERENCES`         | `PREFERENCES`             |
| **Current Plan**       | `CURRENT_PLAN`        | `CURRENT_PLAN`            |
| **Background Task**    | `TASK#<task_id>`      | `TASK#abc-123`            |
| **Generation Counter** | `COUNTER#<date>`      | `COUNTER#2024-03-22`      |

## Specialized Worker Pattern (Async AI)

For long-running tasks like AI generation, we use an **Asynchronous Worker Pattern**:

1.  The User requests a generation (e.g., `/groceries/generate`).
2.  The **Main Lambda** creates a `TASK` record in DynamoDB with status `0` (Running) and returns the `taskID` immediately.
3.  The **Main Lambda** invokes the **Worker Lambda** asynchronously.
4.  The **Worker Lambda** communicates with **Amazon Bedrock**, processes the result, updates the database, and finally marks the `TASK` as `1` (Completed) or `-1` (Failed).
5.  The Frontend polls the `/tasks/{taskID}` endpoint to track progress.

## Local Development & Mocking

The system detects environmental flags to facilitate development:

- **`AWS_SAM_LOCAL`**: Bypasses Cognito authentication.
- **`USE_LOCAL_DYNAMODB`**: Redirects traffic to `http://host.docker.internal:8000` for local testing.
