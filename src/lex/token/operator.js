import Token from './token';
import TOKEN_TYPE from './type';
import OPERATOR from '../operator';

class TokenOperator extends Token
{
  constructor(token, pos, op, precedence)
  {
    super(TOKEN_TYPE.OPERATOR, token, pos);
    this.precedence = precedence;
    this.op = op;
  }

  getOperator()
  {
    return this.op;
  }

  getPrecedence()
  {
    return this.precedence;
  }

  is(op_code)
  {
    return this.op === op_code;
  }

  isUnary()
  {
    switch(this.op) {
      case OPERATOR.NOT: return true;
    }
    return false;
  }

  clone()
  {
    return new TokenOperator(this.toString(), this.getPos(), this.getOperator(), this.getPrecedence());
  }
}


export default TokenOperator;
