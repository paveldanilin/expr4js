import Token from './token';
import TOKEN_TYPE from './type';

export default class TokenIdentifer extends Token {
  constructor(token, pos) {
    super(TOKEN_TYPE.IDENTIFER, token, pos);
  }

  clone() {
    return new TokenIdentifer(this.toString(), this.getPos());
  }
}
