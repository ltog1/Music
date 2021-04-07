<template>
  <div class="player" v-show="playList.length">
    <transition name="normal" @enter="enter" @after-enter="afterEnter" @leave="leave" @after-leave="afterLeave">
      <div class="normal-player" v-show="fullScreen">
        <div class="background"><img width="100%" height="100%" :src="currentSong.image"></div>
        <div class="top">
          <div class="back" @click="shrinkFullScreen"><i class="icon-back"></i></div>
          <h1 class="title">{{ currentSong.name }}</h1>
          <h2 class="subtitle">{{ currentSong.singer }}</h2>
        </div>
        <div class="middle"
             @touchstart.prevent="middleTouchStart"
             @touchmove.prevent="middleTouchMove"
             @touchend="middleTouchEnd">
          <div class="middle-l" ref="middleL">
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd" ref="cd"><img class="image" ref="middleImage" :class="{ 'play': playing }" :src="currentSong.image"></div>
            </div>
            <div class="playing-lyric-wrapper"><div class="playing-lyric">{{ playingLyric }}</div></div>
          </div>

          <scroll class="middle-r" :data="currentLyric && currentLyric.lines" ref="lyricList">
            <div class="lyric-wrapper">
              <div class="currentLyric" v-if="currentLyric">
                <p class="text"
                   ref="lyricLine"
                   v-for="(line,index) in currentLyric.lines"
                   :key="index"
                   :class="{'current': currentLineNum === index}">{{ line.txt }}</p>
              </div>
            </div>
          </scroll>
        </div>

        <div class="bottom">
          <div class="progress-wrapper">
            <span class="time time-l">{{ tocountdown(currentTime) }}</span>
            <div class="progress-bar-wrapper">
              <progress-bar @progressChange="progressChange" :currentPercent="currentPercent"></progress-bar>
            </div>
            <span class="time time-r">{{ tocountdown(currentSong.duration) }}</span>
          </div>
          <div class="operators">
            <div class="icon i-left"><i :class="$_iconMode" @click="$_changeMode"></i></div>
            <div class="icon i-left"><i class="icon-prev" @click="prev"></i></div>
            <div class="icon i-center"><i :class="[ playing ? 'icon-pause': 'icon-play' ]" @click="togglePlaying"></i></div>
            <div class="icon i-right"><i class="icon-next" @click="next"></i></div>
            <div class="icon i-right" @click="$_toggleFavorite(currentSong)"><i class="icon" :class="$_getFavoriteIcon(currentSong)"></i></div>
          </div>
        </div>
      </div>
    </transition>

    <transition name="mini">
      <div class="mini-player" v-show="!fullScreen">
        <div class="mini-player">
          <div class="icon" @click="openFullScreen">
            <div class="imgWrapper" ref="miniImageWraper">
              <img ref="miniImage" width="40" height="40px" :src="currentSong.image" :class="{'play': playing}">
            </div>
          </div>
          <div class="text">
            <h2 class="name">{{ currentSong.name }}</h2>
            <p class="desc">{{ currentSong.singer }}</p>
          </div>
          <div class="control">
            <progress-circle :currentPercent="currentPercent">
              <i :class="[ playing ? 'icon-pause-mini': 'icon-play-mini' ]" class="icon-mini" @click.stop="togglePlaying"></i>
            </progress-circle>
          </div>
          <div class="control" @click.stop="showPlaylist"><i class="icon-playlist"></i></div>
        </div>
      </div>
    </transition>

    <play-list ref="playlist"></play-list>
    <audio ref="audio" :src="currentSong.url" @timeupdate="timeupdate" @ended="ended" @canplay="canplay" @error="error"></audio>
  </div>
</template>

