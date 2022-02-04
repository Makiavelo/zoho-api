const debug = require('debug')('zoho-api:oauth');
const fs = require('fs');
const _ = require('lodash');
const Token = require('./token');

/**
 * Manage Oauth storage and tokens
 */
class Oauth {
    constructor(options = {}) {
        this.file = _.get(options, 'file', '');
    }

    /**
     * Validate that the tokens file exists
     * 
     * @returns {boolean}
     */
    validFile() {
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
    saveFile(json) {
        try {
            let data = this.getAllTokens();
            if (!data) {
                data = this.getDefaultStructure();
            } else {
                // Keep latest 9 records
                data.tokenResponses = _.takeRight(data.tokenResponses, 9);
            }

            json.issuedAt = Math.floor(Date.now() / 1000);

            // Update the refresh token if it's available in the response
            let refreshToken = _.get(json, 'refresh_token');
            if (refreshToken) {
                data.refreshToken = refreshToken;
            }

            // Add latest record
            data.tokenResponses.push(json);
            debug(data);

            fs.writeFileSync(this.file, JSON.stringify(data));
        } catch (err) {
            debug('Failed to save to tokens file');
            throw err;
        }
    }

    /**
     * Get the default json structure for the tokens file
     * 
     * @returns {object}
     */
    getDefaultStructure() {
        return {
            refreshToken: '',
            tokenResponses: []
        };
    }

    /**
     * Get the contents of the token file as an object
     * 
     * @returns {object}
     * @throws
     */
    getAllTokens() {
        try {
            const json = fs.readFileSync(this.file, 'utf8')
            if (json) {
                let data = JSON.parse(json);
                debug(data);
                return data;
            } else {
                return false;
            }
        } catch (err) {
            return null;
        }
    }

    /**
     * Get the latest token generated from the tokens file
     * 
     * @returns {Token}
     */
    getLatestToken() {
        let tokens = this.getAllTokens();
        debug('Tokens: ');
        debug(tokens);
        if (tokens && tokens.tokenResponses) {
            let token = new Token(_.last(tokens.tokenResponses));
            return token;
        }

        return false;
    }

    /**
     * Get the latest refresh token
     * 
     * @returns {string}
     */
    refreshToken() {
        let tokens = this.getAllTokens();
        return _.get(tokens, 'refreshToken', '');
    }
}

module.exports = Oauth;
