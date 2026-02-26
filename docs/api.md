# REST API contracts

## Sign in

### Apple sign in

Send ID token received from Apple ID provider and, if valid, get back a JWT
token relative to the newly created session for the user.

#### Request

```text
POST api/signin/apple
```

```json
{
    "idToken": string
}
```

#### Response

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

#### Request

```text
POST api/signin/google
```

```json
{
    "idToken": string
}
```

#### Response

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

#### Request

```text
GET api/groceries
```

#### Response

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

#### Request

```text
POST api/groceries
```

```json
{
    "description": string,
    "weekDay": int
}
```

#### Response

- 201: new item created
- 400: invalid field

```json
{
    "itemID": string
}
```

### Delete item

Delete an item from the groceries list.

#### Request

```text
DELETE api/groceries/{itemID}
```

#### Response

- 200: item deleted successfully
- 404: item not found

### Edit item state

Edit fields of an item in the groceries list.
Fields may be the description, or the check-box state.
Omitted fields are ignored (not updated).

#### Request

```text
PATCH api/groceries/{itemID}
```

```json
{
    "description": string,
    "checked": bool
}
```

#### Response

- 200: fields updated successfully
- 400: invalid field
- 404: item not found

### Generate items with AI

Based on input data (available days, chosen plan and extra infos) and based on
user data in the backend (meals plan and preferences), a list of grocery items
are generated with AI and returned to the user.

In the request schema, available days are represented as a list of integers,
where Monday is 0 and Sunday is 6.
To select a plan, the plan number (0 to 3) is sufficient, as the plan items are
retrieved by the backend autonomously from the DB.
Unplanned meals must be provided as a list of strings containing the meal
description.
Extra textual infos are provided with a single string.
If replace field is false, old items in the groceries list aren't deleted and
new ones are simply appended.

New items are not returned: after the request eventually responds, the GET api
is to be called separately.

#### Request

```text
POST api/groceries/generate
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

#### Response

- 201: generated items are created successfully
- 400: invalid field
- 404: plan not found

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

#### Request

```text
GET api/plans
```

#### Response

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

#### Request

```text
DELETE api/plans/{planNR}
```

#### Response

- 200: plan deleted successfully

## Meals

### Add meal to plan

Create a new meal in a plan.

Items' icon must identify the Unicode value of an emoji.
Week day must be represented by an integer between 0 and 6.
The plan in which to add the meal is identified by a number from 1 to 4.

#### Request

```text
POST api/meals
```

```json
{
    "description": string,
    "icon": string,
    "weekDay": int,
    "plan": int
}
```

#### Response

- 201: new item created
- 400: invalid field

```json
{
    "itemID": string
}
```

### Delete meal from plan

Delete a meal from its plan.

#### Request

```text
DELETE api/meals/{itemID}
```

#### Response

- 200: meal deleted successfully
- 404: meal not found

### Edit meal state

Edit the description or the emoji of a meal.
Omitted fields are ignored (not updated).

#### Request

```text
PATCH api/meals/{itemID}
```

```json
{
    "description": string,
    "icon": string
}
```

#### Response

- 200: fields updated successfully
- 400: invalid field
- 404: meal not found

