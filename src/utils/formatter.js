'use strict';

/**
 *
 * @param {int} code
 * @param {string} message
 * @param {object} data
 * @return {{payload: {}, responseText: *, responseCode: *}}
 */
export function formatResponse(code, message, data = {}) {
    return {
        responseCode: code,
        responseText: message,
        payload: data
    };
}
