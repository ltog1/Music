import Vue from 'vue'
import Vuex from 'vuex'
import createLogger from 'vuex/dist/logger'
Vue.use(Vuex)

const playMode = {
  sequence: 0,
  loop: 1,
  random: 2
}


export default new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  plugins: process.env.NODE_ENV !== 'production' ? [createLogger()] : [],
  state: {
    singer: {}, // 歌手
    disc: {}, // 歌单信息
    topList: {}, // 排行榜信息
    playing: false, // 是否播放
    fullScreen: false, // 是否全屏播放
    playList: [], // 播放列表
    sequenceList: [], // 顺序播放列表
    mode: playMode.sequence, // 播放顺序
    currentIndex: -1,
    searchHistory: [], // 搜索历史
    playHistory: [], // 播放历史
    favoriteList: []  // 我最喜欢的
  },
  getters: {
    currentSong(state) {
      return state.playList[state.currentIndex] || {};
    }
  },
  mutations: {
    setSinger(state,singer) {
      state.singer = singer;
    },
    setDisc(state,disc) {
      state.disc = disc;
    },
    setTopList(state,top) {
      state.topList = top;
    },
    setPlaying(state,flag) {
      state.playing = flag;
    },
    setFullScreen(state,flag) {
      state.fullScreen = flag;
    },
    setPlayList(state,list) {
      state.playList = list;
    },
    setSequenceList(state,list) {
      state.sequenceList = list;
    },
    setMode(state,mode) {
      state.mode = mode;
    },
    setCurrentIndex(state,index) {
      state.currentIndex = index;
    },
    setSearchHistory(state,history) {
      state.searchHistory = history;
    },
    setPlayHistory(state,history) {
      state.playHistory = history;
    },
    setFavoriteList(state,list) {
      state.favoriteList = list;
    },
  },
  actions: {
    selectPlay({ state, commit } , { list, index}) {
      commit('setPlaying', true);
      commit('setFullScreen', true);
      commit('setPlayList',list);
      commit('setSequenceList',list);
      commit('setCurrentIndex',index);
    }
  },
  modules: {

  }
})
