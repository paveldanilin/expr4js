/***********************************************************************************************************************
* Javascript-Expression parser
* Version: 0.1
***********************************************************************************************************************/

(function () {

  var jsexpr = (function () {

    /*=require common.js*/
    /*=require lex/lex.js*/
    /*=require parser/parser.js*/

    /**
     * @param {[type]} ast_node_root [description]
     */
    var JSExpr = function(ast_node_root) {
      this.ast_root = ast_node_root;
    };

    JSExpr.prototype.execute = function(scope) {
      if(this.ast_root !== undefined && this.ast_root !== null) {
        return this.ast_root.execute(scope);
      }
      return null;
    };

    /**
      * ----------------------------------------------------------------------------------------------------------------
      * Private methods
      * ----------------------------------------------------------------------------------------------------------------
      */
      var _parse = function(input) {
        var lex    = new Lex(input);
        var parser = new Parser(lex);

        for(;;) {
          var token = lex.getToken();
          if(token === null) {
            break;
          }
          if(token.isOperator() && token.getOperator() === OPERATOR.WS) {
            continue;
          }
          parser.lookup(token);
        }

        var lerr = lex.getLastError();
        if(lerr !== null) {
          console.log('Lex-Error<' + lerr.getCode() + '>: ' + lerr.getDef() + ' in token<' + lerr.getToken() + '>' + ' at ' + (lerr.getPos() + 1) + ' pos');
          return null;
        }

        var perr = parser.getLastError();
        if(perr !== null) {
          // console.log
          return null;
        }

        return new JSExpr(parser.getAST());
      };
    /**
     * -----------------------------------------------------------------------------------------------------------------
     * Module public methods
     * -----------------------------------------------------------------------------------------------------------------
     */

     var parse = function(expr) {
       var input = {
         buf:     expr,
         buf_len: expr.length,
         pos:     0
       };
       return _parse(input);
     };

    /*******************************************************************************************************************
     * Module public interface
     */
    return {
      parse: parse
    };

  })();

  if(typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = jsexpr;
  }else {
    window['jsexpr'] = jsexpr;
  }

})();
