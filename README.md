# Cooking Web App

## Features

### Grocery generation

Users can set up a list of all the meals they intend to consume during the week.
This comprehends breakfast, launch, and dinner, and additional snacks.
Moreover, the user can also select a set of week days in which it is available to go and buy groceries.
The AI assistant then takes over, generating a groceries list for each of the selected days, so that what's bought will fulfill the whole preparation of the days-after meals, ingredient-wise.

### Suggestions creation

Often times people forget to plan ahead what to eat, and what's home feels either insufficient or unenjoyable.
It is possible for users to prompt the AI assistant telling which ingredients are available in the house, for then receiving a set of possible meal ideas plausible to prepare and eat.

## Services potentially used

- Amazon DinamoDB: NoSQL DB
- AWS Lambda: endpoints implementation
- Amazon API Gateway: endpoints exposure
- Amazon Amplify Hosting: dynamic frontend hosting
- Amazon Cognito: auth via identity providers
- Amazon BedRock: use of pre-trained models