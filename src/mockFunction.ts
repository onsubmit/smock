export type Func = (...args: any[]) => any;
export type NormalizedFunc<T extends Func> = (...args: Parameters<T>) => ReturnType<T>;
export type ObjectMethods<T> = keyof {
  [K in keyof T as T[K] extends Func ? K : never]: T[K];
};

export interface MockFunctionConstructor<TFunc extends Func = Func> {
  new (): MockFunction<TFunc>;
  (...args: Parameters<TFunc>): ReturnType<TFunc>;
}

let sharedCallCount = 1;

export interface MockFunction<TFunc extends Func = Func> extends MockFunctionConstructor<TFunc> {
  mock: {
    called: boolean;
    callCount: number;
    calls: Array<Parameters<TFunc>>;
    contexts: any[];
    instances: Array<MockFunction<TFunc>>;
    invocationCallOrder: Array<number>;
    lastCall: Parameters<TFunc> | undefined;
    results: Array<MockResult<any>>;
    returns: Array<ReturnType<TFunc>>;
    settledResults: ReturnType<TFunc> extends PromiseLike<infer R>
      ? Array<{ type: 'resolved' | 'rejected'; value: R }>
      : never;
  };
  mockClear(): this;
  mockImplementation: (fn: NormalizedFunc<TFunc>) => this;
  mockImplementationOnce: (fn: NormalizedFunc<TFunc>) => this;
  mockReset(): this;
  mockRestore(): this;
  mockRejectedValue(value: any): this;
  mockRejectedValueOnce(value: any): this;
  mockReturnThis(): this;
  mockReturnValue(value: ReturnType<TFunc>): this;
  mockReturnValueOnce(value: ReturnType<TFunc>): this;
  mockResolvedValue(value: Awaited<ReturnType<TFunc>>): this;
  mockResolvedValueOnce(value: Awaited<ReturnType<TFunc>>): this;
  withImplementation(fn: TFunc, callback: Func): this;
}

export type MockResult<T> =
  | {
      type: 'success';
      value: T;
    }
  | {
      type: 'incomplete';
      value: undefined;
    }
  | {
      type: 'exception';
      value: any;
    };

export function fn<TFunc extends Func = Func>(implementation?: TFunc): MockFunction<TFunc> {
  let self: any;
  let tempImplementation: Func | undefined;
  const originalImplementation = implementation;

  let mockImplementation: NormalizedFunc<TFunc> | undefined;
  const mockImplementations: Array<NormalizedFunc<TFunc> | undefined> = [];

  const mockInitialValue: MockFunction<TFunc>['mock'] = {
    called: false,
    callCount: 0,
    calls: [],
    contexts: [],
    instances: [],
    invocationCallOrder: [],
    lastCall: undefined,
    settledResults: [] as any,
    results: [],
    returns: [],
  };

  const mockFn: MockFunction<TFunc> = Object.assign(
    function (this: any, ...args: Parameters<TFunc>) {
      const { mock } = mockFn;

      self = this;

      mock.calls.push(args);
      mock.contexts.push(this);
      mock.instances.push(this as MockFunction<TFunc>);
      mock.invocationCallOrder.push(sharedCallCount++);
      mock.lastCall = args;
      mock.results.push({
        type: 'incomplete',
        value: undefined,
      });

      const result = mock.results.at(-1)!;

      let returnValue: any;
      try {
        returnValue = (
          tempImplementation ??
          mockImplementations.shift() ??
          mockImplementation ??
          implementation
        )?.(...args);
        mock.returns.push(returnValue);
        result.type = 'success';
        result.value = returnValue;
      } catch (e: any) {
        result.type = 'exception';
        result.value = e;
        throw e;
      }

      if (returnValue instanceof Promise) {
        returnValue.then(
          (r: any) => mock.settledResults.push({ type: 'resolved', value: r }),
          (e: any) => mock.settledResults.push({ type: 'rejected', value: e }),
        );
      }

      return returnValue;
    } as MockFunctionConstructor<TFunc>,
    {
      mock: {
        ...mockInitialValue,
        get called() {
          return mockFn.mock.callCount > 0;
        },
        get callCount() {
          return mockFn.mock.calls.length;
        },
      },
      state: {},
      mockClear: () => {
        const { mock } = mockFn;

        tempImplementation = undefined;
        mock.calls.length = 0;
        mock.contexts.length = 0;
        mock.instances.length = 0;
        mock.invocationCallOrder.length = 0;
        mock.returns.length = 0;

        return mockFn;
      },
      mockImplementation: (fn: NormalizedFunc<TFunc>) => {
        mockImplementation = fn;
        return mockFn;
      },
      mockImplementationOnce: (fn: NormalizedFunc<TFunc>): MockFunction<TFunc> => {
        mockImplementations.push(fn);
        return mockFn;
      },
      mockReset: () => {
        implementation = undefined;
        mockImplementation = undefined;
        mockImplementations.length = 0;

        return mockFn.mockClear();
      },
      mockRestore: () => {
        mockFn.mockReset();
        implementation = originalImplementation;
        return mockFn;
      },
      mockRejectedValue(value: any): MockFunction<TFunc> {
        mockFn.mockImplementation(() => Promise.reject(value) as any);
        return mockFn;
      },
      mockRejectedValueOnce(value: any): MockFunction<TFunc> {
        mockFn.mockImplementationOnce(() => Promise.reject(value) as any);
        return mockFn;
      },
      mockReturnThis: () => mockFn.mockImplementation(() => self),
      mockReturnValue: (value: ReturnType<TFunc>) => mockFn.mockImplementation(() => value),
      mockReturnValueOnce: (value: ReturnType<TFunc>) => mockFn.mockImplementationOnce(() => value),
      mockResolvedValue: (value: Awaited<ReturnType<TFunc>>) =>
        mockFn.mockImplementation(() => Promise.resolve(value) as any),
      mockResolvedValueOnce: (value: Awaited<ReturnType<TFunc>>) =>
        mockFn.mockImplementationOnce(() => Promise.resolve(value) as any),
      withImplementation: (fn: TFunc, callback: Func) => {
        tempImplementation = fn;

        callback();

        tempImplementation = undefined;
        return mockFn;
      },
    },
  );

  Object.defineProperty(mockFn, 'length', { value: fn.length });

  return mockFn;
}
