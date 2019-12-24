# renameFunc

A futuristic utility library that allows you to dynamically shallow copy functions and give it different name and arguments. It works for all kinds of functions such as regular functions, arrow functions, classes, async functions, etc.

Here are some examples. It's old JavaScript.

```js
// original function
function greet(name) {
    console.log("Hello, " + name + "!");
}
greet.name;   // "greet"
greet.length; // 1, greet have 1 argument
greet("World");

// now for the shallow copy
var newFunc = renameFunc("hello", ["more", "useless", "arguments"], greet);
newFunc.name;   // "hello"
newFunc.length; // 3
newFunc("Joe"); // this still calls the original greet()
```

It works for new JavaScript of course.

```js
class Car {
    constructor(model, color) {
        this.model = model;
        this.color = color;
    }
}
const NotCar = renameFunc("NotCar", ["notModel", "notColor"], Car);
NotCar.name;   // "NotCar"
NotCar.length; // 2

// this would work the same as new Car(...)
const notMyCar = new NotCar("imaginary_model", "edgy black");

// Error: must be instantiated with new
NotCar("imaginary_model_revamped", "mood gray");
```

## Key Features

- Simple and Straightforward API
- Theoretically works in IE, haven't tested yet
- Internally, it only uses a single try-catch and a bunch of evals
- Unnecessary additional call stacks

## Use Cases

## Installation

There will be a NPM package soon.

The source code and its minified code will work for browser, CommonJS, and AMD.

## API

```js
renameFunc(name, args, func);
```

### Parameters

- `name` -- (coerced to string) the name of shallow copied function, for unnamed function, use `""`
- `args` -- (coerced to string) the arguments of the shallow copied function separated with commas
- `func` -- (must be a function) the source function

**Note:** You can pass array of strings to `args`.

### Return

A shallow copy of `func`.

### Exceptions

`TypeError` -- `func` is not a function.
`SyntaxError` -- invalid function or argument name, or duplicate argument.

## License

MIT
