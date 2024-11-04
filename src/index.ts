import { MockFunction, MockFunctionConstructor } from './mockFunction.js';

function fn(callback?: (...args: any[]) => unknown): MockFunction {
  let mockImplementation: (...args: any[]) => unknown | undefined;
  const mockImplementations: Array<(...args: any[]) => unknown> = [];

  const mockFn: MockFunction = Object.assign(
    function (this: MockFunction, ...args: any[]) {
      mockFn.mock.calls.push(args);
      mockFn.mock.instances.push(this);
      mockFn.mock.contexts.push(this);

      const result = (mockImplementations.shift() ?? mockImplementation ?? callback)?.(...args);
      mockFn.mock.results.push(result);
      return result;
    } as MockFunctionConstructor,
    {
      mock: {
        calls: [],
        results: [],
        instances: [],
        contexts: [],
      },
      mockImplementation: (callback: (...args: any[]) => unknown) => {
        mockImplementation = callback;
      },
      mockImplementationOnce: (callback: (...args: any[]) => unknown): MockFunction => {
        mockImplementations.push(callback);
        return mockFn;
      },
    },
  );

  return mockFn;
}

const smock = {
  fn,
};

export { smock };
