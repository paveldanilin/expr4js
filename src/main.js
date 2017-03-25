/***********************************************************************************************************************
* Expr4JS v0.1
***********************************************************************************************************************/

(function () {

  var jsexpr = (function () {

    /*=require common.js*/
    /*=require lex/lex.js*/
    /*=require parser/parser.js*/

    var _last_error = null;

    /**
      * ----------------------------------------------------------------------------------------------------------------
      * Private methods
      * ----------------------------------------------------------------------------------------------------------------
      */
      var _parse = function(input) {
        var lex    = new Lex(input);
        var parser = new Parser();

        if(!parser.parse(lex)) {
          var lerr = lex.getLastError();
          if(lerr !== null) {
            /*console.log('Lex-Error<' + lerr.getCode() + '>: ' + lerr.getDef() +
                        ' in token<' + lerr.getToken() + '>' + ' at ' + (lerr.getPos() + 1) + ' pos');*/
            _last_error = lerr;
            return null;
          }

          var perr = parser.getLastError();
          if(perr !== null) {
            _last_error = perr;
            return null;
          }
        }

        return parser.getAST();
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

     var getLastError = function() {
       return _last_error;
     };

    /*******************************************************************************************************************
     * Module public interface
     */
    return {
      parse: parse,
      getLastError: getLastError
    };

  })();

  if(typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = jsexpr;
  }else {
    window['jsexpr'] = jsexpr;
  }

})();
