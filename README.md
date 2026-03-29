# Cooking App

A modern, AI-powered meal planning and grocery management application. This project provides a seamless experience for managing your kitchen, planning meals, and generating creative recipe ideas using state-of-the-art AI.

---

## Key Features

- **AI-Powered Meal Ideas**: Generate personalized meal suggestions based on your available ingredients and specific preferences (e.g., "fast recipes", "only pasta").
- **Smart Grocery Management**: Efficiently track your shopping list with AI-assisted verification to ensure you have everything you need.
- **Ingredient Tracking**: Maintain a real-time inventory of your kitchen supplies to reduce waste and simplify planning.
- **Meal Planning**: Organize your weekly meals and sync them across devices.
- **Secure Authentication**: Integrated with AWS Cognito, supporting both email/password and Google Sign-In.
- **Serverless Performance**: A high-performance, cost-effective backend built entirely on AWS Serverless infrastructure.

---

## Tech Stack

### Frontend

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
- **Language**: TypeScript

### Backend

- **Infrastructure**: [AWS SAM](https://aws.amazon.com/serverless/sam/) (Serverless Application Model)
- **Functions**: AWS Lambda (Node.js 24)
- **Database**: DynamoDB (Single Table Design)
- **AI Engine**: [AWS Bedrock](https://aws.amazon.com/bedrock/) (Claude 4.5 Haiku)
- **Auth**: AWS Cognito

---

## Project Structure

- `frontend/`: React + Vite application (UI).
- `backend/`: AWS SAM application (API & Workers).
- `shared/`: TypeScript types and utilities shared between frontend and backend.
- `docs/`: Additional documentation and architecture diagrams.

---

## Getting Started

### Prerequisites

- **Node.js** (v20 or newer)
- **Docker Desktop** (required for local DynamoDB)
- **AWS CLI** (configured with your credentials)
- **AWS SAM CLI** (for local backend and deployment)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/cooking-app.git
   cd cooking-app
   ```
2. Install dependencies for the entire workspace:
   ```bash
   npm install
   ```

---

## Available Commands

Run these from the root directory:

| Command                | Description                                                        |
| ---------------------- | ------------------------------------------------------------------ |
| `npm run backend:dev`  | Starts local DynamoDB, opens GUI, and launches SAM local API.      |
| `npm run frontend:dev` | Starts the Vite development server for the frontend.               |
| `npm run deploy`       | Builds and deploys the backend (SAM) and frontend (S3/CloudFront). |
| `npm run fmt`          | Formats the entire codebase using Prettier.                        |

---

## Local Development Launch

To run the application locally:

1. **Start the Backend**:

   ```bash
   npm run backend:dev
   ```

   _This starts DynamoDB in Docker, initializes tables, and launches the API at port 3000._

2. **Start the Frontend**:
   ```bash
   npm run frontend:dev
   ```
   _The app will be available at [http://localhost:5173](http://localhost:5173)._

---

## Deployment

Ensure you have your AWS environment configured before deploying.

### 1. Configure Environment

Fill the `.env` file with your deployment targets:

- `DEPLOY_S3_BUCKET`
- `DEPLOY_CLOUDFRONT_ID`

### 2. Deploy Everything

```bash
npm run deploy
```

This command builds the Lambda functions, deploys the CloudFormation stack, and syncs the frontend to S3 with a CloudFront invalidation.
