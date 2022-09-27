const debug = require('debug')('zoho-api:storage');
const fs = require('fs');
const _ = require('lodash');
const Token = require('../token');

/**
 * Manage Oauth file storage
 */
class File {
    constructor(options = {}) {
        this.file = _.get(options, 'tokenFile', '');
        this.token = null;
    }

    /**
     * Validate that the tokens file exists
     * 
     * @returns {boolean}
     */
    valid() {
        try {
            return fs.existsSync(this.file);
        } catch(err) {
            return false;
        }
    }

    /**
     * Save the tokens file with the latest access token added to it
     * 
     * @param {object} json New entry for the token responses
     */
    save(json) {
        try {
            this.token = {};
            this.token.refresh_token = _.get(json, 'refresh_token', '');
            this.token.access_token = json.access_token;
            this.token.api_domain = json.api_domain;
            this.token.token_type = json.token_type;
            this.token.expires_in = json.expires_in;
            this.token.issuedAt = parseInt(Date.now() / 1000);

            fs.writeFileSync(this.file, JSON.stringify(this.token));
        } catch (err) {
            debug('Failed to save to tokens file');
            throw err;
        }
    }

    /**
     * Get the contents of the token file as an object
     * 
     * @param {boolean} reload Force the script to re-open the token file
     * 
     * @returns {Token|null}
     * @throws
     */
    async getToken(reload = false) {
        if (this.token && !reload) {
            return this.token;
        } else {
            try {
                const json = fs.readFileSync(this.file, 'utf8')
                if (json) {
                    let data = JSON.parse(json);
                    debug('Got token');
                    this.token = data;
                    return data;
                } else {
                    return null;
                }
            } catch (err) {
                debug('Error reading token file: %s', JSON.stringify(err, null, 2));
                return null;
            }
        }
    }
}

module.exports = File;
