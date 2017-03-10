var TOKEN_TYPE = {
  ERROR:      0,
  IDENTIFER:  1,
  CONST:      2,
  OPERATOR:   3,
  KEYWORDS:   4
};

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
  NOT:        119 // !
};

var ERROR = {
  PARSE_STRING     : {
    CODE: 1000,
    MSG: 'Unable to parse string'
  },
  UNKNOWN_OPERATOR : {
    CODE: 1001,
    MSG: 'Unknown operator'
  },
  BAD_NUMBER       : {
    CODE: 1002,
    MSG: 'Bad number format'
  },
  BAD_IDENTIFER    : {
    CODE: 1003,
    MSG: 'Bad identifer, identifer allowed cahrs [_a-zA-Z]'
  },
  UNABLE_TO_PUTBACK_NON_TOKEN: {
    CODE: 1004,
    MSG: 'Unable to putback non token object'
  }
};

var CONST = {
  STRING: 10000,
  NUMBER: 10001
};

var QUOTE = {
  SINGLE: 1,
  DOUBLE: 2
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

/*=require ../common.js*/
/*=require error.js*/
/*=require token/token.js*/
/*=require token/const.js*/
/*=require token/identifer.js*/
/*=require token/keyword.js*/
/*=require token/operator.js*/

var Lex = function(input) {

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

  var _getString = function(begin_quote, start_from, input) {
    var str = '';
    var j = start_from + 1; // skip quote
    var complete = false;

    for(j; j < input.buf_len; j++) {
      if( (begin_quote === QUOTE.DOUBLE && input.buf[j] === '"') ||
          (begin_quote === QUOTE.SINGLE && input.buf[j] === '\'') ) {
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

  var _getOp = function(token, input) {
    var op_code = null;

    switch(token) {
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
        }
        break;
      case '(':
        op_code = OPERATOR.OPEN_PAR;
        break;
      case ')':
        op_code = OPERATOR.CLOSE_PAR;
        break;
      case '+':
        op_code = OPERATOR.SUM;
        break;
      case '-':
        op_code = OPERATOR.DIF;
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

  var _readNextToken = function(input) {
    var token = '';
    for(var i = input.pos; i < input.buf_len; i++) {
      var ch = input.buf[i];

      if(_isStopChar(ch)) {
        if(token.length === 0) {

          if(ch === '.' && _isDigit(_nextChar(input))) {
            token += '0' + ch;
            continue;
          }
          if(_prev_token === null && (ch === '-' || ch === '+') && _isDigit(_nextChar(input))) {
            token += ch;
            continue;
          }
        /*  if( _prev_token !== null &&
              _prev_token.getType() === 'OPERATOR' &&
              (_prev_token.getOperator() === OPERATOR.CLOSE_PAR || _prev_token.getOperator() === OPERATOR.CLOSE_PAR) &&
              (ch === '-' || ch === '+') &&
              _isDigit(_nextChar(input))) {
            token += ch;
            continue;
          }*/

          if(ch === '"') {
            var begin_pos = input.pos;
            var str = _getString(QUOTE.DOUBLE, begin_pos, input);
            if(str === null) {
              _last_error = new LexError(ERROR.PARSE_STRING.CODE, ERROR.PARSE_STRING.MSG, begin_pos);
              return null;
            }
            return new TokenConst(str, begin_pos, CONST.STRING);
          }else if(ch === '\'') {
            var begin_pos = input.pos;
            var str = _getString(QUOTE.SINGLE, begin_pos, input);
            if(str === null) {
              _last_error = new LexError(ERROR.PARSE_STRING.CODE, ERROR.PARSE_STRING.MSG, begin_pos);
              return null;
            }
            return new TokenConst(str, begin_pos, CONST.STRING);
          }

          var op = _getOp(ch, input);
          if(op.code === null) {
            _last_error = new LexError(ERROR.UNKNOWN_OPERATOR.CODE, ERROR.UNKNOWN_OPERATOR.MSG, input.pos, ch);
            return null;
          }
          input.pos++;
          return new TokenOperator(op.token, input.pos, op.code, op.precedence);
        }else {
          if((ch === '.' || _isDigit(ch)) && token.match(/([0-9])/)) {
            token += ch;
            continue;
          }
          break;
        }
      }

      token += ch;
    }

    input.pos += token.length;
    if(token.length === 0) {
      return null;
    }

    var kw_code = _isKeyword(token);
    if(kw_code !== null) {
      return new TokenKeyword(token, input.pos - token.length, kw_code);
    }

    var op = _getOp(token);
    if(op.code !== null) {
      return new TokenOperator(token, input.pos - token.length, op.code, op.precedence);
    }

    if(token.match(/(^|[ \t])([-+]?(\d+|\.\d+|\d+\.\d*))($|[^+-.])/)) {
      if(isNaN(+token)) {
        _last_error = new LexError(ERROR.BAD_NUMBER.CODE, ERROR.BAD_NUMBER.MSG, input.pos - token.length, token);
        return null;
      }
      return new TokenConst(token, input.pos - token.length, CONST.NUMBER);
    }

    if(!token.match(/^_?([_a-zA-Z])+$/)) {
      _last_error = new LexError(ERROR.BAD_IDENTIFER.CODE, ERROR.BAD_IDENTIFER.MSG, input.pos - token.length, token);
      return null;
    }

    return new TokenIdentifer(token, input.pos - token.length);
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
      _last_error = new  LexError(ERROR.UNABLE_TO_PUTBACK_NON_TOKEN.CODE, ERROR.UNABLE_TO_PUTBACK_NON_TOKEN.MSG);
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
