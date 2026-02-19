const { test, expect } = require('@playwright/test');

test.describe('GET /api/health (integration)', () => {
  test('returns status ok and message', async ({ request }) => {
    const res = await request.get('/api/health');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('status', 'ok');
    expect(body).toHaveProperty('message');
  });
});
