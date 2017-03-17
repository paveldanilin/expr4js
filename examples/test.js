var template  = function(tpl, scope) {
  var expr = /({{[a-zA-Z0-9\.\!<>\(\)\/\=\-\+\*\&\?\ ]+}})+/gm;

  //var matches = [];
  return tpl.replace(expr, function() {
    var arr = ([]).slice.call(arguments, 0);
    var extras = arr.splice(-2);
    //arr.index = extras[0];
    //arr.input = extras[1];
    //matches.push(arr);
    var inner_expr = arr[0].substr(2, arr[0].length - 4);
    //console.log(inner_expr);
    return scope[inner_expr];
  });
  
  //return matches.length ? matches : null;
}


console.log(
  template(
    "<p>{{name}}</p>" +
    "<p>{{sename}}</p>",
    {
      name: "Pavel",
      sename: "Danilin"
    }
  )
);
