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

GET api/plans

POST api/plans/{planNr}/meals

DELETE api/plans/{planNr}/meals/{itemID}

PATCH api/plans/{planNr}/meals/{itemID}

DELETE api/plans/{planNr}

