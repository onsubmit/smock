import { MockFunction } from './mockFunction.js';

function fn(callback?: (...args: any[]) => unknown): MockFunction {
  let _mockImplementation: (...args: any[]) => unknown | undefined;
  const _mockImplementations: Array<(...args: any[]) => unknown> = [];

  const mockFn = function (this: MockFunction, ...args: any[]) {
    mockFn.mock.calls.push(args);
    mockFn.mock.instances.push(this);
    mockFn.mock.contexts.push(this);

    const result = (_mockImplementations.shift() ?? _mockImplementation ?? callback)?.(...args);
    mockFn.mock.results.push(result);
    console.log(result);
    return result;
  } as MockFunction;

  mockFn.mock = {
    calls: [],
    results: [],
    instances: [],
    contexts: [],
  };

  mockFn.mockImplementation = (callback: (...args: any[]) => unknown) => {
    _mockImplementation = callback;
  };

  mockFn.mockImplementationOnce = (callback: (...args: any[]) => unknown): MockFunction => {
    _mockImplementations.push(callback);
    return mockFn;
  };

  return mockFn;
}

const mockFn = fn(() => 'default')
  .mockImplementationOnce(() => 'first call')
  .mockImplementationOnce(() => 'second call');

mockFn(); // 'first call'
mockFn(); // 'second call'
mockFn(); // 'default'
mockFn(); // 'default'

// const mockFn = fn((scalar: number) => 42 + scalar);

// mockFn(0); // 42
// mockFn(1); // 43

// mockFn.mockImplementation((scalar: number) => 36 + scalar);

// mockFn(2); // 38
// mockFn(3); // 39

// const mockCallback = fn(x => x * 2);

// [1, 2, 3, 4].forEach((x) => mockCallback(x));

// console.log(mockCallback.mock.calls);
// console.log(mockCallback.mock.results);
// console.log(mockCallback.mock.contexts);

// const myMock1 = fn();
// const a1 = new myMock1();
// console.log(myMock1.mock.instances);

// const myMock2 = fn();
// const b1 = {};
// const bound = myMock2.bind(b1);
// bound();
// console.log(myMock2.mock.contexts);

// const mockFn1 = fn();

// const a2 = new mockFn1();
// const b2 = new mockFn1();

// console.log(mockFn1.mock.instances[0] === a2);
// console.log(mockFn1.mock.instances[1] === b2);

// const mockFn2 = fn();

// const thisContext0 = { a: 0 };
// const thisContext1 = { a: 1 };
// const thisContext2 = { a: 2 };
// const boundMockFn = mockFn2.bind(thisContext0);
// boundMockFn('a', 'b');
// mockFn2.call(thisContext1, 'a', 'b');
// mockFn2.apply(thisContext2, ['a', 'b']);
// debugger;
// console.log(mockFn2.mock.contexts[0] === thisContext0); // true
// console.log(mockFn2.mock.contexts[1] === thisContext1); // true
// console.log(mockFn2.mock.contexts[2] === thisContext2); // true
