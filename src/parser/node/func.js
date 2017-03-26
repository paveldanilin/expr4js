/**
 * @param {[type]} name [description]
 * @param {[type]} args [description]
 */
var ASTNodeFunc = function(name, args)
{
  ASTNode.call(this, AST_NODE_TYPE.FUNCTION_CALL);
  this.name = name;
  this.args = args;
};
_extends(ASTNodeFunc, ASTNode);

ASTNodeFunc.prototype.execute = function(scope) {
  //console.log('Execute function <' + this.name + '>' + JSON.stringify(this.args));
  if(scope[this.name] === undefined || typeof scope[this.name] !== 'function') {
    //console.log('Unknown function <' + this.name + '>');
    return null;
  }
  var vargs = [];
  var len = this.args.length;
  for(var i = 0 ; i < len; i++) {
    vargs[i] = this.args[i].execute(scope);
  }
  return scope[this.name].apply(scope, vargs);
};
