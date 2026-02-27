# REST API contracts

   >[`POST /signin/apple`](#apple-sign-in)
<br>[`POST /signin/google`](#google-sign-in)
<br>[`GET /groceries`](#get-groceries-list)
<br>[`DELETE /groceries`](#clear-groceries)
<br>[`POST /groceries`](#add-new-item)
<br>[`DELETE /groceries/{itemID}`](#delete-item)
<br>[`PATCH /groceries/{itemID}`](#edit-item-state)
<br>[`POST /groceries/check`](#check-or-uncheck-all-items)
<br>[`POST /groceries/generate`](#generate-items-with-ai)
<br>[`GET /plans`](#get-plans)
<br>[`DELETE /plans/{planNR}`](#delete-plan)
<br>[`POST /meals`](#add-meal-to-plan)
<br>[`DELETE /meals/{itemID}`](#delete-meal-from-plan)
<br>[`PATCH /meals/{itemID}`](#edit-meal-state)
<br>[`GET /ingredients`](#get-pantry-ingredients)
<br>[`DELETE /ingredients`](#clear-pantry-ingredients)
<br>[`POST /ingredients`](#add-new-ingredient)
<br>[`DELETE /ingredients/{itemID}`](#delete-ingredient)
<br>[`PATCH /ingredients/{itemID}`](#edit-ingredient-state)
<br>[`POST /ingredients/import`](#import-from-groceries)
<br>[`POST /ideas/generate`](#generate-ideas-with-ai)
<br>[`GET /ideas`](#get-ideas)
<br>[`DELETE /ideas`](#clear-ideas)
<br>[`GET /preferences`](#get-user-preferences)
<br>[`PUT /preferences`](#update-user-preferences)
<br>[`GET /tasks/{taskID}`](#get-task-status)
<br>[`DELETE /data`](#clear-all-user-data)
<br>[`DELETE /sessions`](#delete-all-active-sessions)
<br>[`DELETE /user`](#delete-user-account)

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

### Clear groceries

Delete all items in the user's groceries list.
This request is idempotent: it doesn't fail if list is already empty.

**Request**

```text
DELETE /groceries
```

**Response**

- 204: all items deleted successfully

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

- 204: item deleted successfully
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

- 204: fields updated successfully
- 400: invalid field
- 404: item not found

### Check or uncheck all items

Check or uncheck all items in the user's groceries list in bulk.
This request is idempotent: if all items are already checked/unchecked it
doesn't fail.

**Request**

```text
POST /groceries/check
```

```json
{
    "check": bool
}
```

**Response**

- 204: operation successful

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
To select a plan, the plan number (1 to 4) is sufficient, as the plan items are
retrieved by the backend autonomously from the DB.
Unplanned meals must be provided as a list of strings containing the meal
description.
Extra textual information is provided with a single string.
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
- 404: plan not found (empty)
- 409: a generation task is already executing for the user
- 429: computation limit reached

```json
{
    "taskID": string
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

- 204: plan deleted successfully

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

- 204: meal deleted successfully
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

- 204: fields updated successfully
- 400: invalid field
- 404: meal not found

## Ingredients

### Get pantry ingredients

Get the list of ingredients already available in the pantry.

Items are returned in a dictionary where the item IDs are the key for an object
with other item's data.

**Request**

```text
GET /ingredients
```

**Response**

- 200: pantry ingredient found

```json
{
    "ingredients": {
        "id-1": {
            "description": string
        },
        "id-2": {
            "description": string
        }
    }
}
```

### Clear pantry ingredients

Empty the list of available ingredients in the pantry.
This request is idempotent: if the list is already empty, no error arises.

**Request**

```text
DELETE /ingredients
```

**Response**

- 204: all elements deleted

### Add new ingredient

Add a new item in the pantry ingredients list.

**Request**

```text
POST /ingredients
```

```json
{
    "description": string
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

### Delete ingredient

Delete an item from the pantry ingredients list.

**Request**

```text
DELETE /ingredients/{itemID}
```

**Response**

- 204: item deleted successfully
- 404: item not found

### Edit ingredient state

Edit the description of an item in the pantry ingredients list.

**Request**

```text
PATCH /ingredients/{itemID}
```

```json
{
    "description": string
}
```

**Response**

- 204: field updated successfully
- 400: invalid field
- 404: item not found

### Import from groceries

Take all items in the groceries list where the check-box is ticked and import
them into the pantry ingredients list.
Items with the same description are not duplicated.
This request is idempotent: if no new item to be imported is found, no error
arises.

**Request**

```text
POST /ingredients/import
```

**Response**

- 204: operation successful

## Ideas

### Get ideas

Get the list of previously generated meal suggestions (ideas).
If ideas list was never generated or if it was cleared (thus absent) no error
arises but the returned JSON payload doesn't contain the ideas key, thus being
empty (`{}`).

**Request**

```text
GET /ideas
```

**Response**

- 200: data returned successfully

```json
{
    "ideas": [
        {
            "name": string,
            "story": string,
            "icon": string
        },
        {
            "name": string,
            "story": string,
            "icon": string
        }
    ]
}
```

### Clear ideas

Clear (delete) the ideas list.
This request is idempotent: if the list was already empty no error is returned.

**Request**

```text
DELETE /ideas
```

**Response**

- 204: list deleted successfully

### Generate ideas with AI

Starting from the list if ingredients found in the pantry and based on the
user's preferences (already available in the backend), a task for generating a
list of meal ideas with AI is started.
Old ideas are deleted.

Generated ideas are not returned: to see the new ideas list use the
[get ideas](#get-ideas) request when the operation concludes.
To check the status of the task it is possible to poll the
[get status](#get-task-status) request with the returned task ID.

**Request**

```text
POST /ideas/generate
```

**Response**

- 202: generation task initialized
- 404: ingredients not found (empty list)
- 409: a generation task is already executing for the user
- 429: computation limit reached

```json
{
    "taskID": string
}
```

## Preferences

### Get user preferences

Get the textual description of user's preferences.
An empty string is valid content, meaning that if the user has not set it, an
empty string is returned with the preferences key.

**Request**

```text
GET /preferences
```

**Response**

- 200: data returned successfully

```json
{
    "preferences": string
}
```

### Update user preferences

Set a new textual description of user's preferences.
An empty string is valid content, therefore this request can be used also to
unset it, by sending an empty string with the preferences key.

**Request**

```text
PUT /preferences
```

```json
{
    "preferences": string
}
```

**Response**

- 204: preferences set successfully
- 400: invalid field

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

## Account

### Clear all user data

Delete all content registered with the user profile (without deleting the
account itself).
This is a way to "reset" a user profile.
This request is idempotent: it doesn't fail if user profile is already clear of
all its data.

**Request**

```text
DELETE /data
```

**Response**

- 204: operation successful

### Delete all active sessions

All active sessions of the user are deleted for all devices in which it had
signed in, essentially making all previously issued JWT tokens of the user
invalid.
This means that the user is required to authenticate again on all devices.

**Request**

```text
DELETE /sessions
```

**Response**

- 204: operation successful

### Delete user account

The user profile is deleted alongside all its data.

**Request**

```text
DELETE /user
```

**Response**

- 204: operation successful