<script>
  import ProgressBar from 'base/progress-bar'
  import ProgressCircle from 'base/progress-circle'
  import Scroll from 'base/scroll'
  import PlayList from 'components/playlist'
  import { mapState, mapGetters, mapMutations } from 'vuex'
  import { playerMixin } from 'common/js/mixin'
  import cache from 'common/js/cache'
  import Lyric from 'lyric-parser'
  export default {
    name: "index",
    components: {
      ProgressBar,
      ProgressCircle,
      Scroll,
      PlayList
    },
    mixins: [ playerMixin ],
    data() {
      return {
        currentTime: 0,
        currentPercent: 0,
        songReady: false,
        currentLyric: null, // 歌词
        currentLineNum: 0, // 当前歌词高亮的行数
        currentShow: 'cd', // 大播放cd和歌词列表的切换显示
        playingLyric: '', // 大播放cd歌词
      };
    },
    computed: {
      ...mapState([
        'playList',
        'playing',
        'fullScreen',
        'currentIndex',
        'sequenceList',
        'mode'
      ]),
      ...mapGetters([
        'currentSong'
      ]),
    },
    watch: {
      currentSong(newSong,oldSong) {
        if (newSong.id === oldSong.id) {
          return ;
        }

        if (!this.playList.length) {
          this.pause();
          return ;
        }

        // 如果存在上一首歌的歌词,则停止上一首的歌词播放,且初始化
        if (this.currentLyric) {
          this.currentLyric.stop();
          this.currentLineNum = 0;
          this.playingLyric = '';
          this.currentLyric = null;
          this.$refs.lyricList.scrollTo(0,0);
        }

        this.songReady = false;
        this.$nextTick(() => {
          this.play();
          this.getLyric();
          this.setPlaying(true);
        });
      }
    },
    created() {
      this.touch = {
        isStart: false,
        startX: 0,
        startY: 0,
        moveX: 0,
        clientWidth: 0,
      }
    },
    methods: {
      getLyric() {
        if (this.currentSong.id) {
          this.currentSong.getLyric().then(lyric => {
            this.currentLyric = new Lyric(lyric,this.handleLyric);
            if (this.playing) {
              this.currentLyric.play();
            }
          }).catch(() => {  // 获取不到歌词时,清理操作
            this.currentLineNum = 0;
            this.playingLyric = '';
            this.currentLyric = null;
          });
        }
      },
      // 歌词变化时的函数
      handleLyric({ lineNum, txt }) {
        this.currentLineNum = lineNum;
        this.playingLyric = txt;
        // 让歌词高亮始终显示在正中间, (滚动条向上滚动)
        if (lineNum > 5) {
          let lineEl = this.$refs.lyricLine[lineNum - 5];
          if (lineEl) {
            this.$refs.lyricList.scrollToElement(lineEl,1000);
          }
        }
      },
      middleTouchStart(e) {
        const touch = this.touch;
        touch.isStart = true;
        touch.clientWidth = window.innerWidth;
        touch.startX = e.touches[0].pageX;
        touch.startY = e.touches[0].pageY;
      },
      middleTouchMove(e) {
        const touch = this.touch;
        if (!touch.isStart) {
          return ;
        }

        let diffX = e.touches[0].pageX - touch.startX,
          diffY = e.touches[0].pageY - touch.startY;

        // 如果当前在cd页且滚动大于0 或 纵向滚动大于横向滚动
        if (this.currentShow === 'cd' && diffX >= 0 || Math.abs(diffY) > Math.abs(diffX)) {
          return ;
        }

        let left = this.currentShow === 'cd' ? 0 : -touch.clientWidth;
        touch.moveX = Math.min(Math.max(-touch.clientWidth, left += diffX),0);
        touch.percent = Math.abs(touch.moveX / touch.clientWidth);

        this.setLyrictDom(touch.moveX,1 - touch.percent);
      },
      middleTouchEnd() {
        const touch = this.touch;
        touch.isStart = false;

        let moveX = 0, opacity = 0, currentShow = 'cd';
        if (this.currentShow === 'cd') { // 从右向左滑动
          if (touch.moveX <= -200) {
            moveX = -touch.clientWidth;
            currentShow = 'lyric';
          } else {
            opacity = 1;
          }
        } else { // 从左向右滑动
          if (touch.moveX >= -250) {
            opacity = 1;
          } else {
            moveX = -touch.clientWidth;
            currentShow = 'lyric';
          }
        }
        this.currentShow = currentShow;
        this.setLyrictDom(moveX,opacity);
      },
      setLyrictDom(x,opacity) {
        this.$refs.lyricList.$el.style.transform = `translate3d(${x}px,0,0)`;
        this.$refs.middleL.style.opacity = opacity;
      },
      // 动画入场
      enter() {
        const { moveX, moveY, scale } = this.getPosAndScale();

        this.animate = this.$refs.cdWrapper.animate([
          {
            transform: `translate3d(-${moveX}px,${moveY}px,0) scale(${scale})`
          },
          {
            transform: `translate3d(0px,0px,0) scale(1.1)`
          },
          {
            transform: `translate3d(0px,0px,0) scale(1)`
          }
        ],{
          duration: 400,
          easing: 'linear'
        });
      },
      // 动画入场之后
      afterEnter() {
        this.animate = '';
      },
      // 动画离场
      leave() {
        const { moveX, moveY, scale } = this.getPosAndScale();

        this.animate = this.$refs.cdWrapper.animate([
          {
            transform: `translate3d(0,0,0) scale(1)`
          },
          {
            transform: `translate3d(-${moveX}px,${moveY}px,0) scale(${scale})`
          }
        ],{
          duration: 400,
          easing: 'linear'
        });
      },
      // 动画离场之后
      afterLeave() {
        this.animate = '';
      },
      // 计算大播放cd和小播放cd的偏移量
      getPosAndScale() {
        let miniImage = this.$refs.miniImage,
          cdWrapper = this.$refs.cdWrapper,
          left = miniImage.offsetLeft + miniImage.clientWidth / 2;

        let moveX = window.innerWidth / 2 - left;
        let moveY = window.innerHeight - 80 - (cdWrapper.clientHeight / 2) - 30;
        let scale = miniImage.clientWidth / cdWrapper.clientWidth;

        return { moveX, moveY, scale };
      },
      togglePlaying() {
        this.setPlaying(!this.playing);
        this.currentLyric.togglePlay();
        if (this.playing) {
          this.play();
        } else {
          this.pause();

          if (this.fullScreen) {
            this.syncWrapperTransform(this.$refs.cd, this.$refs.middleImage);
          } else {
            this.syncWrapperTransform(this.$refs.miniImageWraper, this.$refs.miniImage);
          }
        }
      },
      // 计算内层Image的transform旋转, 并同步到外层容器
      syncWrapperTransform(wrapper,inner) {
        let wrapperTransform = window.getComputedStyle(wrapper, null).transform;
        let innerTransform = window.getComputedStyle(inner, null).transform;
        let newTransform = wrapperTransform === 'none' ? innerTransform : wrapperTransform.concat(' ', innerTransform);
        wrapper.style.transform = newTransform;
      },
      prev() {
        if (!this.songReady) {
          return ;
        }
        // 当列表只有一首歌时
        if (this.playList.length === 1) {
          this.loop();
          return ;
        }

        let currentIndex = this.currentIndex;
        currentIndex--;
        if (currentIndex < 0) {
          currentIndex = this.playList.length - 1;
        }
        this.setCurrentIndex(currentIndex);
      },
      next() {
        if (!this.songReady) {
          return ;
        }
        // 当列表只有一首歌时
        if (this.playList.length === 1) {
          this.loop();
          return ;
        }

        let currentIndex = this.currentIndex;
        currentIndex++;
        if (currentIndex >= this.playList.length) {
          currentIndex = 0
        }
        this.setCurrentIndex(currentIndex);
      },
      progressChange(percent) {
        let currentTime = percent * this.currentSong.duration;
        this.$refs.audio.currentTime = currentTime;

        if (this.currentLyric) {
          this.currentLyric.seek(currentTime * 1000);
        }
      },
      timeupdate() {
        this.currentTime = this.$refs.audio.currentTime;
        this.currentPercent = this.currentTime / this.currentSong.duration; // 当前播放时间和总时长的比例
      },
      // 已加载好,可以播放
      canplay() {
        this.songReady = true;
        this.setPlayHistory(cache.savePlaySong(this.currentSong));
      },
      // 加载出错
      error() {
        this.songReady = true;
      },
      // 播放结束
      ended() {
        if (this.mode === 1) {
          this.loop();
        } else {
          this.next();
        }
      },
      loop() {
        this.$refs.audio.currentTime = 0;
        this.play();

        if (this.currentLyric) {
          this.currentLineNum = 0;
          this.currentLyric.seek(0);
          this.$refs.lyricList.scrollTo(0,0,1000);
        }
      },
      tocountdown(currentTime) {
        let str = '00:00';
        if (currentTime > 0) {
          let minute = this.toTwo(Math.floor((currentTime / 60) % 60)),
            seconds = this.toTwo(Math.floor(currentTime % 60));
          str = `${minute}:${seconds}`;
        }
        return str;
      },
      toTwo(value) {
        return (value >= 10 ? '' : '0') + value;
      },
      play() {
        this.$refs.audio.play();
      },
      pause() {
        this.$refs.audio.pause();
      },
      shrinkFullScreen() {
        this.setFullScreen(false);
      },
      openFullScreen() {
        this.setFullScreen(true);
      },
      showPlaylist() {
        this.$refs.playlist.show();
      },
      ...mapMutations([
        'setFullScreen',
        'setPlaying',
        'setPlayList',
        'setCurrentIndex',
        'setMode',
        'setPlayHistory'
      ])
    }
  }
