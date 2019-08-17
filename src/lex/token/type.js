/**
 * @type {Readonly<{OPERATOR: number, CONST: number, IDENTIFER: number, ERROR: number, KEYWORDS: number}>}
 */
const TOKEN_TYPE = Object.freeze({
    ERROR:      0,
    IDENTIFER:  1,
    CONST:      2,
    OPERATOR:   3,
    KEYWORDS:   4
});

export default TOKEN_TYPE;
