//stores key:value pair in local storage
exports.postStore = (key, value) => {
  return localStorage.setItem(key, JSON.stringify(value));
};

//retrive value from key (local storage)
exports.getStore = (key) => {
  return JSON.parse(localStorage.getItem(key));
};
//clear the local storage
exports.clearStore = () => {
  localStorage.clear();
  return true;
};
