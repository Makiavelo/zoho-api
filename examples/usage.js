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

let query = "select Last_Name, Account_Name.Parent_Account, Account_Name.Parent_Account.Account_Name, First_Name, Full_Name, Created_Time from Contacts where Last_Name is not null limit 200";
api.coql(query)
    .then((response) => {
        console.log('Got COQL results!');
        console.log(response.data);
    });