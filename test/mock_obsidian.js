exports.requestUrl = req => {
  return fetch(req).then(res => res.json());
};
