import { smock } from './index.js';

describe('spy', () => {
  it('should spy on a method', () => {
    const fn = (n: string) => n + '!';
    const spied = smock.spy(fn);

    expect(spied.called).toBe(false);
    expect(spied.callCount).toBe(0);
    expect(spied.calls).toEqual([]);
    expect(spied.length).toBe(1);
    expect(spied.results).toEqual([]);
    expect(spied.returns).toEqual([]);

    spied('a');

    expect(spied.called).toBe(true);
    expect(spied.callCount).toBe(1);
    expect(spied.calls).toEqual([['a']]);
    expect(spied.length).toBe(1);
    expect(spied.results).toEqual([{ type: 'success', value: 'a!' }]);
    expect(spied.returns).toEqual(['a!']);
  });
});
