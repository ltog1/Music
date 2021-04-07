const SEARCH_HISTORY_KEY = '_search_';
const SEARCH_MAX_LENGTH = 15;

const PLAY_KEY = '_play_';
const PLAY_MAX_LENGTH = 200;

const FAVORITE_KEY = '_favorite_';
const FAVORITE_MAX_LENGTH = 200;

function deleteFromArray(list,fn) {
  let index = list.findIndex(fn);
  console.log(index);
  if (index > -1) {
    list.splice(index,1);
  }
}

function insertArray(list,fn,length,item) {
  let index = list.findIndex(fn);
  if (index > -1) {
    list.splice(index,1);
  }
  list.unshift(item);

  if (list.length > length) {
    list.pop();
  }
}

function getSearch() {
  let searchList = JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY)) || [];
  return searchList;
}

function saveSearch(key) {
  let searchList = getSearch();

  insertArray(searchList,item => {
    return item === key;
  },SEARCH_MAX_LENGTH,key);

  localStorage.setItem(SEARCH_HISTORY_KEY,JSON.stringify(searchList));
  return searchList;
}

function deleteSearch(key) {
  let searchList = getSearch();

  deleteFromArray(searchList,item => {
    return item === key;
  });

  localStorage.setItem(SEARCH_HISTORY_KEY,JSON.stringify(searchList));
  return searchList;
}

function clearSearch() {
  localStorage.removeItem(SEARCH_HISTORY_KEY);
  return [];
}

function getFavorite() {
  let favoriteList = JSON.parse(localStorage.getItem(FAVORITE_KEY)) || [];
  return favoriteList;
}

function saveFavorite(song) {
  let favoriteList = getFavorite();

  favoriteList.unshift(song);
  localStorage.setItem(FAVORITE_KEY,JSON.stringify(favoriteList));
  return favoriteList;
}

function deleteFavorite(song) {
  let favoriteList = getFavorite();

  deleteFromArray(favoriteList,item => {
    return item.id === song.id;
  });

  localStorage.setItem(FAVORITE_KEY,JSON.stringify(favoriteList));
  return favoriteList;
}

function getPlaySong() {
  let playSong = JSON.parse(localStorage.getItem(PLAY_KEY)) || [];
  return playSong;
}

function savePlaySong(song) {
  let playSong = getPlaySong();

  insertArray(playSong,item => {
    return item.id === song.id;
  },PLAY_KEY,song);

  localStorage.setItem(PLAY_KEY,JSON.stringify(playSong));
  return playSong;
}

export default {
  getSearch,
  saveSearch,
  deleteSearch,
  clearSearch,
  getFavorite,
  saveFavorite,
  deleteFavorite,
  getPlaySong,
  savePlaySong
}