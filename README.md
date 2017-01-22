# jsexpr

JavaScript expression parser and executor module. 

## Allowed operators
  - Relational and comparison operators: >, <, >=, <=, ==, !=
  - Arithmetic operatos: *, /, -, +
  - Logical operators: and, or
  - Member access: .
  
## Usage
#### Node
```
var jsexpr = require('jsexpr.min.js');
```
#### Html
```
<head>
  <link rel="stylesheet" href="jsexpr.min.css">
</head>
```

## Examples

### Basic example
````javascript
var myexpr = jsexpr.parse(expression);
if(myexpr) {
  var result = myexpr.execute(scope);
  console.log(result);
}
```

```
var expr = jsexpr.parse('1 == 1');

if(expr) {
  console.log(expr.execute()); // Will return 'TRUE'
}
```

```
var expr = jsexpr.parse('1 == 2');

if(expr) {
  console.log(expr.execute()); // Will return 'FALSE'
}
```

```
var expr = jsexpr.parse('id == 12345');

if(expr) {
  console.log(expr.execute({
    id: 12345
  })); // Will return 'TRUE'
}
```

```
var expr = jsexpr.parse('subscriber.id == 99');

if(expr) {
  console.log(expr.execute({
    subscriber: {
      id: 99
    }
  })); // Will return 'TRUE'
}
```

```
var expr = jsexpr.parse('subscriber.id == 99 and subscriber.name == "Ivan"');

if(expr) {
  console.log(expr.execute({
    subscriber: {
      id: 99,
      name: 'Ivan'
    }
  })); // Will return 'TRUE'
}
```

```
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
```
