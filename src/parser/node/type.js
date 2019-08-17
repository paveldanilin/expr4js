/**
 * @type {Readonly<{FUNCTION_CALL: number, EXPR: number, CONST: number, VARIABLE: number, UNARY_EXPR: number, MEMBER_OF_OBJ: number}>}
 */
const AST_NODE_TYPE = Object.freeze({
    EXPR:           0,
    UNARY_EXPR:     1,
    FUNCTION_CALL:  2,
    CONST:          3,
    VARIABLE:       4,
    MEMBER_OF_OBJ:  5
});

export default AST_NODE_TYPE;
