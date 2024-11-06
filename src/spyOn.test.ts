import { smock } from './index.js';

describe('spyOn', () => {
  it('should return a mock function', () => {
    let apples = 0;
    const cart = {
      getApples: () => 42,
    };

    const spy = smock.spyOn(cart, 'getApples').mockImplementation(() => apples);
    apples = 1;

    expect(cart.getApples()).toBe(1);
    expect(spy.mock.called).toBe(true);
    expect(spy.mock.callCount).toBe(1);
    expect(spy.mock.calls).toEqual([[]]);
    expect(spy.mock.returns).toEqual([1]);

    apples = 2;
    expect(spy()).toBe(2);
    expect(spy.mock.called).toBe(true);
    expect(spy.mock.callCount).toBe(2);
    expect(spy.mock.calls).toEqual([[], []]);
    expect(spy.mock.returns).toEqual([1, 2]);
  });
});
