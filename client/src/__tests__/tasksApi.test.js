import { parseResponse } from '../api/tasksApi';

describe('parseResponse', () => {
  it('returns json payload for successful responses', async () => {
    const payload = { id: 1, title: 'Task A' };
    const response = {
      ok: true,
      status: 200,
      headers: {
        get: () => 'application/json',
      },
      json: jest.fn().mockResolvedValue(payload),
    };

    await expect(parseResponse(response)).resolves.toEqual(payload);
  });

  it('throws server message on failure', async () => {
    const response = {
      ok: false,
      status: 400,
      headers: {
        get: () => 'application/json',
      },
      json: jest.fn().mockResolvedValue({
        error: {
          message: 'Bad request',
        },
      }),
    };

    await expect(parseResponse(response)).rejects.toThrow('Bad request');
  });
});
