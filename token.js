const debug = require('debug')('zoho-api:oauth:token');

/**
 * Model for tokens used by Oauth
 */
class Token {
    constructor(data) {
        this.data = data;
    }

    /**
     * Check if the token has no data in it
     * 
     * @returns {boolean}
     */
    empty() {
        if (!this.data) {
            return true;
        }

        return false;
    }

    getData() {
        return this.data;
    }

    setData(data) {
        this.data = data;
        return this;
    }

    /**
     * Check if the token expired, based on it's Time To Live and the
     * creation date.
     * 
     * @returns {boolean}
     */
    expired() {
        let issuedAt = this.data.issuedAt;
        let ttl = this.data.expires_in;
        let now = Math.floor(Date.now() / 1000);

        debug('Issed at: ' + issuedAt);
        debug('ttl: ' + ttl);
        debug('now: ' + now);
        debug('Diff: ' + (now - issuedAt));

        if ((now - issuedAt) >= (ttl + 10)) {
            return true;
        }

        return false;
    }

    /**
     * Get the access token
     * 
     * @returns {string}
     */
    accessToken() {
        return this.data.access_token;
    }

    /**
     * Get the refresh token
     * 
     * @returns {string}
     */
     refreshToken() {
        return this.data.refresh_token;
    }
}

module.exports = Token;
