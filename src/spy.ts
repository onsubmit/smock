import { Func } from './mockFunction.js';

export type SpyResult<T> =
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

export interface SpyFunction<TFunc extends Func = Func> {
  (...args: Parameters<TFunc>): ReturnType<TFunc> | undefined;
  called: boolean;
  callCount: number;
  calls: Array<Parameters<TFunc>>;
  results: Array<SpyResult<ReturnType<TFunc>>>;
  returns: Array<ReturnType<TFunc> | undefined>;
}

export function spy<TFunc extends Func = Func>(fn: TFunc): SpyFunction<TFunc> {
  const spiedInitialValue = {
    called: false,
    callCount: 0,
    calls: [],
    results: [],
    returns: [],
  };

  const spied: SpyFunction<TFunc> = Object.assign(function (
    ...args: Parameters<TFunc>
  ): ReturnType<TFunc> | undefined {
    spied.called = true;
    spied.callCount++;
    spied.calls.push(args);
    spied.results.push({
      type: 'incomplete',
      value: undefined,
    });

    const result = spied.results.at(-1)!;

    let returnValue: ReturnType<TFunc> | undefined;
    try {
      returnValue = fn(...args);
      result.type = 'success';
      result.value = returnValue;
    } catch (e: any) {
      result.type = 'exception';
      result.value = e;
    }

    spied.returns.push(returnValue);
    return returnValue;
  }, spiedInitialValue);

  return spied;
}
