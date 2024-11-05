import { smock } from './index.js';

describe('spyOn', () => {
  it('should return a mock function', () => {
    let apples = 0;
    const cart = {
      getApples: () => 42,
    };

    smock.spyOn(cart, 'getApples').mockImplementation(() => apples);
    apples = 1;

    expect(cart.getApples()).toBe(1);
  });
});
