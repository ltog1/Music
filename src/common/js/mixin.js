import { mapState, mapMutations, mapGetters } from "vuex";
import { shuffle } from 'common/js/util'

export const playListMixin = {
  watch: {
    playList(newPlayList) {
      this.$_handlerPlayList(newPlayList);
    }
  },
  computed: {
    ...mapState([
      'playList'
    ])
  },
  mounted() {
    this.$_handlerPlayList(this.playList);
  },
  activated() {
    this.$_handlerPlayList(this.playList);
  },
  methods: {
    $_handlerPlayList() {
      // 组件引用时必须使用该函数,组件内定义的同名函数会覆盖该函数
      throw new Error('component must implement $_handlerPlayList methods');
    }
  }
}


function findIndex(list,song) {
  return list.findIndex(item => {
    return item.id === song.id;
  });
}
export const playerMixin = {
  computed: {
    ...mapState([
      'mode',
      'playList',
      'sequenceList'
    ]),
    ...mapGetters([
      'currentSong'
     ]),
    $_iconMode() {
      let iconMode = this.mode === 0 ? 'icon-sequence' : this.mode === 1 ? 'icon-loop' : 'icon-random';
      return iconMode;
    },
  },
  methods: {
    $_changeMode() {
      let mode = this.mode === 0 ? 1 : this.mode === 1 ? 2 : 0;
      this.setMode(mode);

      if (mode === 0) { // 顺序播放
        this.$_sequencePlay();
      } else if (mode === 2) { // 随机播放
        this.$_randomPlay();
      }
    },
    $_sequencePlay() {
      let index = findIndex(this.sequenceList,this.currentSong);
      this.setCurrentIndex(index);
      this.setPlayList(this.sequenceList);
    },
    $_randomPlay() {
      let randomList = shuffle(this.playList.concat());
      let index = findIndex(randomList,this.currentSong);

      this.setCurrentIndex(index);
      this.setPlayList(randomList);
    },
    ...mapMutations([
      'setMode',
      'setPlayList',
      'setCurrentIndex',
    ])
  }
}

export const searchMixin = {

}
