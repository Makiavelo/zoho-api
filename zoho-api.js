const debug = require('debug')('zoho-api');
const axios = require('axios');
const _ = require('lodash');
const qs = require('qs');
const Oauth = require('./oauth');

/**
 * Simplify access to Zoho APIs
 * 
 * A one-time only call to the 'setup' method is required using a grant token
 * which can be generated on the zoho developers section.
 * Create a file to execute only that function, which creates a tokens file to
 * hold the refresh token which never expires unless revoked.
 * 
 * Example: setup.js
 * 
 * const Zoho = require('zoho-api');
 * const api = new Zoho({
 *      tokenFile: '/absolute/path/to/file.json',
 *      setup: true
 * });
 * 
 * api.setup('1000.xxxxxxx.....');
 * 
 */
class ZohoApi {
    constructor(options) {
        this.options = _.defaultsDeep(options, this.defaultOptions());
        this.accessToken = '';

        this.oauth = new Oauth({ file: this.opt('tokenFile') });

        this.axios = axios.create({
            baseURL: this.opt('apiBaseUrl'),
            headers: this.opt('headers')
        });

        if (!this.opt('setup')) {
            this.checkSetup();
        }
    }

    /**
     * Build the default options object
     * 
     * @param {object} options 
     * @returns {object}
     */
    defaultOptions(options) {
        let defaults = {
            apiBaseUrl: 'https://www.zohoapis.com/crm/v2',
            oauthUrl: 'https://accounts.zoho.com/oauth/v2/token',
            clientId: '',
            clientSecret: '',
            refreshToken: '',
            tokenFile: '',
            headers: {}
        };

        return defaults;
    }

    /**
     * Get an option from this.options
     * 
     * @param {string} path Path where the option is stored (lodash paths)
     * @param {mixed} defaultValue Any default value
     * @returns {mixed}
     */
    opt(path, defaultValue = null) {
        return _.get(this.options, path, defaultValue);
    }

    /**
     * Check the oauth setup is correct, throw exception if it's not
     * 
     * @throws
     */
    checkSetup() {
        if (this.oauth.validFile()) {
            let token = this.oauth.getLatestToken();
            if (!token) {
                throw 'No tokens found in tokens file, run "setup" function with a grant token';
            }
        } else {
            throw 'No tokens file available, run "setup" function with a grant token';
        }
    }

    /**
     * Setup oauth requirements for api calls.
     * 
     * This method requires a grant token which is generated in the developers section
     * inside Zoho. This token can be used only once.
     * 
     * This function generates the tokens file and the refresh token (which doesn't expire)
     * so as long as the tokens file exists, it shouldn't be called again.
     * 
     * @param {string} grantToken One-time use token generated at Zoho
     * @returns {Promise}
     */
    async setup(grantToken) {
        let params = {
            grant_type: 'authorization_code',
            client_id: this.opt('clientId'),
            client_secret: this.opt('clientSecret'),
            code: grantToken
        };
        
        let url = this.opt('oauthUrl') + '?' + qs.stringify(params);

        return this.api('POST', url, {}, { auth: false })
            .then((response) => {
                this.oauth.saveFile(response.data);
                this.options.accessToken = response.data.access_token;
                debug('Tokens file created successfully!');
                debug('Path: ' + this.oauth.file);
            });
    }

    /**
     * Perform a request against the Zoho REST API
     * 
     * @param {string} method 
     * @param {string} path 
     * @param {object} params 
     * @param {object} config 
     * @returns 
     */
    async api(method, path, params, config) {
        if (_.get(config, 'auth', true) === true) {
            await this.auth();
        }

        let options = {
            method: method,
            url: path,
            data: params
        }

        debug('Current access token: ' + this.opt('accessToken'));
        if (this.opt('accessToken')) {
            options.headers = {
                'Authorization': 'Zoho-oauthtoken ' + this.opt('accessToken')
            }
        }

        return this.axios(options)
            .then((response) => {
                debug('Got response!');
                debug(response.data);

                if (response.data.error) {
                    debug(response);
                    throw response;
                }

                return response;
            })
            .catch((error) => {
                debug(error);
                throw error;
            });
    }

    /**
     * Get an access token from the tokens file, refresh it if necessary
     * and then set the access token for future requests.
     * 
     * @returns {Promise}
     */
    async auth() {
        return new Promise((resolve, reject) => {
            let token = this.oauth.getLatestToken();
            if (!token) {
                throw 'No tokens found in tokens file, run "setup" function with a grant token';
            } else if (token.expired()) {
                let params = {
                    grant_type: 'refresh_token',
                    client_id: this.opt('clientId'),
                    client_secret: this.opt('clientSecret'),
                    refresh_token: this.oauth.refreshToken()
                };
                
                let url = this.opt('oauthUrl') + '?' + qs.stringify(params);

                this.api('POST', url, {}, { auth: false })
                    .then((response) => {
                        this.oauth.saveFile(response.data);
                        this.options.accessToken = response.data.access_token;
                        resolve();
                    })
                    .catch((error) => {
                        debug('Failed to refresh expired token');
                        reject();
                    });
            } else {
                debug('auth successfull!');
                debug(token);
                this.options.accessToken = token.accessToken();
                resolve();
            }
        });
    }

    /**
     * Perform a COQL query against Zoho's API
     * 
     * @param {string} query 
     * @returns {Promise}
     */
    async coql(query) {
        return this.api('POST', '/coql', {
            select_query: query
        });
    }
}

module.exports = ZohoApi;