</script>

<style scoped lang="stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .player
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      z-index: 150
      background: $color-background
      .background
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        z-index: -1
        opacity: 0.6
        filter: blur(20px)
      .top
        position: relative
        margin-bottom: 25px
        .back
          position absolute
          top: 0
          left: 6px
          z-index: 50
          .icon-back
            display: block
            padding: 9px
            font-size: $font-size-large-x
            color: $color-theme
            transform: rotate(-90deg)
        .title
          width: 70%
          margin: 0 auto
          line-height: 40px
          text-align: center
          no-wrap()
          font-size: $font-size-large
          color: $color-text
        .subtitle
          line-height: 20px
          text-align: center
          font-size: $font-size-medium
          color: $color-text
      .middle
        position: fixed
        width: 100%
        top: 80px
        bottom: 170px
        white-space: nowrap
        font-size: 0
        .middle-l
          display: inline-block
          vertical-align: top
          position: relative
          width: 100%
          height: 0
          padding-top: 80%
          transition-duration .5s
          .cd-wrapper
            position: absolute
            left: 10%
            top: 0
            width: 80%
            box-sizing: border-box
            height: 100%
            .cd
              width: 100%
              height: 100%
              border-radius: 50%
              .image
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                box-sizing: border-box
                border-radius: 50%
                border: 10px solid rgba(255, 255, 255, 0.1)
              .play
                animation: rotate 20s linear infinite
          .playing-lyric-wrapper
            width: 80%
            margin: 30px auto 0 auto
            overflow: hidden
            text-align: center
            .playing-lyric
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-text-l
        .middle-r
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden
          transition-duration .5s
          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            text-align: center
            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
              &.current
                color: $color-text
            .pure-music
              padding-top: 50%
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium

      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .dot-wrapper
          text-align: center
          font-size: 0
          .dot
            display: inline-block
            vertical-align: middle
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l
            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll
        .progress-wrapper
          display: flex
          align-items: center
          width: 80%
          margin: 0px auto
          padding: 10px 0
          .time
            color: $color-text
            font-size: $font-size-small
            flex: 0 0 30px
            line-height: 30px
            width: 30px
            &.time-l
              text-align: left
            &.time-r
              text-align: right
          .progress-bar-wrapper
            flex: 1
            height 30px
            margin 0 10px
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
            &.disable
              color: $color-theme-d
            i
              font-size: 30px
          .i-left
            text-align: right
          .i-center
            padding: 0 20px
            text-align: center
            i
              font-size: 40px
          .i-right
            text-align: left
          .icon-favorite
            color: $color-sub-theme

      &.normal-enter-active, &.normal-leave-active
        transition: all 0.4s
        .top, .bottom
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
      &.normal-enter, &.normal-leave-to
        opacity: 0
        .top
          transform: translate3d(0, -100px, 0)
        .bottom
          transform: translate3d(0, 100px, 0)

    .mini-player
      display: flex
      align-items: center
      position: fixed
      left: 0
      bottom: 0
      z-index: 180
      width: 100%
      height: 60px
      background: $color-highlight-background
      &.mini-enter-active, &.mini-leave-active
        transition: all 0.4s
      &.mini-enter, &.mini-leave-to
        opacity: 0
      .icon
        flex: 0 0 40px
        width: 40px
        height: 40px
        padding: 0 10px 0 20px
        .imgWrapper
          height: 100%
          width: 100%
          img
            border-radius: 50%
            &.play
              animation: rotate 10s linear infinite
            &.pause
              animation-play-state: paused
      .text
        display: flex
        flex-direction: column
        justify-content: center
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: $color-text
        .desc
          no-wrap()
          font-size: $font-size-small
          color: $color-text-d
      .control
        flex: 0 0 30px
        width: 30px
        padding: 0 10px
        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size: 30px
          color: $color-theme-d
        .icon-mini
          font-size: 32px
          position: absolute
          left: .5px
          top: .5px

  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)
</style>