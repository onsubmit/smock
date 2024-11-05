import { MockFunction, MockFunctionConstructor } from './mockFunction.js';

function fn<TIn extends unknown[], TOut>(
  callback?: (...args: TIn) => TOut | undefined,
): MockFunction<TIn, TOut> {
  let mockImplementation: ((...args: TIn) => TOut) | undefined;
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
      mockClear: () => {
        const { mock } = mockFn;

        mock.calls.length = 0;
        mock.contexts.length = 0;
        mock.instances.length = 0;
        mock.results.length = 0;

        return mockFn;
      },
      mockImplementation: (callback: (...args: TIn) => TOut) => {
        mockImplementation = callback;
      },
      mockImplementationOnce: (callback: (...args: TIn) => TOut): MockFunction<TIn, TOut> => {
        mockImplementations.push(callback);
        return mockFn;
      },
      mockReset: () => {
        mockImplementation = undefined;
        mockImplementations.length = 0;

        return mockFn.mockClear();
      },
      mockReturnValue: (value: TOut) => {
        mockFn.mockImplementation(() => value);
      },
    },
  );

  return mockFn;
}

const smock = {
  fn,
};

export { smock };
