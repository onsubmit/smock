import { fn, Func, MockFunction, ObjectMethods } from './mockFunction.js';

export interface SpyOnFunc {
  called: boolean;
}

export function spyOn<T, M extends ObjectMethods<T>>(
  object: T,
  method: M,
): T[M] extends Func ? MockFunction<T[M]> : never {
  const objectMethod = object[method] as Func;

  const mockFn = fn(objectMethod.bind(object));
  object[method] = mockFn as T[M];

  return mockFn as any;
}
