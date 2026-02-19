const { test, expect } = require('@playwright/test');

test.describe('E2E: / (http)', () => {
  test('root page shows service message', async ({ request }) => {
    const res = await request.get('/');
    expect(res.status()).toBe(200);
    const text = await res.text();
    expect(text).toContain('ShopSmart Backend Service');
  });
});
