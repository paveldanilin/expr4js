import ASTNode from './node';
import AST_NODE_TYPE from './type';
import DATA_TYPE from '../../lex/datatype';

class ASTNodeConst extends ASTNode
{
  constructor(val, type)
  {
    super(AST_NODE_TYPE.CONST);
    this.val = val;
    this.dtype = type;

    if(type === DATA_TYPE.NUMBER) {
      this.val = +this.val;
    }
  }

  getDataType() {
    return this.dtype;
  }

  execute(scope)
  {
    return this.val;
  }
}

export default ASTNodeConst;
