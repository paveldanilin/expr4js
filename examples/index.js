/***********************************************************************************************************************
* *********************************************************************************************************************/

var jsexpr = require('../build/jsexpr.js');


var expr = jsexpr.parse('id==1001 and person.name==\'Pavel\'');

if(expr) {
  console.log(expr.execute({
    id: 1001,
    person: {
      name: "Pavel"
    }
  }));
}

//--


var expr1 = jsexpr.parse('print(person.getName() + "-" + person.insurance.next().bye().text)');

if(expr1) {
  console.log(expr1.execute({
    person: {
      name: 'Ivan',
      getName: function() {
        return this.name;
      },
      insurance: {
        id: '334545',
        delete: function() {
          return 'Remove insurance id[' + this.id + ']';
        },
        next: function() {
          return {
            text: 'Hello!',
            bye: function() {
              return {
                text: 'Bye!'
              };
            }
          };
        }
      }
    },
    print: function(s) {
      return s;
    }
  }));
}

// --

var expr2 = jsexpr.parse('1==1');

if(expr2) {
  console.log(expr2.execute());
}

//--

var expr3 = jsexpr.parse('1!=1');

if(expr3) {
  console.log(expr3.execute());
}

//--

var expr4 = jsexpr.parse('"a" ? "abcd"');

if(expr4) {
  console.log(expr4.execute());
}

//--

var expr5 = jsexpr.parse('"a" ? "ABCD"');

if(expr5) {
  console.log(expr5.execute());
}

//--

var expr6 = jsexpr.parse('"5546" ? packs');

if(expr6) {
  console.log(expr6.execute({
    packs: ['1123', '5546', '3324']
  }));
}

//--
