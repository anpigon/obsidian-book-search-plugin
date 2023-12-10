import * as obsidian from 'obsidian';

export const requestUrl: typeof obsidian.requestUrl = req => {
  return fetch(req as never).then(res => res.json()) as obsidian.RequestUrlResponsePromise;
};
