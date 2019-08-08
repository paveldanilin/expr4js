import Token from './token';
import TOKEN_TYPE from './type';

export default class TokenConst extends Token {
  constructor(token, pos, dataType) {
    super(TOKEN_TYPE.CONST, token, pos);
    this.dtype = dataType;
  }

  getDataType() {
    return this.dtype;
  }

  clone() {
    return new TokenConst(this.toString(), this.getPos(), this.getDataType());
  }
}
