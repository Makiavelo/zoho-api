# Zoho API
Simple access to Zoho REST APIs

# Install
```
npm i zoho-api
```

# Setup
## Generate initial Grant Token (one time only)
The library requires a tokens file in JSON format where it stores the access and refresh tokens. To set this up, a grant token is required, which should be generated in the Zoho Developer console: https://api-console.zoho.com/

Click on '+ Add new client' -> Self-client

After that, click on the newly created client and go to the "Generate Code" tab. On the scopes input you can use any Zoho scopes that you need, for example:

```
ZohoCRM.modules.ALL,ZohoCRM.settings.ALL,ZohoCRM.coql.READ
```

Choose the time duration (10 mins if you need time to run the setup script)

You can leave Scope Description empty.

Click on 'Create' and a token will be displayed, copy that token.

## Execute a setup script
In the examples library there's a setup script to copy, but I'll mark all the steps here:

1) Create a file called 'setup.js' in the root of your project.

2) Paste the following code:
```javascript
const Zoho = require('zoho-api');

const api = new Zoho.Api({
    clientId: '1000.XXXXXXXXXXXXXXXXXXXXXXXXX',
    clientSecret: '1111xx...........',
    tokenFile: __dirname + '/path/to/tokens.json', // Absolute path from current directory
    setup: true
});

api.setup('1000.YYYYYYYYYYYYYYYYYYYYYY')
    .then((response) => {
        console.log('Tokens file generated!');
    })
    .catch((err) => {
        console.log('Something failed!');
        console.log(err);
    });
```

Replace with your clientId and clientSecret. For the 'tokenFile' config, just specify the file where you want to store your OAuth tokens, if the file doesn't exist, it will be created.

Use the grant token generated earlier to set it as the parameter for 'api.setup'.

3) Run the script:
```
node setup.js
```

4) If everything went well, the tokens file should have been created in the specified location, and a success message will be shown.

5) Delete the setup file.

# Usage
In the examples directory check the 'usage.js' file for reference. Copying here an usage example:

```javascript
const Zoho = require('zoho-api');

const api = new Zoho.Api({
    clientId: '1000.XXXXXXXXXXXXXXXXXXXXXXXXX',
    clientSecret: '011zzz.....................',
    tokenFile: __dirname + '/files/tokens.json' // Absolute path from current directory
});

api.api('GET', '/settings/modules')
    .then((response) => {
        console.log('Got data!');
        console.log(response.data);
    });
```

The api is just a wrapper around the REST API, it only simplifies the token generation and re-utilization process. All the REST methods can be checked in the official docs: https://www.zoho.com/crm/developer/docs/api/v2/modules-api.html

Format:
```javascript
api.api('METHOD', '/path/to/endpoint')
```

Examples:
```javascript
api.api('GET', '/Leads');
api.api('GET', '/Accounts');
```

# COQL (Query API)
The query API allows clients to query Zoho modules as if they were SQL tables, check official docs about it: https://www.zoho.com/crm/developer/docs/api/v2/COQL-Overview.html

Example:
```javascript
let query = "select Last_Name, Account_Name.Parent_Account, Account_Name.Parent_Account.Account_Name, First_Name, Full_Name, Created_Time from Contacts where Last_Name is not null limit 200";
api.coql(query)
    .then((response) => {
        console.log('Got COQL results!');
        console.log(response.data);
    });
```

