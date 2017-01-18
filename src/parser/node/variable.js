/**
 * @param {[type]} name [description]
 */
var ASTNodeVariable = function(name) {
  ASTNode.call(this, ASTNODE.VARIABLE);
  this.name = name;
};
_extends(ASTNodeVariable, ASTNode);

ASTNodeVariable.prototype.getValueByPath = function(path, scope) {
  var chunks = path.split('.');
  var len = chunks.length;
  var v = scope;
  for(var i = 0 ; i < len; i++) {
    v = v[chunks[i]];
    if(v === undefined) {
      break;
    }
  }
  return v;
};

ASTNodeVariable.prototype.getName = function() {
  return this.name;
};

ASTNodeVariable.prototype.execute = function(scope) {
  if(this.name.indexOf('.') != -1) {
    return this.getValueByPath(this.name, scope);
  }
  return scope[this.name];
};
