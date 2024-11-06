import { smock } from './index.js';

describe('mockFunction', () => {
  it('should execute a mocked function', () => {
    const mockFn = smock.fn((x: number) => 42 + x);

    expect(mockFn(0)).toBe(42);
    expect(mockFn(1)).toBe(43);
  });

  it('should track calls and results', () => {
    const mockFn = smock.fn((x: number) => x * 2);

    expect(mockFn.mock.called).toBe(false);
    expect(mockFn.mock.callCount).toBe(0);

    [1, 2, 3, 4].forEach((x) => mockFn(x));

    expect(mockFn.mock.called).toBe(true);
    expect(mockFn.mock.callCount).toBe(4);
    expect(mockFn.mock.calls).toEqual([[1], [2], [3], [4]]);
    expect(mockFn.mock.returns).toEqual([2, 4, 6, 8]);
  });

  it('should clear/reset calls and results', () => {
    for (const f of ['mockClear', 'mockReset'] as const) {
      const mockFn = smock.fn((x: number) => x * 2);

      [1, 2, 3, 4].forEach((x) => mockFn(x));
      expect(mockFn.mock.calls).toEqual([[1], [2], [3], [4]]);
      expect(mockFn.mock.returns).toEqual([2, 4, 6, 8]);

      mockFn[f]();
      expect(mockFn.mock.called).toBe(false);
      expect(mockFn.mock.callCount).toBe(0);
      expect(mockFn.mock.calls).toHaveLength(0);
      expect(mockFn.mock.returns).toHaveLength(0);

      [5, 6, 7, 8].forEach((x) => mockFn(x));
      expect(mockFn.mock.called).toBe(true);
      expect(mockFn.mock.callCount).toBe(4);
      expect(mockFn.mock.calls).toEqual([[5], [6], [7], [8]]);
      expect(mockFn.mock.returns).toEqual([10, 12, 14, 16]);
    }
  });

  it('should track last call', () => {
    const mockFn = smock.fn((x: number) => x * 2);
    expect(mockFn.mock.lastCall).toBeUndefined();

    [1, 2, 3, 4].forEach((x) => mockFn(x));
    expect(mockFn.mock.lastCall).toEqual([4]);
  });

  it('should not clear/reset last call', () => {
    for (const f of ['mockClear', 'mockReset'] as const) {
      const mockFn = smock.fn((x: number) => x * 2);
      expect(mockFn.mock.lastCall).toBeUndefined();

      [1, 2, 3, 4].forEach((x) => mockFn(x));
      expect(mockFn.mock.lastCall).toEqual([4]);

      mockFn[f]();
      expect(mockFn.mock.lastCall).toEqual([4]);
    }
  });

  it('should capture instances', () => {
    const mockFn = smock.fn();
    const instance1 = new mockFn();
    const instance2 = new mockFn();

    expect(mockFn.mock.instances).toEqual([instance1, instance2]);
  });

  it('should clear/reset instances', () => {
    for (const f of ['mockClear', 'mockReset'] as const) {
      const mockFn = smock.fn();
      const instance1 = new mockFn();
      const instance2 = new mockFn();

      expect(mockFn.mock.instances).toEqual([instance1, instance2]);

      mockFn[f]();
      expect(mockFn.mock.instances).toHaveLength(0);

      const instance3 = new mockFn();
      const instance4 = new mockFn();

      expect(mockFn.mock.instances).toEqual([instance3, instance4]);
    }
  });

  it('should capture contexts', () => {
    const mockFn = smock.fn();
    const thisContext1 = { context: 1 };
    const thisContext2 = { context: 2 };
    const thisContext3 = { context: 3 };

    const boundMockFn = mockFn.bind(thisContext1);
    boundMockFn('bind');
    mockFn.call(thisContext2, 'call');
    mockFn.apply(thisContext3, ['apply']);

    expect(mockFn.mock.contexts).toEqual([thisContext1, thisContext2, thisContext3]);
    expect(mockFn.mock.calls).toEqual([['bind'], ['call'], ['apply']]);
  });

  it('should clear/reset contexts', () => {
    for (const f of ['mockClear', 'mockReset'] as const) {
      const mockFn = smock.fn();
      const thisContext1 = { context: 1 };
      const thisContext2 = { context: 2 };
      const thisContext3 = { context: 3 };

      mockFn.bind(thisContext1)('bind');
      mockFn.call(thisContext2, 'call');
      mockFn.apply(thisContext3, ['apply']);

      expect(mockFn.mock.contexts).toEqual([thisContext1, thisContext2, thisContext3]);
      expect(mockFn.mock.calls).toEqual([['bind'], ['call'], ['apply']]);

      mockFn[f]();
      expect(mockFn.mock.contexts).toHaveLength(0);

      const thisContext4 = { context: 4 };
      const thisContext5 = { context: 5 };
      const thisContext6 = { context: 6 };

      mockFn.bind(thisContext4)('bind');
      mockFn.call(thisContext5, 'call');
      mockFn.apply(thisContext6, ['apply']);

      expect(mockFn.mock.contexts).toEqual([thisContext4, thisContext5, thisContext6]);
      expect(mockFn.mock.calls).toEqual([['bind'], ['call'], ['apply']]);
    }
  });

  it('should override the implementation', () => {
    const mockFn = smock.fn((x: number) => x * 2);
    mockFn.mockImplementation((x: number) => x * 3);

    expect(mockFn(1)).toBe(3);
    expect(mockFn(2)).toBe(6);
  });

  it('should override the implementation to return this', () => {
    const mockFn = smock.fn((x: number) => x * 2);

    const thisContext1 = { context: 1 };
    const bound = mockFn.bind(thisContext1);
    mockFn.mockReturnThis();

    expect(bound(4)).toEqual(thisContext1);
    expect(mockFn.mock.contexts).toEqual([thisContext1]);
  });

  it('should reset the implementation', () => {
    const mockFn = smock.fn((x: number) => x * 2);
    mockFn.mockImplementation((x: number) => x * 3);

    expect(mockFn(1)).toBe(3);
    expect(mockFn(2)).toBe(6);

    mockFn.mockReset();
    expect(mockFn(1)).toBe(2);
    expect(mockFn(2)).toBe(4);
  });

  it('should override the implementation once', () => {
    const mockFn = smock
      .fn(() => 'default')
      .mockImplementationOnce(() => '1st')
      .mockImplementationOnce(() => '2nd');

    expect(mockFn()).toBe('1st');
    expect(mockFn()).toBe('2nd');
    expect(mockFn()).toBe('default');
    expect(mockFn()).toBe('default');
  });

  it('should reset the implementations', () => {
    const mockFn = smock
      .fn(() => 'default')
      .mockImplementationOnce(() => '1st')
      .mockImplementationOnce(() => '2nd');

    expect(mockFn()).toBe('1st');

    mockFn.mockReset();
    expect(mockFn()).toBe('default');
  });

  it('should override the value', () => {
    const mockFn = smock.fn((x: number) => 42 + x);

    expect(mockFn(0)).toBe(42);
    expect(mockFn(1)).toBe(43);

    mockFn.mockReturnValue(52);
    expect(mockFn(0)).toBe(52);
    expect(mockFn(1)).toBe(52);
  });

  it('should override the value once', () => {
    const mockFn = smock
      .fn(() => 'default')
      .mockReturnValueOnce('1st')
      .mockReturnValueOnce('2nd');

    expect(mockFn()).toBe('1st');
    expect(mockFn()).toBe('2nd');
    expect(mockFn()).toBe('default');
    expect(mockFn()).toBe('default');
  });

  it('should override the resolved value', async () => {
    const mockFnAsync = smock.fn(async (x: number) => Promise.resolve(42 + x));

    expect(await mockFnAsync(0)).toBe(42);
    expect(await mockFnAsync(1)).toBe(43);

    mockFnAsync.mockResolvedValue(52);
    expect(await mockFnAsync(0)).toBe(52);
    expect(await mockFnAsync(1)).toBe(52);
  });

  it('should override the resolved value once', async () => {
    const mockFnAsync = smock
      .fn(() => Promise.resolve('default'))
      .mockResolvedValueOnce('1st')
      .mockResolvedValueOnce('2nd');

    expect(await mockFnAsync()).toBe('1st');
    expect(await mockFnAsync()).toBe('2nd');
    expect(await mockFnAsync()).toBe('default');
    expect(await mockFnAsync()).toBe('default');
  });

  it('should override the rejected value', async () => {
    const mockFnAsync = smock.fn().mockRejectedValue(new Error('Async error'));

    await expect(mockFnAsync).rejects.toThrow('Async error');
  });

  it('should override the rejected value once', async () => {
    const mockFnAsync = smock
      .fn(() => Promise.reject(new Error('default')))
      .mockRejectedValueOnce(new Error('1st'))
      .mockRejectedValueOnce(new Error('2nd'));

    await expect(mockFnAsync).rejects.toThrow('1st');
    await expect(mockFnAsync).rejects.toThrow('2nd');
    await expect(mockFnAsync).rejects.toThrow('default');
    await expect(mockFnAsync).rejects.toThrow('default');
  });

  it('should override the implementation temporarily', () => {
    const mockFn = smock.fn((x: number) => 42 + x);

    expect(mockFn(2)).toBe(44);

    mockFn.withImplementation(
      (x: number) => 42 - x,
      () => expect(mockFn(2)).toBe(40),
    );

    expect(mockFn(2)).toBe(44);
  });
});
