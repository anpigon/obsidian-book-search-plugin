import * as obsidian from 'obsidian';

export const requestUrl: typeof obsidian.requestUrl = (request: string | obsidian.RequestUrlParam) => {
  return fetch(request as string).then(res => res.json()) as obsidian.RequestUrlResponsePromise;
};
