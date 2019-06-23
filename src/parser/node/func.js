import ASTNode from './node';
import AST_NODE_TYPE from './type';

class ASTNodeFunc extends ASTNode
{
  constructor(name, args)
  {
    super(AST_NODE_TYPE.FUNCTION_CALL);
    this.name = name;
    this.args = args;
  }

  execute(scope)
  {

    if( scope[this.name] === undefined || typeof scope[this.name] !== 'function' ) {
      return null;
    }

    let vargs = [];
    const len = this.args.length;

    for(let i = 0 ; i < len; i++) {
      vargs[i] = this.args[i].execute(scope);
    }

    return scope[this.name].apply(scope, vargs);
  }
}

export default ASTNodeFunc;
