import LexError from './error';
import Token from './token/token';
import OPERATOR from './operator';
import DATA_TYPE from './datatype';
import tokenFactory from './factory';

export default class Lex {
  constructor(input) {
    if(typeof input === 'string') {
      this._input = {
        buf: input,
        buf_len: input.length,
        pos: 0
      };
    } else {
      this._input = input;
    }

    this._prev_token = null;
    this._back_token = null;
    this._last_error = null;

    this._keywords = {
      'in': 1
    };

    this._stopchars = ['?', '!', '=', '>', '<', '"', '\'', '.', ' ', '(', ')', ',', '*', '+', '-', '%'];

    this._precedence = {
      '(': 1,
      ')': 2,
      '||': 3, 'or': 3,
      '&&': 4, 'and': 4,
      '<': 5, '>': 5, '<=': 5, '>=': 5, '==': 5, '!=': 5, '?': 5,
      '+':  6, '-': 6,
      '*':  7, '/': 7, '%': 7,
      '.': 8
    };
  }

  _isStopChar(ch) {
    return this._stopchars.indexOf(ch) !== -1;
  }

  _getString(quote_operator, start_from, input) {
    let str = '';
    let j = start_from + 1; // skip quote
    let complete = false;

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
  }

  _nextChar(input) {
    if(input.pos + 1 < input.buf_len) {
      return input.buf[input.pos + 1];
    }
    return null;
  }

  _isOperator(token, input) {
    let opCode = null;
    let bufToken = token;

    switch(token) {
      case "'":
        opCode = OPERATOR.QUOTE_SINGLE;
        break;
      case '"':
        opCode = OPERATOR.QUOTE_DOUBLE;
        break;
      case ",":
        opCode = OPERATOR.COMMA;
        break;
      case '?':
        opCode = OPERATOR.IN;
        break;
      case '!':
        if(this._nextChar(input) === '=') {
          input.pos++;
          bufToken += '=';
          opCode = OPERATOR.NEQ;
        }else {
          opCode = OPERATOR.NOT;
        }
        break;
      case '(':
        opCode = OPERATOR.OPEN_PAR;
        break;
      case ')':
        opCode = OPERATOR.CLOSE_PAR;
        break;
      case '+':
        if(this._nextChar(input) === '+') {
          input.pos++;
          bufToken += '+';
          opCode = OPERATOR.INC;
        }else {
          opCode = OPERATOR.SUM;
        }
        break;
      case '-':
        if(this._nextChar(input) === '-') {
          input.pos++;
          bufToken += '-';
          opCode = OPERATOR.DEC;
        }else {
          opCode = OPERATOR.DIF;
        }
        break;
      case '*':
        opCode = OPERATOR.MUL;
        break;
      case '/':
        opCode = OPERATOR.DIV;
        break;
      case '%':
        opCode = OPERATOR.MOD;
        break;
      case "and":
        opCode = OPERATOR.AND;
        break;
      case "or":
        opCode = OPERATOR.OR;
        break;
      case ">":
        if(this._nextChar(input) === '=') {
          input.pos++;
          bufToken += '=';
          opCode = OPERATOR.GET;
        }else {
          opCode = OPERATOR.GT;
        }
        break;
      case "<":
        if(this._nextChar(input) === '=') {
          input.pos++;
          bufToken += '=';
          opCode = OPERATOR.LET;
        }else {
          opCode = OPERATOR.LT;
        }
        break;
      case "=":
        if(this._nextChar(input) === '=') {
          input.pos++;
          bufToken += '=';
          opCode = OPERATOR.EQ;
        }
        break;
      case ".":
        opCode = OPERATOR.DOT;
        break;
      case " ":
        opCode = OPERATOR.WS;
        break;
      default:
        opCode = null;
        break;
    }

    return {
      code:  opCode,
      token: bufToken,
      precedence: this._precedence[bufToken] !== undefined ? this._precedence[bufToken] : null
    };
  }

  _isKeyword (token) {
    if(this._keywords[token] !== undefined) {
      return this._keywords[token];
    }
    return null;
  }

  _isDigit(ch) {
    return (/^[0-9]$/).test(ch);
  }

  _getStringToken(quote_op, input) {
    const begin_pos = input.pos;
    const str = this._getString(quote_op, begin_pos, input);

    if(str === null) {
      this._last_error = LexError.UnableToParseString(begin_pos);
      return null;
    }

    return tokenFactory("const", {
      token: str,
      pos: begin_pos,
      data_type: DATA_TYPE.STRING
    });
  }

  _readNextToken(input) {
    let token = '';

    for(let i = input.pos; i < input.buf_len; i++) {
      const ch = input.buf[i];
      if(! this._isStopChar(ch)) {
        token += ch;
        continue;
      }

      if(token.length === 0) {
        if(ch === '.' && this._isDigit(this._nextChar(input))) {
          token += '0' + ch;
          continue;
        }

        if(this._prev_token === null && (ch === '-' || ch === '+') && this._isDigit(this._nextChar(input))) {
          // +number, -number
          token += ch;
          continue;
        }

        const op = this._isOperator(ch, input);
        if(op.code === null) {
          //console.log('Lex._readNextToken(): caught unknown operator <' + ch + '>');
          this._last_error = LexError.UnknownOperator(input.pos, ch);
          return null;
        }

        if(op.code === OPERATOR.QUOTE_SINGLE || op.code === OPERATOR.QUOTE_DOUBLE) {
          //console.log('Lex._readNextToken(): trying to get string...');
          return this._getStringToken(op.code, input);
        }

        input.pos++;
        return tokenFactory("operator", {
          token: op.token,
          pos: input.pos,
          op: op.code,
          precedence: op.precedence
        });
      }else {
        if((ch === '.' || this._isDigit(ch)) && this._isDigit(token)/*token.match(/([0-9])/)*/) {
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

    const kw_code = this._isKeyword(token);
    if(kw_code !== null) {
      return tokenFactory("keyword", {
        token: token,
        pos: input.pos - token.length,
        code: kw_code
      });
    }

    const op = this._isOperator(token);
    if(op.code !== null) {
      return tokenFactory("operator", {
        token: token,
        pos: input.pos - token.length,
        op: op.code,
        precedence: op.precedence
      });
    }

    if(token.match(/(^|[ \t])([-+]?(\d+|\.\d+|\d+\.\d*))($|[^+-.])/)) {
      if(isNaN(+token)) {
        this._last_error = LexError.BadNumber(input.pos - token.length, token);
        return null;
      }
      return tokenFactory("const", {
        token: token,
        pos: input.pos - token.length,
        data_type: DATA_TYPE.NUMBER
      });
    }

    if(! token.match(/^_?([_a-zA-Z])+$/)) {
      this._last_error = LexError.BadIdentifer(input.pos - token.length, token);
      return null;
    }

    //console.log('Lex._readNextToken(): trying to create Token.create("identifer", ' + token + ')');

    const ret = tokenFactory("identifer", {
      token: token,
      pos: input.pos - token.length
    });

    //console.log('Lex._readNextToken(): ret=' + ret);

    return ret;
  }

  getToken() {
    if(this._back_token !== null) {
      const t = this._back_token.clone();
      this._back_token = null;
      return t;
    }
    this._prev_token = this._readNextToken(this._input);
    return this._prev_token;
  }

  putback(token) {
    if(token instanceof Token === false) {
      this._last_error = LexError.UnableToPutbackToken(this._input.pos, token);
      return false;
    }
    this._back_token = token.clone();
    return true;
  }

  getLastError() {
    return this._last_error;
  }
}
