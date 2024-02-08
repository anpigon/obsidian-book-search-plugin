import * as obsidian from 'obsidian';

function requestUrl(request: obsidian.RequestUrlParam | string): obsidian.RequestUrlResponsePromise {
  return fetch(request as never).then(res => res.json()) as obsidian.RequestUrlResponsePromise;
}

export { requestUrl };
