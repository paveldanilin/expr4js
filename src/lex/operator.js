const OPERATOR = {
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
};

export default OPERATOR;
