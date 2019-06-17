import {ExceptionCode} from './code';

/**
 * @desc base exceptions
 * @param {string} message
 * @return {void}
 */
class Exception extends Error {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = Exception.name;
        this.code = ExceptionCode;
    }
}

export default Exception;
