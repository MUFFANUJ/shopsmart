const AppError = require('../../src/utils/appError');
const {
  validateCreatePayload,
  validateUpdatePayload,
} = require('../../src/validators/taskValidator');

describe('taskValidator', () => {
  describe('validateCreatePayload', () => {
    it('normalizes valid payload', () => {
      const payload = validateCreatePayload({
        title: '  Buy milk  ',
        description: '  2 liters  ',
        completed: false,
      });

      expect(payload).toEqual({
        title: 'Buy milk',
        description: '2 liters',
        completed: false,
      });
    });

    it('throws AppError for missing title', () => {
      expect(() => validateCreatePayload({ description: 'No title' })).toThrow(AppError);
      expect(() => validateCreatePayload({ description: 'No title' })).toThrow(
        'Title is required and must be a non-empty string.',
      );
    });
  });

  describe('validateUpdatePayload', () => {
    it('throws AppError when no update keys are provided', () => {
      expect(() => validateUpdatePayload({})).toThrow(AppError);
      expect(() => validateUpdatePayload({})).toThrow(
        'At least one field must be provided for update.',
      );
    });

    it('accepts partial updates', () => {
      const payload = validateUpdatePayload({ completed: true });
      expect(payload).toEqual({ completed: true });
    });
  });
});
