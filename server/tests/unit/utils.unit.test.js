const { test, expect } = require('@playwright/test');
const { add } = require('../../src/utils');

test.describe('utils.add (unit)', () => {
  test('adds two numbers', () => {
    expect(add(1, 2)).toBe(3);
    expect(add(-1, 5)).toBe(4);
  });
});
