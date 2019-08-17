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
        bufLen: input.length,
        pos: 0
      };
    } else {
      this._input = input;
    }

    this._prevToken = null;
    this._backToken = null;
    this._lastError = null;

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

  _getString(quoteOperator, startFrom, input) {
    let str = '';
    let j = startFrom + 1; // skip quote
    let complete = false;

    for(j; j < input.bufLen; j++) {
      if( (quoteOperator === OPERATOR.QUOTE_DOUBLE && input.buf[j] === '"') ||
          (quoteOperator === OPERATOR.QUOTE_SINGLE && input.buf[j] === '\'') ) {
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
    if(input.pos + 1 < input.bufLen) {
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
      precedence: this._precedence[bufToken] || null
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

  _getStringToken(quoteOp, input) {
    const beginPos = input.pos;
    const str = this._getString(quoteOp, beginPos, input);

    if(str === null) {
      this._lastError = LexError.UnableToParseString(beginPos);
      return null;
    }

    return tokenFactory("const", {
      token: str,
      pos: beginPos,
      dataType: DATA_TYPE.STRING
    });
  }

  _readNextToken(input) {
    let token = '';

    for(let i = input.pos; i < input.bufLen; i++) {
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

        if(this._prevToken === null && (ch === '-' || ch === '+') && this._isDigit(this._nextChar(input))) {
          // +number, -number
          token += ch;
          continue;
        }

        const op = this._isOperator(ch, input);
        if(op.code === null) {
          //console.log('Lex._readNextToken(): caught unknown operator <' + ch + '>');
          this._lastError = LexError.UnknownOperator(input.pos, ch);
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

    const kwCode = this._isKeyword(token);
    if(kwCode !== null) {
      return tokenFactory("keyword", {
        token: token,
        pos: input.pos - token.length,
        code: kwCode
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
        this._lastError = LexError.BadNumber(input.pos - token.length, token);
        return null;
      }
      return tokenFactory("const", {
        token: token,
        pos: input.pos - token.length,
        dataType: DATA_TYPE.NUMBER
      });
    }

    if(! token.match(/^_?([_a-zA-Z])+$/)) {
      this._lastError = LexError.BadIdentifer(input.pos - token.length, token);
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
    if(this._backToken !== null) {
      const t = this._backToken.clone();
      this._backToken = null;
      return t;
    }
    this._prevToken = this._readNextToken(this._input);
    return this._prevToken;
  }

  putback(token) {
    if(token instanceof Token === false) {
      this._lastError = LexError.UnableToPutbackToken(this._input.pos, token);
      return false;
    }
    this._backToken = token.clone();
    return true;
  }

  getLastError() {
    return this._lastError;
  }
}
