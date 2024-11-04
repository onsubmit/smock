import { MockFunction, MockFunctionConstructor } from './mockFunction.js';

function fn<TIn extends unknown[], TOut>(
  callback?: (...args: TIn) => TOut | undefined,
): MockFunction<TIn, TOut> {
  let mockImplementation: (...args: any[]) => TOut | undefined;
  const mockImplementations: Array<(...args: any[]) => TOut | undefined> = [];

  const mockFn: MockFunction<TIn, TOut> = Object.assign(
    function (this: MockFunction<TIn, TOut>, ...args: TIn) {
      mockFn.mock.calls.push(args);
      mockFn.mock.instances.push(this);
      mockFn.mock.contexts.push(this);

      const result = (mockImplementations.shift() ?? mockImplementation ?? callback)?.(...args);
      mockFn.mock.results.push(result);
      return result;
    } as MockFunctionConstructor<TIn, TOut>,
    {
      mock: {
        calls: [],
        results: [],
        instances: [],
        contexts: [],
      },
      mockImplementation: (callback: (...args: TIn) => TOut | undefined) => {
        mockImplementation = callback;
      },
      mockImplementationOnce: (
        callback: (...args: TIn) => TOut | undefined,
      ): MockFunction<TIn, TOut> => {
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
