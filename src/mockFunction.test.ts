import { smock } from './index.js';

describe('mockFunction', () => {
  it('should execute a mocked function', () => {
    const mockFn = smock.fn((x: number) => 42 + x);

    expect(mockFn(0)).toBe(42);
    expect(mockFn(1)).toBe(43);
  });

  it('should track calls and results', () => {
    const mockFn = smock.fn((x: number) => x * 2);

    [1, 2, 3, 4].forEach((x) => mockFn(x));

    expect(mockFn.mock.calls).toHaveLength(4);
    expect(mockFn.mock.calls).toEqual([[1], [2], [3], [4]]);

    expect(mockFn.mock.results).toHaveLength(4);
    expect(mockFn.mock.results).toEqual([2, 4, 6, 8]);
  });

  it('should capture instances', () => {
    const mockFn = smock.fn();
    const instance1 = new mockFn();
    const instance2 = new mockFn();

    expect(mockFn.mock.instances).toHaveLength(2);
    expect(mockFn.mock.instances).toEqual([instance1, instance2]);
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

    expect(mockFn.mock.contexts).toHaveLength(3);
    expect(mockFn.mock.contexts).toEqual([thisContext1, thisContext2, thisContext3]);

    expect(mockFn.mock.calls).toHaveLength(3);
    expect(mockFn.mock.calls).toEqual([['bind'], ['call'], ['apply']]);
  });

  it('should override the implementation', () => {
    const mockFn = smock.fn((x: number) => x * 2);
    mockFn.mockImplementation((x: number) => x * 3);

    expect(mockFn(1)).toBe(3);
    expect(mockFn(2)).toBe(6);
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
});
