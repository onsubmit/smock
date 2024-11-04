import { MockFunction, MockFunctionConstructor } from './mockFunction.js';

function fn<TIn extends unknown[], TOut>(
  callback?: (...args: TIn) => TOut | undefined,
): MockFunction<TIn, TOut> {
  let mockImplementation: (...args: TIn) => TOut | undefined;
  const mockImplementations: Array<(...args: TIn) => TOut | undefined> = [];

  const mockInitialValue: MockFunction<TIn, TOut>['mock'] = {
    calls: [],
    contexts: [],
    instances: [],
    lastCall: undefined,
    results: [],
  };

  const mockFn: MockFunction<TIn, TOut> = Object.assign(
    function (this: MockFunction<TIn, TOut>, ...args: TIn) {
      const { mock } = mockFn;

      mock.calls.push(args);
      mock.contexts.push(this);
      mock.instances.push(this);
      mock.lastCall = args;

      const result = (mockImplementations.shift() ?? mockImplementation ?? callback)?.(...args);
      mock.results.push(result);
      return result;
    } as MockFunctionConstructor<TIn, TOut>,
    {
      mock: mockInitialValue,
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
