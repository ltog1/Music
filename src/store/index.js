import Vue from 'vue'
import Vuex from 'vuex'
import createLogger from 'vuex/dist/logger'
import cache from 'common/js/cache'
import { shuffle } from 'common/js/util'

Vue.use(Vuex)

const playMode = {
  sequence: 0,
  loop: 1,
  random: 2
}

const findIndex = (list,song) => {
  return list.findIndex(item => {
    return item.id === song.id;
  });
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
    searchHistory: cache.getSearch(), // 搜索历史
    playHistory: cache.getPlaySong(), // 播放历史
    favoriteList: cache.getFavorite()  // 我最喜欢的
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
    },
    insertSong({ state, commit }, song) {
      let playList = state.playList.concat(),
        sequenceList = state.sequenceList.concat(),
        currentIndex = state.currentIndex;

      /***因为播放列表控制着歌曲播放,所以播放列表的currentIndex要因为插入的数组长度变化而随之改变****/
      let currentSong = playList[currentIndex];
      let fpIndex = findIndex(playList,song);
      // 当前要插入的歌曲在播放列表中已有
      if (fpIndex > -1) {
        if (currentIndex < fpIndex) {
          currentIndex++;
        }
        playList.splice(fpIndex,1);
      } else {  // 当前要插入的歌曲在播放列表中没有
        currentIndex++;
      }
      playList.splice(currentIndex,0,song);


      /***而顺序播放列表不控制着歌曲播放,所以改变顺序播放列表时currentIndex不用随之改变****/
      let currentSIndex = findIndex(sequenceList,currentSong);
      let fsIndex = findIndex(sequenceList,song);
      // 当前要插入的歌曲在顺序列表中已有
      if (fsIndex > -1) {
        if (currentSIndex < fsIndex) {
          currentSIndex++;
        }
        sequenceList.splice(fsIndex,1);
      } else { // 当前要插入的歌曲在顺序列表中没有
        currentSIndex++;
      }
      sequenceList.splice(currentSIndex,0,song);

      commit('setPlaying', true);
      commit('setFullScreen', true);
      commit('setPlayList',playList);
      commit('setSequenceList',sequenceList);
      commit('setCurrentIndex',currentIndex);
    },
    randomPlay({ state, commit }, list) {
      let newList = shuffle(list);
      commit('setMode',playMode.random);
      commit('setPlaying', true);
      commit('setFullScreen', true);
      commit('setPlayList',newList);
      commit('setSequenceList',list);
      commit('setCurrentIndex',0);
    },
    clearPlaySong({ commit }) {
      commit('setPlaying', false);
      commit('setPlayList',[]);
      commit('setSequenceList',[]);
      commit('setCurrentIndex',-1);
    },
    deletePlaySong({ state, commit }, song) {
      let playList = state.playList.concat(),
        sequenceList = state.sequenceList.concat(),
        currentIndex = state.currentIndex;

      let index = findIndex(playList,song);
      playList.splice(index,1);
      if (index < currentIndex || currentIndex === playList.length) {
        currentIndex--;
      }

      let fsIndex = findIndex(sequenceList,song);
      sequenceList.splice(fsIndex,1);

      if (!playList.length) {
        commit('setPlaying', false);
      } else {
        commit('setPlaying', true);
      }

      commit('setPlayList',playList);
      commit('setSequenceList',sequenceList);
      commit('setCurrentIndex',currentIndex);
    }
  },
  modules: {

  }
})
