import { fn, Func } from './mockFunction.js';

export interface SpyOnFunc {
  called: boolean;
}

export function spyOn<T, K extends keyof T>(object: T, method: K) {
  const objectMethod = object[method];

  const mockFn = fn(objectMethod as Func);
  object[method] = mockFn as any;

  return mockFn;
}
