# AWS SAM (Serverless Application Model)

The Cooking Web App uses **AWS SAM** to manage infrastructure as code (IaC). SAM is an open-source framework that extends AWS CloudFormation, providing a simplified syntax for defining serverless resources.

## Why SAM?

Instead of complex CloudFormation templates, SAM allows us to define:

- **Functions**: Lambda functions with simple event triggers.
- **APIs**: Restful endpoints with built-in CORS and Auth.
- **Tables**: DynamoDB tables with high-level properties.

## The Core: `template.yaml`

The `template.yaml` file in the root directory is the "blueprint" of the entire application. It defines:

- **Parameters**: Dynamic values like `TableName` and `AppRegion`.
- **Globals**: Shared settings for all Lambda functions (e.g., Timeout, Memory, Environment Variables).
- **Resources**: The actual AWS components (Cognito User Pool, API Gateway, DynamoDB Table, and all Lambda functions).
- **Outputs**: Key information generated after deployment (e.g., the final API URL).

## Configuration: `samconfig.toml`

The `samconfig.toml` file stores your deployment preferences. It remembers things like your stack name (`cooking-web-stack`), your S3 bucket for code storage, and your region (`eu-south-1`). This ensures that everyone working on the project uses the same deployment settings.
