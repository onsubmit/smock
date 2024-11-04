import { MockFunction, MockFunctionConstructor } from './mockFunction.js';

function fn<T>(callback?: (...args: any[]) => T | undefined): MockFunction<T> {
  let mockImplementation: (...args: any[]) => T | undefined;
  const mockImplementations: Array<(...args: any[]) => T | undefined> = [];

  const mockFn: MockFunction<T> = Object.assign(
    function (this: MockFunction<T>, ...args: any[]) {
      mockFn.mock.calls.push(args);
      mockFn.mock.instances.push(this);
      mockFn.mock.contexts.push(this);

      const result = (mockImplementations.shift() ?? mockImplementation ?? callback)?.(...args);
      mockFn.mock.results.push(result);
      return result;
    } as MockFunctionConstructor<T>,
    {
      mock: {
        calls: [],
        results: [],
        instances: [],
        contexts: [],
      },
      mockImplementation: (callback: (...args: any[]) => T | undefined) => {
        mockImplementation = callback;
      },
      mockImplementationOnce: (callback: (...args: any[]) => T | undefined): MockFunction<T> => {
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
