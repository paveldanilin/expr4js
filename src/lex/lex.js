var OPERATOR = {
  GT:         100, // >
  LT:         101, // <
  GET:        102, // >=
  LET:        103, // <=
  EQ:         104, // ==
  NEQ:        105, // !=
  DOT:        106, // .
  WS:         107, // ' '
  AND:        108, // and
  OR:         109, // or
  DIV:        110, // /
  DIF:        111, // -
  MUL:        112, // *
  SUM:        113, // +
  OPEN_PAR:   114, // (
  CLOSE_PAR:  115, // )
  IN:         116, // ? (const) ? (object/const[string])
  COMMA:      117,
  MOD:        118, // %
  NOT:        119, // !
  QUOTE_SINGLE: 120, // '
  QUOTE_DOUBLE: 121, // "
  INC:         122, // ++
  DEC:         123 // --
};

var DATA_TYPE = {
  STRING: 1,
  NUMBER: 2
};

var _keywords = {
  'in': 1
};
var _stopchars = ['?', '!', '=', '>', '<', '"', '\'', '.', ' ', '(', ')', ',', '*', '+', '-', '%'];
var _precedence = {
  '(': 1,
  ')': 2,
  '||': 3, 'or': 3,
  '&&': 4, 'and': 4,
  '<': 5, '>': 5, '<=': 5, '>=': 5, '==': 5, '!=': 5, '?': 5,
  '+':  6, '-': 6,
  '*':  7, '/': 7, '%': 7,
  '.': 8
};

/*-require ../common.js*/
/*=require error.js*/
/*=require token/token.js*/
/*=require token/const.js*/
/*=require token/identifer.js*/
/*=require token/keyword.js*/
/*=require token/operator.js*/

