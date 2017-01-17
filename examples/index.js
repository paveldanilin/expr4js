/***********************************************************************************************************************
* *********************************************************************************************************************/

var jsexpr = require('../src/jsexpr.js');

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


var expr1 = jsexpr.parse('check(id, person.name, prev(), 100, "NAME")');

if(expr1) {
  console.log(expr1.execute({
    id: 1001,
    person: {
      name: "Pavel"
    }
  }));
}
