# Code exercise

[About Microservice](#about-microservice)

[About Tests](#about-tests)

[Questions and answers](#questions-and-answers)

## Installing dependencies & running
```sh
npm install

# export Random.org API key before running or in ~/.bashrc:
export RANDOM_ORG=11111111-514a-4632-a6d5-111111111111

```

### Building 
```sh
npm run build
```
### Running tests
```sh
npm test
```
### Cleaning project
```sh
npm run clean
```

### Running

```
$ node dist/server.js --help
usage: server.js [-h] [-v] [-a ADDRESS] [-p PORT] [-m MAX_FORMS]

Microservice example

Optional arguments:
  -h, --help            Show this help message and exit.
  -v, --version         Show program's version number and exit.
  -a ADDRESS, --address ADDRESS
                        Listening address default=0.0.0.0
  -p PORT, --port PORT  Listening port default=3001
  -m MAX_FORMS, --max-forms MAX_FORMS
                        Maximum forms per POST default=10

```


```sh
# to run server process with defaults
RANDOM_ORG=11111111-514a-4632-a6d5-111111111111 node dist/server.js
# or 
node dist/server.js # if ENV var is already exported
# will start process on 0.0.0.0:3001 with limit of 10 forms per post

```


## About Microservice

Microservice is written using TypeScript on top of Express running on node.js.

There are two endpoints implemented:
- POST /api/forms/new
- GET /api/forms/stats

If service respond with error, `failures` value, handled by the `AppFormsStats` class, is increased.

### POST /api/forms/new

Endpoint receives array of `ApplicationFormRaw` and returns `Array<ApplicationFormResponseValid | ApplicationFormResponseInvalid>;`. 

If form item is valid `ApplicationFormResponseValid` is returned at corresponding index containing newly created `id`  (UUID). 

Every valid form increases `forms_valid` value handled by the `AppFormsStats` class.  

```ts

interface ApplicationFormResponseValid {
    success: true;
    id: string;
}
```
In case of invalid form, `ApplicationFormResponseInvalid` is returned at corresponding index containing array of fields that are invalid (missing or pattern error).

Every invalid form increases `forms_invalid` value handled by the `AppFormsStats` class. 

```ts
interface ApplicationFormResponseInvalid {
    success: false;
    invalid_fields: string[];
}
```


#### Input

Accepts array of forms.  Array of `length=1` for single item to maximum defined as parameter (defaults to 10).

```ts
[
   {
    name: 'xxxxxxxxxxxxxxxxxxxx',
    address: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    dob: '1980/03/06',
    occupation: 'xxxxxxxxxxxxxxxxxxxx'
  },
   {
    name: 'xxxxxxxxxxxxxxxxxxxx',
    address: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    dob: '1980/55/55',
    occupation: ''
  }
]
```

#### Output
```ts
[
  {
    "success": true,
    "id": "efac8ec0-688f-4f03-b4ad-17c4a0a4dabb"
  },
  {
    "success": false,
    "invalid_fields": [
      "dob",
      "occupation"
    ]
  }
]
```

#### Stored

If form item valid, it will be stored in-memory using `AppFormsStore` class as implementation of `ApplicationForm` interface.
```ts
{
    "id": "5f182183-79d0-45e5-a6d8-ad9c536b60c6",
    "name": "xxxxxxxxxxxxxxxxxxxx",
    "dob": "1980-03-05T23:00:00.000Z",
    "address": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "occupation": "xxxxxxxxxxxxxxxxxxxx",
    "created_at": "2020-03-14T13:21:42.417Z"
}
```


### GET /api/forms/stats





## About Tests

Tests are written using Jasmine in deterministic manner. All calls to Random.org are mocked. 

In case of RandomOrg API client tests, all POST calls to Random.org API endpoints are also mocked allowing us to test logic without burden of network/infrastructure instabilities on Random.org side. 

## Questions and answers

**Q**: Is there a limitation of the maximum forms being posted? [DD] You decide the limit and explain why.

**A**: There should be limit. If this endpoint is being used for bulk Application Form transfer as an automation between systems, then limit should be higher.

If selected forms are result of human intervention then limit should be in line with expected UI limitations. 

Either way, main thing to consider is what load to infrastructure it will incur.

For this specific example, problematic is Random.org API quotas. When used limit of 100 forms, when running tests, quota was spent very quickly (several tests executions).



**Q**: Should the API key for Random.org API be passed as a command-line argument for the server process? [DD] That’s up to you, but explain why you choose this approach.

**A**: Secrets (API keys) shouldn't be stored in repository. 
I've considered command-line argument approach but decided for environment variable as it is safer alternative (no record in ~/.bash_history, no direct contact). Environment variables are also supported by AWS Lambda so this service could be implemented in Serverless environment.
