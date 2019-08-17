/**
 * @type {Readonly<{BAD_IDENTIFER: {MSG: string, CODE: number}, UNKNOWN_OPERATOR: {MSG: string, CODE: number}, BAD_NUMBER: {MSG: string, CODE: number}, PARSE_STRING: {MSG: string, CODE: number}, UNABLE_TO_PUTBACK_NON_TOKEN: {MSG: string, CODE: number}}>}
 */
const LEX_ERROR = Object.freeze({
    PARSE_STRING     : {
        CODE: 1000,
        MSG: 'Unable to parse string'
    },
    UNKNOWN_OPERATOR : {
        CODE: 1001,
        MSG: 'Unknown operator'
    },
    BAD_NUMBER       : {
        CODE: 1002,
        MSG: 'Bad number format'
    },
    BAD_IDENTIFER    : {
        CODE: 1003,
        MSG: 'Bad identifer, identifer allowed cahrs [_a-zA-Z]'
    },
    UNABLE_TO_PUTBACK_NON_TOKEN: {
        CODE: 1004,
        MSG: 'Unable to putback non token object'
    }
});

export default LEX_ERROR;
