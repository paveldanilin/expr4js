import LEX_ERROR from './errorcodes';

export default class LexError {
  constructor(code, msg, pos, token) {
    this.code = code !== undefined ? code : null;
    this.msg = msg !== undefined ? msg : null;
    this.pos = pos !== undefined ? pos : null;
    this.token = token !== undefined ? token : null;
  }

  getToken() {
    return this.token;
  }

  getPos() {
    return this.pos;
  }

  getCode() {
    return this.code;
  }

  getMessage() {
    return this.msg;
  }

  static create(code, msg, pos, token) {
    return new LexError(code, msg, pos, token);
  }

  static UnableToParseString(pos) {
    return this.create(LEX_ERROR.PARSE_STRING.CODE, LEX_ERROR.PARSE_STRING.MSG, pos);
  }

  static UnknownOperator(pos, token) {
    return this.create(LEX_ERROR.UNKNOWN_OPERATOR.CODE, LEX_ERROR.UNKNOWN_OPERATOR.MSG, pos, token);
  }

  static BadNumber(pos, token) {
    return this.create(LEX_ERROR.BAD_NUMBER.CODE, LEX_ERROR.BAD_NUMBER.MSG, pos, token);
  }

  static BadIdentifer(pos, token) {
    return this.create(LEX_ERROR.BAD_IDENTIFER.CODE, LEX_ERROR.BAD_IDENTIFER.MSG, pos, token);
  }

  static UnableToPutbackToken(pos, token) {
    return this.create(LEX_ERROR.UNABLE_TO_PUTBACK_NON_TOKEN.CODE, LEX_ERROR.UNABLE_TO_PUTBACK_NON_TOKEN.MSG, pos, token);
  }
}
