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