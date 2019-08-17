# expr4js
**expr4js** is a JavaScript module for expression parsing and evaluation. 

### Build
* Test: ```npm test```
* Dev: ```npm run dev```
* Prod: ```npm run build```

* Play in the sandbox: ```sandbox-start```

## Allowed operators
  - Relational and comparison operators: >, <, >=, <=, ==, !=
  - Arithmetic operatos: *, /, -, +
  - Logical operators: and, or
  - Member access: .
  
## Usage

```javascript
const expr4js = require('../dist/expr4.js').default;

const exprParser = new expr4js();

const model = {
    car: {
        color: 'green'
    }
};

const expr = 'car.color == "green"';

const r = exprParser.parse(expr);

if (r === null) {
    console.log(exprParser.getLastError().getMessage());
} else {
    console.log(`<${expr}>: ` + r.execute(model));
}
```

## Examples

### Basic example
````javascript
var myexpr = jsexpr.parse(expression);
if(myexpr) {
  var result = myexpr.execute(scope);
  console.log(result);
}

var expr = jsexpr.parse('1 == 1');

if(expr) {
  console.log(expr.execute()); // Will return 'TRUE'
}

var expr = jsexpr.parse('1 == 2');

if(expr) {
  console.log(expr.execute()); // Will return 'FALSE'
}

var expr = jsexpr.parse('id == 12345');

if(expr) {
  console.log(expr.execute({
    id: 12345
  })); // Will return 'TRUE'
}

var expr = jsexpr.parse('subscriber.id == 99');

if(expr) {
  console.log(expr.execute({
    subscriber: {
      id: 99
    }
  })); // Will return 'TRUE'
}

var expr = jsexpr.parse('subscriber.id == 99 and subscriber.name == "Ivan"');

if(expr) {
  console.log(expr.execute({
    subscriber: {
      id: 99,
      name: 'Ivan'
    }
  })); // Will return 'TRUE'
}

var expr = jsexpr.parse('subscriber.test() == "99:Ivan"');

if(expr) {
  console.log(expr.execute({
    subscriber: {
      id: 99,
      name: 'Ivan',
      test: function() {
        return this.id + ':' + this.name;
      }
    }
  })); // Will return 'TRUE'
}

 /*
    Filtering array of objects.
    Output will be:
    {
      age: "19",
      id: "2042",
      name: "Pavel"
    }
 */
 var expr = jsexpr.parse("age < 30 and name == 'Pavel'");
 
 var data = [
   {"name": "Pavel", "age": "30", "id": "13423"},
   {"name": "Roman", "age": "23", "id": "323"},
   {"name": "Ivan", "age": "33", "id": "232221"},
   {"name": "John", "age": "19", "id": "894"},
   {"name": "Steven", "age": "42", "id": "776"},
   {"name": "Pavel", "age": "19", "id": "2042"}
 ];
       
if(expr) {
  var len = data.length;
  for(var i = 0 ; i < len; i++) {
    if(expr.execute(data[i]) === true) {
      console.log(data[i]);
    }
  }
}
```
