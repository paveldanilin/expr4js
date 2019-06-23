import Token from './token';
import TOKEN_TYPE from './type';

class TokenConst extends Token
{
  constructor(token, pos, dtype)
  {
    super(TOKEN_TYPE.CONST, token, pos);
    this.dtype = dtype;
  }

  getDataType()
  {
    return this.dtype;
  }

  clone()
  {
    return new TokenConst(this.toString(), this.getPos(), this.getDataType());
  }
}

export default TokenConst;
