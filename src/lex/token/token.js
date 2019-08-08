import TOKEN_TYPE from './type';

export default class Token {
  constructor(type, token, pos) {
    this.type = type;
    this.token = token;
    this.pos = pos;
  }

  getType() {
    return this.type;
  }

  getPos() {
    return this.pos;
  }

  isError() {
    return this.type === TOKEN_TYPE.ERROR;
  }

  isIdentifer() {
    return this.type === TOKEN_TYPE.IDENTIFER;
  }

  isConst() {
    return this.type === TOKEN_TYPE.CONST;
  }

  isOperator() {
    return this.type === TOKEN_TYPE.OPERATOR;
  }

  isKeyword() {
    return this.type === TOKEN_TYPE.KEYWORDS;
  }

  clone() {
    return new Token(this.type, this.token, this.pos);
  }

  toString() {
    return this.token;
  }
}
