const debug = require('debug')('zoho-api:oauth');
const FileStorage = require('./storage/file');
const _ = require('lodash');
const Token = require('./token');

/**
 * Manage Oauth storage and tokens
 */
class Oauth {
    constructor(options = {}) {
        console.log(JSON.stringify(options, null, 2));
        this.storageType = _.get(options, 'storageType', 'file');

        if (this.storageType === 'file') {
            console.log('File storage');
            this.storage = new FileStorage(options);
        } else if (this.storageType === 'custom') {
            this.storage = _.get(options, 'storage');
        }

        if (typeof this.storage === 'undefined' || !this.storage) {
            throw('No storage defined.');
        }
    }

    /**
     * Validate that the tokens file exists
     * 
     * @returns {boolean}
     */
    valid() {
        return this.storage.valid();
    }

    /**
     * Save the tokens file with the latest access token added to it
     * 
     * @param {object} json New entry for the token responses
     */
    save(json) {
        this.storage.save(json);
    }

    /**
     * Get the contents of the token file as an object
     * 
     * @returns {object}
     * @throws
     */
    async getToken() {
        let data = await this.storage.getToken();
        return new Token(data);
    }

    /**
     * Get the latest refresh token
     * 
     * @returns {string}
     */
    async getRefreshToken() {
        let token = await this.getToken();
        if (token) {
            return token.refreshToken();
        }

        return '';
    }
}

module.exports = Oauth;
