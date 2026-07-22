import { requestUrl } from 'obsidian';
import { apiGet } from './base_api';

jest.mock('obsidian', () => ({
  requestUrl: jest.fn(),
}));

const mockedRequestUrl = requestUrl as jest.MockedFunction<typeof requestUrl>;

function response(status: number, json: unknown = {}) {
  return { status, json } as Awaited<ReturnType<typeof requestUrl>>;
}

describe('apiGet', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockedRequestUrl.mockReset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns the parsed body on success', async () => {
    mockedRequestUrl.mockResolvedValueOnce(response(200, { totalItems: 1 }));

    await expect(apiGet('https://example.com')).resolves.toEqual({ totalItems: 1 });
    expect(mockedRequestUrl).toHaveBeenCalledTimes(1);
  });

  it('retries transient 503 responses until one succeeds', async () => {
    mockedRequestUrl
      .mockResolvedValueOnce(response(503))
      .mockResolvedValueOnce(response(503))
      .mockResolvedValueOnce(response(200, { totalItems: 2 }));

    const promise = apiGet('https://example.com');
    await jest.runAllTimersAsync();

    await expect(promise).resolves.toEqual({ totalItems: 2 });
    expect(mockedRequestUrl).toHaveBeenCalledTimes(3);
  });

  it('retries 429 responses', async () => {
    mockedRequestUrl.mockResolvedValueOnce(response(429)).mockResolvedValueOnce(response(200, { totalItems: 3 }));

    const promise = apiGet('https://example.com');
    await jest.runAllTimersAsync();

    await expect(promise).resolves.toEqual({ totalItems: 3 });
    expect(mockedRequestUrl).toHaveBeenCalledTimes(2);
  });

  it('gives up after the maximum number of attempts', async () => {
    mockedRequestUrl.mockResolvedValue(response(503));

    const promise = apiGet('https://example.com');
    promise.catch(() => undefined); // avoid unhandled rejection while timers run
    await jest.runAllTimersAsync();

    await expect(promise).rejects.toThrow('Request failed, status 503');
    expect(mockedRequestUrl).toHaveBeenCalledTimes(8);
  });

  it('does not retry non-transient errors', async () => {
    mockedRequestUrl.mockResolvedValueOnce(response(400));

    await expect(apiGet('https://example.com')).rejects.toThrow('Request failed, status 400');
    expect(mockedRequestUrl).toHaveBeenCalledTimes(1);
  });
});
