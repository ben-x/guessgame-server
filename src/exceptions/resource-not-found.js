import {ResourceNotFoundExceptionCode} from './code';
import Exception from './exception';

/**
 * @param {string} message
 * @param {string} type
 * @param {object} meta
 * @return {void}
 */
class ResourceNotFoundException extends Exception {
    constructor(message, type, meta) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = ResourceNotFoundException.name;
        this.code = ResourceNotFoundExceptionCode;
        this.type = type; // type of resource
        this.meta = meta;
    }
}

export default ResourceNotFoundException;
