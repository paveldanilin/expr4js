import Token from './token';
import TOKEN_TYPE from './type';

export default class TokenKeyword extends Token {
  constructor(token, pos, code) {
    super(TOKEN_TYPE.KEYWORDS, token, pos);
    this.code = code;
  }

  getCode() {
    return this.code;
  }

  clone() {
    return new TokenKeyword(this.toString(), this.getPos(), this.getCode());
  }
}