var Lex = function(input)
{
  if(typeof input === 'string') {
    var expr = input;
    input = {
      buf:     expr,
      buf_len: expr.length,
      pos:     0
    };
  }

  var _input      = input;
  var _prev_token = null;
  var _back_token = null;
  var _last_error = null;

  var _isStopChar = function(ch) {
    return _stopchars.indexOf(ch) !== -1;
  };

  var _getString = function(quote_operator, start_from, input) {
    var str = '';
    var j = start_from + 1; // skip quote
    var complete = false;

    for(j; j < input.buf_len; j++) {
      if( (quote_operator === OPERATOR.QUOTE_DOUBLE && input.buf[j] === '"') ||
          (quote_operator === OPERATOR.QUOTE_SINGLE && input.buf[j] === '\'') ) {
        complete = true;
        break;
      }
      str += input.buf[j];
    }

    if(!complete) {
      return null;
    }

    input.pos = j + 1;
    return str;
  };

  var _nextChar = function(input) {
    if(input.pos + 1 < input.buf_len) {
      return input.buf[input.pos + 1];
    }
    return null;
  };

  var _isOperator = function(token, input) {
    var op_code = null;

    switch(token) {
      case "'":
        op_code = OPERATOR.QUOTE_SINGLE;
        break;
      case '"':
        op_code = OPERATOR.QUOTE_DOUBLE;
        break;
      case ",":
        op_code = OPERATOR.COMMA;
        break;
      case '?':
        op_code = OPERATOR.IN;
        break;
      case '!':
        if(_nextChar(input) === '=') {
          input.pos++;
          token += '=';
          op_code = OPERATOR.NEQ;
        }else {
          op_code = OPERATOR.NOT;
        }
        break;
      case '(':
        op_code = OPERATOR.OPEN_PAR;
        break;
      case ')':
        op_code = OPERATOR.CLOSE_PAR;
        break;
      case '+':
        if(_nextChar(input) === '+') {
          input.pos++;
          token += '+';
          op_code = OPERATOR.INC;
        }else {
          op_code = OPERATOR.SUM;
        }
        break;
      case '-':
        if(_nextChar(input) === '-') {
          input.pos++;
          token += '-';
          op_code = OPERATOR.DEC;
        }else {
          op_code = OPERATOR.DIF;
        }
        break;
      case '*':
        op_code = OPERATOR.MUL;
        break;
      case '/':
        op_code = OPERATOR.DIV;
        break;
      case '%':
        op_code = OPERATOR.MOD;
        break;
      case "and":
        op_code = OPERATOR.AND;
        break;
      case "or":
        op_code = OPERATOR.OR;
        break;
      case ">":
        if(_nextChar(input) === '=') {
          input.pos++;
          token += '=';
          op_code = OPERATOR.GET;
        }else {
          op_code = OPERATOR.GT;
        }
        break;
      case "<":
        if(_nextChar(input) === '=') {
          input.pos++;
          token += '=';
          op_code = OPERATOR.LET;
        }else {
          op_code = OPERATOR.LT;
        }
        break;
      case "=":
        if(_nextChar(input) === '=') {
          input.pos++;
          token += '=';
          op_code = OPERATOR.EQ;
        }
        break;
      case ".":
        op_code = OPERATOR.DOT;
        break;
      case " ":
        op_code = OPERATOR.WS;
        break;
    }

    return {
      code:  op_code,
      token: token,
      precedence: _precedence[token] !== undefined ? _precedence[token] : null
    };
  };

  var _isKeyword = function(token) {
    if(_keywords[token] !== undefined) {
      return _keywords[token];
    }
    return null;
  };

  var _isDigit = function(ch) {
    return (
              ch === '0' ||
              ch === '1' ||
              ch === '2' ||
              ch === '3' ||
              ch === '4' ||
              ch === '5' ||
              ch === '6' ||
              ch === '7' ||
              ch === '8' ||
              ch === '9'
          );
  };

  /**
   * [_getStringToken]
   * @param  {TokenOperator} quote_op
   * @param  {[type]} input    [description]
   * @return {[type]}          [description]
   */
  var _getStringToken = function(quote_op, input) {
    //console.log('Lex._getStringToken(' + quote_op + ',' + JSON.stringify(input) + ')');
    var begin_pos = input.pos;
    var str = _getString(quote_op, begin_pos, input);

    //console.log('Lex._getStringToken(): got str=<' + str + '>');

    if(str === null) {
      _last_error = LexError.UnableToParseString(begin_pos);
      return null;
    }

    return Token.create("const", {
      token: str,
      pos: begin_pos,
      data_type: DATA_TYPE.STRING
    });
  };

  var _readNextToken = function(input) {
    //console.log('Lex._readNextToken(): input.buf=' + input.buf + ', input.pos=' + input.pos);
    var token = '';

    for(var i = input.pos; i < input.buf_len; i++) {
      var ch = input.buf[i];
      if(!_isStopChar(ch)) {
        token += ch;
        continue;
      }

      if(token.length === 0) {
        if(ch === '.' && _isDigit(_nextChar(input))) {
          token += '0' + ch;
          continue;
        }

        if(_prev_token === null && (ch === '-' || ch === '+') && _isDigit(_nextChar(input))) {
          // +number, -number
          token += ch;
          continue;
        }

        var op = _isOperator(ch, input);
        if(op.code === null) {
          //console.log('Lex._readNextToken(): caught unknown operator <' + ch + '>');
          _last_error = LexError.UnknownOperator(input.pos, ch);
          return null;
        }

        if(op.code == OPERATOR.QUOTE_SINGLE || op.code == OPERATOR.QUOTE_DOUBLE) {
          //console.log('Lex._readNextToken(): trying to get string...');
          return _getStringToken(op.code, input);
        }

        input.pos++;
        return Token.create("operator", {
          token: op.token,
          pos: input.pos,
          op: op.code,
          precedence: op.precedence
        });
      }else {
        if((ch === '.' || _isDigit(ch)) && token.match(/([0-9])/)) {
          token += ch;
          continue;
        }
        break;
      }
    }

    input.pos += token.length;
    if(token.length === 0) {
      return null;
    }

    var kw_code = _isKeyword(token);
    if(kw_code !== null) {
      return Token.create("keyword", {
        token: token,
        pos: input.pos - token.length,
        code: kw_code
      });
    }

    var op = _isOperator(token);
    if(op.code !== null) {
      return Token.create("operator", {
        token: token,
        pos: input.pos - token.length,
        op: op.code,
        precedence: op.precedence
      });
    }

    if(token.match(/(^|[ \t])([-+]?(\d+|\.\d+|\d+\.\d*))($|[^+-.])/)) {
      if(isNaN(+token)) {
        _last_error = LexError.BadNumber(input.pos - token.length, token);
        return null;
      }
      return Token.create("const", {
        token: token,
        pos: input.pos - token.length,
        data_type: DATA_TYPE.NUMBER
      });
    }

    if(!token.match(/^_?([_a-zA-Z])+$/)) {
      _last_error = LexError.BadIdentifer(input.pos - token.length, token);
      return null;
    }

    //console.log('Lex._readNextToken(): trying to create Token.create("identifer", ' + token + ')');

    var ret = Token.create("identifer", {
      token: token,
      pos: input.pos - token.length
    });

    //console.log('Lex._readNextToken(): ret=' + ret);

    return ret;
  };

  /**
   * [Return next token from input sequence]
   * @return {Token} Token object
   */
  this.getToken = function() {
    if(_back_token !== null) {
      var t = _back_token.clone();
      _back_token = null;
      return t;
    }
    _prev_token = _readNextToken(_input);
    return _prev_token;
  };

  /**
   * [Putback token object]
   * @param  {Token} token Token object
   */
  this.putback = function(token) {
    if(token instanceof Token === false) {
      _last_error = LexError.UnableToPutbackToken(_input.pos, token);//new  LexError(ERROR.UNABLE_TO_PUTBACK_NON_TOKEN.CODE, ERROR.UNABLE_TO_PUTBACK_NON_TOKEN.MSG);
      return false;
    }
    _back_token = token.clone();//token;
    return true;
  };

  /**
   * [Return last error object]
   * @return {LexError} LexError object
   */
  this.getLastError = function() {
    return _last_error;
  };

};
