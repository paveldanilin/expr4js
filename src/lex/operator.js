/**
 * @type {Readonly<{DIF: number, COMMA: number, OR: number, MOD: number, DEC: number, QUOTE_SINGLE: number, MUL: number, IN: number, LT: number, DOT: number, OPEN_PAR: number, SUM: number, EQ: number, GT: number, DIV: number, NOT: number, CLOSE_PAR: number, GET: number, AND: number, LET: number, QUOTE_DOUBLE: number, NEQ: number, WS: number, INC: number}>}
 */
const OPERATOR = Object.freeze({
    GT:         100, // >
    LT:         101, // <
    GET:        102, // >=
    LET:        103, // <=
    EQ:         104, // ==
    NEQ:        105, // !=
    DOT:        106, // .
    WS:         107, // ' '
    AND:        108, // and
    OR:         109, // or
    DIV:        110, // /
    DIF:        111, // -
    MUL:        112, // *
    SUM:        113, // +
    OPEN_PAR:   114, // (
    CLOSE_PAR:  115, // )
    IN:         116, // ? (const) ? (object/const[string])
    COMMA:      117,
    MOD:        118, // %
    NOT:        119, // !
    QUOTE_SINGLE: 120, // '
    QUOTE_DOUBLE: 121, // "
    INC:         122, // ++
    DEC:         123 // --
});

export default OPERATOR;
