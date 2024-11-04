export type MockFunctionConstructor<T> = {
  new (): MockFunction<T>;
  (...args: any[]): T;
};

export type MockFunction<T> = MockFunctionConstructor<T> & {
  mock: {
    calls: Array<unknown[]>;
    results: Array<T | undefined>;
    instances: MockFunction<T>[];
    contexts: unknown[];
  };
  mockImplementation: (callback: (...args: any[]) => T | undefined) => void;
  mockImplementationOnce: (callback: (...args: any[]) => T | undefined) => MockFunction<T>;
};
