export type MockFunction = {
  new (): MockFunction;
  (...args: any[]): unknown;
  mock: {
    calls: Array<unknown[]>;
    results: unknown[];
    instances: MockFunction[];
    contexts: unknown[];
  };
  mockImplementation: (callback: (...args: any[]) => unknown) => void;
  mockImplementationOnce: (callback: (...args: any[]) => unknown) => MockFunction;
};
