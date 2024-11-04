export type MockFunctionConstructor = {
  new (): MockFunction;
  (...args: any[]): void;
};

export type MockFunction = MockFunctionConstructor & {
  mock: {
    calls: Array<unknown[]>;
    results: unknown[];
    instances: MockFunction[];
    contexts: unknown[];
  };
  mockImplementation: (callback: (...args: any[]) => unknown) => void;
  mockImplementationOnce: (callback: (...args: any[]) => unknown) => MockFunction;
};
