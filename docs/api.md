# REST API contracts

## Sign in

### Apple sign in

Send ID token received from Apple ID provider and, if valid, get back a JWT
token relative to the newly created session for the user.

**Request**

```text
POST /signin/apple
```

```json
{
    "idToken": string
}
```

**Response**

- 200: user authenticated successfully
- 400: invalid ID token

```json
{
    "jwtToken": string
}
```

### Google sign in

Send ID token received from Google ID provider and, if valid, get back a JWT
token relative to the newly created session for the user.

**Request**

```text
POST /signin/google
```

```json
{
    "idToken": string
}
```

**Response**

- 200: user authenticated successfully
- 400: invalid ID token

```json
{
    "jwtToken": string
}
```

## Groceries

### Get groceries list

Get the list of all items in the groceries list of each week day.

Items are returned in a dictionary where the item IDs are the key for an object
with other item's data.
Week day is represented as an integer between 0 and 6.

**Request**

```text
GET /groceries
```

**Response**

- 200: grocery items found

```json
{
    "groceries": {
        "id-1": {
            "description": string,
            "weekDay": int,
            "checked": bool
        },
        "id-2": {
            "description": string,
            "weekDay": int,
            "checked": bool
        }
    }
}
```

### Add new item

Add a new element manually in the groceries list.

Week day must be represented by an integer between 0 and 6.

**Request**

```text
POST /groceries
```

```json
{
    "description": string,
    "weekDay": int
}
```

**Response**

- 201: new item created
- 400: invalid field

```json
{
    "itemID": string
}
```

### Delete item

Delete an item from the groceries list.

**Request**

```text
DELETE /groceries/{itemID}
```

**Response**

- 200: item deleted successfully
- 404: item not found

### Edit item state

Edit fields of an item in the groceries list.
Fields may be the description, or the check-box state.
Omitted fields are ignored (not updated).

**Request**

```text
PATCH /groceries/{itemID}
```

```json
{
    "description": string,
    "checked": bool
}
```

**Response**

- 200: fields updated successfully
- 400: invalid field
- 404: item not found

### Generate items with AI

Based on input data (available days, chosen plan and extra infos) and based on
user data in the backend (meals plan and preferences), a task for generating a
list of grocery items with AI is started.

Generated items are not returned: to see the updated items list use the
[get groceries](#get-groceries-list) request when the operation concludes.
To check the status of the task it is possible to poll the
[get status](#get-task-status) request with the returned task ID.

In the request schema, available days are represented as a list of integers,
where Monday is 0 and Sunday is 6.
To select a plan, the plan number (0 to 3) is sufficient, as the plan items are
retrieved by the backend autonomously from the DB.
Unplanned meals must be provided as a list of strings containing the meal
description.
Extra textual infos are provided with a single string.
If replace field is false, old items in the groceries list aren't deleted and
new ones are simply appended.

**Request**

```text
POST /groceries/generate
```

```json
{
    "days": [ int ],
    "plan": int,
    "unplanned": [ string ],
    "extra": string,
    "replace": bool
}
```

**Response**

- 202: generation task initialized
- 400: invalid field
- 404: plan not found
- 409: a generation task is already executing for the user

```json
{
    "taskID": string
}
```

## Tasks

### Get task status

The status of ongoing tasks in the server (such as content generation with AI)
can be retrieved by polling this request.
Please poll after at least 2 seconds of delay.

The status of a task is represented by an integer.

- -1: task failed
- 0: task is still running
- 1: task completed successfully

**Request**

```text
GET /tasks/{taskID}
```

**Response**

- 200: task found
- 404: task not found

```json
{
    "status": int
}
```

## Plans

### Get plans

Get the weekly meals plans of the user.

Plans are returned in a dictionary where the key is the plan number shown in
the UI (1-4).
Each plan is itself a dictionary where the item IDs are the key for an object i
with other item's data.
Items' icon identifies the Unicode value of an emoji.
Week day is represented as an integer between 0 and 6.
Empty plans are omitted.

**Request**

```text
GET /plans
```

**Response**

- 200: plans found

```json
{
    "1": {
        "id-1": {
            "description": string,
            "icon": string,
            "weekDay": int
        },
        "id-2": {
            "description": string,
            "icon": string,
            "weekDay": int
        }
    },
    "2": {
        "id-3": {
            "description": string,
            "icon": string,
            "weekDay": int
        }
    }
}
```

### Delete plan

Clear the user's meals plan with the provided number (1-4).
This request is idempotent: if the plan was already empty no error is returned.

**Request**

```text
DELETE /plans/{planNR}
```

**Response**

- 200: plan deleted successfully

## Meals

### Add meal to plan

Create a new meal in a plan.

Items' icon must identify the Unicode value of an emoji.
Week day must be represented by an integer between 0 and 6.
The plan in which to add the meal is identified by a number from 1 to 4.

**Request**

```text
POST /meals
```

```json
{
    "description": string,
    "icon": string,
    "weekDay": int,
    "plan": int
}
```

**Response**

- 201: new item created
- 400: invalid field

```json
{
    "itemID": string
}
```

### Delete meal from plan

Delete a meal from its plan.

**Request**

```text
DELETE /meals/{itemID}
```

**Response**

- 200: meal deleted successfully
- 404: meal not found

### Edit meal state

Edit the description or the emoji of a meal.
Omitted fields are ignored (not updated).

**Request**

```text
PATCH /meals/{itemID}
```

```json
{
    "description": string,
    "icon": string
}
```

**Response**

- 200: fields updated successfully
- 400: invalid field
- 404: meal not found

