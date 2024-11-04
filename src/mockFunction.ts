export interface MockFunctionConstructor<TIn extends unknown[], TOut> {
  new (): MockFunction<TIn, TOut>;
  (...args: TIn): TOut;
}

export interface MockFunction<TIn extends unknown[], TOut>
  extends MockFunctionConstructor<TIn, TOut> {
  mock: {
    calls: Array<TIn>;
    contexts: unknown[];
    instances: MockFunction<TIn, TOut>[];
    lastCall: TIn | undefined;
    results: Array<TOut | undefined>;
  };
  mockClear(): this;
  mockImplementation: (callback: (...args: TIn) => TOut) => void;
  mockImplementationOnce: (callback: (...args: TIn) => TOut) => this;
  mockReset(): this;
}
