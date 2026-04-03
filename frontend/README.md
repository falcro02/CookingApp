# Cooking - Frontend

## Project tree

```text
- public                # Static assets like images
- src                   # Frontend's React code
    - api               # Wrapper functions for API calls
    - components        # Shares React nodes
        - groceries     # Groceries page components
        - groceriesForm # Fill with AI page components
        - ideas         # AI-generated ideas page components
        - ingredients   # Ingredients page components
        - plans         # Plans page components
        - profile       # Profile page components
    - context           # React context providers
    - hooks             # Frontend support logic and reducers
    - pages             # React entrypoints for pages
```

# Usage

The `frontend` folder is a workspace of the `project.json` found in the root.
This means that the main commands used for launching it can be run from the
project root folder (recommended).

Before launching the app, you'll need to install dependencies: to do so, run
the following command.

```sh
npm install
```

This will install all required dependencies.

To show which commands are available, you can run the command below.

```sh
npm run
```

The `frontend/package.json` offers the following scripts.
These are similarly exposed also in the root `package.json`, bridging between
folders (explained later).

```sh
npm run dev     # Run the frontend in local/development mode
npm run build   # Build the static site from React code
npm run lint    # Analyze the code for warnings and errors
npm run preview # Serve the built static site
```

As said, it is advised to run the frontend from the root folder, especially
because the loaded `.env` file, for it being more portable, can comprehend
secrets for the backend also, and might be thus distributed in a one-for-all
manner.

From the root `package.json`, the following are the scripts used for operating
on the frontend.

```sh
npm run fmt            # Prettify the whole codebase (frontend also)
npm run frontend:dev   # Run the frontend in local/development mode
npm run frontend:build # Build the static site from React code
npm run frontend:lint  # Analyze the code for warnings and errors
npm run frontend:run   # Build and serve the static site
npm run deploy         # Deploy the whole application (frontend also)
```

# Secrets

The frontend requires the following env var loaded in the `.env` file.

| Name                     | Description                  |
| ------------------------ | ---------------------------- |
| VITE_USER_POOL_ID        | Cognito directory identifier |
| VITE_USER_POOL_CLIENT_ID | Cognito app client ID        |
| VITE_COGNITO_DOMAIN      | Hosted authentication domain |
| VITE_API_URL             | Backend API endpoint         |
| VITE_SITE_URL            | Frontend application URL     |

# Development

When launching the app with `npm run dev` or `npm run frontend:dev`, the
application is run with the `DEV=1` env var.
When such var is on, the application can run fully locally, bypassing steps
requiring internet connection (like authentication), and in general simplifying
the whole development process itself.
For example, operations like retrieving some user information or retrieving
request headers (along side the whole auth process) is skipped.
