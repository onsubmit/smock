import { smock } from './index.js';

describe('spy', () => {
  it('should spy', () => {
    const fn = (n: string) => n + '!';
    const spied = smock.spy(fn);

    spied('a');

    expect(spied.called).toBe(true);
    expect(spied.callCount).toBe(1);
    expect(spied.calls).toEqual([['a']]);
    expect(spied.results).toEqual([{ type: 'success', value: 'a!' }]);
    expect(spied.returns).toEqual(['a!']);
  });
});
