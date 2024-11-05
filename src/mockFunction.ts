/* eslint-disable @typescript-eslint/no-explicit-any */

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
