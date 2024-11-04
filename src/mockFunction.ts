export type MockFunctionConstructor<TIn extends unknown[], TOut> = {
  new (): MockFunction<TIn, TOut>;
  (...args: TIn): TOut;
};

export type MockFunction<TIn extends unknown[], TOut> = MockFunctionConstructor<TIn, TOut> & {
  mock: {
    calls: Array<TIn>;
    contexts: unknown[];
    instances: MockFunction<TIn, TOut>[];
    results: Array<TOut | undefined>;
  };
  mockImplementation: (callback: (...args: TIn) => TOut | undefined) => void;
  mockImplementationOnce: (callback: (...args: TIn) => TOut | undefined) => MockFunction<TIn, TOut>;
};
