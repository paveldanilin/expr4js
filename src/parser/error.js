/**
 * @type {Readonly<{UNEXPECTED_TOKEN_SEQ: {MSG: string, CODE: number}, UNEXPECTED_TOKEN: {MSG: string, CODE: number}, UNABLE_PARSE_EXPR: {MSG: string, CODE: number}}>}
 */
const PARSER_ERROR = Object.freeze({
  UNEXPECTED_TOKEN: {
    MSG: 'Unexpected token',
    CODE: 2000
  },
  UNEXPECTED_TOKEN_SEQ: {
    MSG: 'Unexpected end of tokens sequence',
    CODE: 2001
  },
  UNABLE_PARSE_EXPR: {
    MSG: 'Unable to parse expression',
    CODE: 2002
  }
});

export default class ParserError {
  constructor(code, msg, token) {
    this._code = code;
    this._msg = msg;
    this._token = token;
  }

  getToken() {
    return this._token;
  }

  getCode() {
    return this._code;
  }

  getMessage() {
    return this._msg;
  }

  static create(code, msg, token) {
    return new ParserError(code, msg, token);
  }

  static UnexpectedToken(token) {
    return ParserError.create(PARSER_ERROR.UNEXPECTED_TOKEN.CODE, PARSER_ERROR.UNEXPECTED_TOKEN.MSG, token);
  }

  static UnexpectedTokenSeq() {
    return ParserError.create(
        PARSER_ERROR.UNEXPECTED_TOKEN_SEQ.CODE,
        PARSER_ERROR.UNEXPECTED_TOKEN_SEQ.MSG,
        null
    );
  }

  static UnableParseExpr() {
    return ParserError.create(PARSER_ERROR.UNABLE_PARSE_EXPR.CODE, PARSER_ERROR.UNABLE_PARSE_EXPR.MSG, null);
  }
}
