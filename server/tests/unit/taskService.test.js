const AppError = require('../../src/utils/appError');
const { normalizeId } = require('../../src/services/taskService');

describe('taskService.normalizeId', () => {
  it('returns numeric ids', () => {
    expect(normalizeId('42')).toBe(42);
    expect(normalizeId(7)).toBe(7);
  });

  it('throws AppError for invalid ids', () => {
    expect(() => normalizeId('abc')).toThrow(AppError);
    expect(() => normalizeId(0)).toThrow('Task id must be a positive integer.');
  });
});
