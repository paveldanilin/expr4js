(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./examples/sandbox/sandbox.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./examples/sandbox/blocks/styles.css":
/*!********************************************!*\
  !*** ./examples/sandbox/blocks/styles.css ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// extracted by mini-css-extract-plugin\n\n//# sourceURL=webpack:///./examples/sandbox/blocks/styles.css?");

/***/ }),

/***/ "./examples/sandbox/sandbox.js":
/*!*************************************!*\
  !*** ./examples/sandbox/sandbox.js ***!
  \*************************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _blocks_styles_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./blocks/styles.css */ \"./examples/sandbox/blocks/styles.css\");\n/* harmony import */ var _blocks_styles_css__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_blocks_styles_css__WEBPACK_IMPORTED_MODULE_0__);\n\nvar expr4js = new expr4[\"default\"]();\nvar exprInput = document.getElementById('expression');\nvar modelInput = document.getElementById('model');\nvar resultOutput = document.getElementById('result');\nvar exampleListInput = document.getElementById('exampleList');\nvar examplesModel = {\n  example_1: {\n    title: 'Dot access',\n    model: {\n      car: {\n        color: \"red\"\n      }\n    },\n    expression: 'car.color == \"red\"'\n  },\n  example_2: {\n    title: 'Arithmetic',\n    model: {\n      a: 5,\n      b: 2\n    },\n    expression: '(a + 5) * b'\n  },\n  example_3: {\n    title: 'String concat',\n    model: {\n      first: 'Hello, ',\n      second: 'Guest'\n    },\n    expression: 'first + second'\n  },\n  example_4: {\n    title: 'Logic \"and\"',\n    model: {\n      a: 1,\n      b: 10,\n      c: 10,\n      d: 1\n    },\n    expression: '(a + b) == 11 and 11 == (c + d)'\n  }\n};\nvar listItemClasses = ['list__item', 'list__item_border-bottom', 'list__item_indent-b-m', 'list__item_over'];\nObject.keys(examplesModel).forEach(function (exampleKey) {\n  var liElement = document.createElement('li');\n  liElement.setAttribute('data-example', exampleKey);\n  liElement.textContent = examplesModel[exampleKey].title;\n  listItemClasses.forEach(function (className) {\n    return liElement.classList.add(className);\n  });\n  exampleListInput.appendChild(liElement);\n});\nsetExample(Object.keys(examplesModel)[0]);\nexampleListInput.addEventListener('click', function (e) {\n  var exampleId = e.target.getAttribute('data-example');\n\n  if (!exampleId) {\n    return;\n  }\n\n  setExample(exampleId);\n});\nexprInput.addEventListener('input', function () {\n  evalExpression();\n});\nmodelInput.addEventListener('input', function () {\n  evalExpression();\n});\n\nfunction evalExpression() {\n  var modelRaw = modelInput.value.trim();\n  var input = exprInput.value.trim();\n\n  if (modelRaw.length === 0 || input.length === 0) {\n    resultOutput.textContent = '';\n    return;\n  }\n\n  var model = JSON.parse(modelRaw);\n  var parsed = expr4js.parse(exprInput.value);\n\n  if (parsed === null) {\n    if (expr4js.getLastError()) {\n      resultOutput.textContent = expr4js.getLastError().getMessage();\n    }\n  } else {\n    resultOutput.textContent = parsed.execute(model);\n  }\n}\n\nfunction setExample(id) {\n  var example = examplesModel[id] || null;\n\n  if (!example) {\n    return;\n  }\n\n  Array.from(exampleListInput.children).forEach(function (liElement) {\n    if (liElement.getAttribute('data-example') === id) {\n      liElement.classList.add('list__item_focus');\n    } else {\n      liElement.classList.remove('list__item_focus');\n    }\n  });\n  modelInput.value = JSON.stringify(example.model);\n  exprInput.value = example.expression;\n  evalExpression();\n} //setExample('example_1');\n\n//# sourceURL=webpack:///./examples/sandbox/sandbox.js?");

/***/ })

/******/ });
});