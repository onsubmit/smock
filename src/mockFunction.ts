export type Func = (...args: any[]) => any;
export type NormalizedFunc<T extends Func> = (...args: Parameters<T>) => ReturnType<T>;

export interface MockFunctionConstructor<TFunc extends Func = Func> {
  new (): MockFunction<TFunc>;
  (...args: Parameters<TFunc>): any;
}

export interface MockFunction<TFunc extends Func = Func> extends MockFunctionConstructor<TFunc> {
  mock: {
    calls: Array<Parameters<TFunc>>;
    contexts: unknown[];
    instances: Array<MockFunction<TFunc>>;
    lastCall: Parameters<TFunc> | undefined;
    results: Array<any>;
  };
  mockClear(): this;
  mockImplementation: (callback: NormalizedFunc<TFunc>) => this;
  mockImplementationOnce: (callback: NormalizedFunc<TFunc>) => this;
  mockReset(): this;
  mockReturnThis(): this;
  mockReturnValue(value: ReturnType<TFunc>): this;
  mockReturnValueOnce(value: ReturnType<TFunc>): this;
  mockResolvedValue(value: Awaited<ReturnType<TFunc>>): this;
  mockResolvedValueOnce(value: Awaited<ReturnType<TFunc>>): this;
}

export function fn<TFunc extends Func = Func>(callback?: TFunc): MockFunction<TFunc> {
  const state: Record<string, any> = {};
  let mockImplementation: NormalizedFunc<TFunc> | undefined;
  const mockImplementations: Array<NormalizedFunc<TFunc> | undefined> = [];

  const mockInitialValue: MockFunction<TFunc>['mock'] = {
    calls: [],
    contexts: [],
    instances: [],
    lastCall: undefined,
    results: [],
  };

  const mockFn: MockFunction<TFunc> = Object.assign(
    function (this: MockFunction<TFunc> | unknown, ...args: Parameters<TFunc>) {
      const { mock } = mockFn;

      state.this = this;

      mock.calls.push(args);
      mock.contexts.push(this);
      mock.instances.push(this as MockFunction<TFunc>);
      mock.lastCall = args;

      const result = (mockImplementations.shift() ?? mockImplementation ?? callback)?.(...args);
      mock.results.push(result);
      return result;
    } as MockFunctionConstructor<TFunc>,
    {
      mock: mockInitialValue,
      state: {},
      mockClear: () => {
        const { mock } = mockFn;

        mock.calls.length = 0;
        mock.contexts.length = 0;
        mock.instances.length = 0;
        mock.results.length = 0;

        return mockFn;
      },
      mockImplementation: (callback: NormalizedFunc<TFunc>) => {
        mockImplementation = callback;
        return mockFn;
      },
      mockImplementationOnce: (callback: NormalizedFunc<TFunc>): MockFunction<TFunc> => {
        mockImplementations.push(callback);
        return mockFn;
      },
      mockReset: () => {
        mockImplementation = undefined;
        mockImplementations.length = 0;

        return mockFn.mockClear();
      },
      mockReturnThis: () => mockFn.mockImplementation(() => state.this),
      mockReturnValue: (value: ReturnType<TFunc>) => mockFn.mockImplementation(() => value),
      mockReturnValueOnce: (value: ReturnType<TFunc>) => mockFn.mockImplementationOnce(() => value),
      mockResolvedValue: (value: Awaited<ReturnType<TFunc>>) =>
        mockFn.mockImplementation(() => Promise.resolve(value) as any),
      mockResolvedValueOnce: (value: Awaited<ReturnType<TFunc>>) =>
        mockFn.mockImplementationOnce(() => Promise.resolve(value) as any),
    },
  );

  return mockFn;
}
