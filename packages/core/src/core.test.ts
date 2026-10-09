import { describe, expect, it } from 'vitest';
import { gradientId, nGonPoints, paintFor, resolveFill } from './index';

describe('resolveFill', () => {
  it('resolves absent, solid and gradient fills', () => {
    expect(resolveFill(undefined)).toEqual({ kind: 'none' });
    expect(resolveFill('#f00')).toEqual({ kind: 'color', color: '#f00' });
    expect(
      resolveFill({
        type: 'gradient',
        angle: 90,
        stops: [
          { offset: 0, color: 'red' },
          { offset: 0.5, color: 'blue' },
        ],
      }),
    ).toEqual({
      kind: 'gradient',
      transform: 'rotate(90, 0.5, 0.5)',
      stops: [
        { offset: '0%', color: 'red' },
        { offset: '50%', color: 'blue' },
      ],
    });
  });

  it('produces paint values', () => {
    expect(paintFor(resolveFill(undefined), 'x')).toBe('none');
    expect(paintFor(resolveFill('red'), 'x')).toBe('red');
    expect(paintFor(resolveFill({ type: 'gradient', stops: [] }), 'x')).toBe('url(#x)');
  });
});

describe('gradientId', () => {
  it('strips characters that are unsafe inside url(#...)', () => {
    expect(gradientId(':r1:')).toBe('ictk-fill-r1');
    expect(gradientId('«r2»')).toBe('ictk-fill-r2');
  });
});

describe('nGonPoints', () => {
  it('generates the expected vertex count', () => {
    expect(nGonPoints(6).split(' ')).toHaveLength(6);
    expect(nGonPoints(4, { rotation: 45 })).toBe('85.36,85.36 14.64,85.36 14.64,14.64 85.36,14.64');
  });
});
