<template>
  <div class="music-list">
    <div class="back" @click="back"><i class="icon-back"></i></div>
    <h1 class="title" ref="title">{{ title }}</h1>
    <div class="bg-image" :style="`background-image: url(${bgImage})`" ref="bgImage">
      <div class="play-wrapper" ref="play" v-if="songs.length">
        <div class="play" @click="randomClick">
          <i class="icon-play"></i>
          <span class="text">随机播放全部</span>
        </div>
      </div>
      <div class="filter"></div>
    </div>

    <div class="bg-layer" ref="bgLayer"></div>
    <scroll class="list" ref="list" :data="songs" :listenScroll="listenScroll" :probeType="probeType" @scroll="listScroll">
      <div class="song-list-wrapper"><song-list :songs="songs" :rank="rank" @selectSong="selectSong"></song-list></div>
      <loading v-if="!songs.length" />
    </scroll>
  </div>
</template>

<script>
  import Scroll from 'base/scroll'
  import Loading from 'base/loading'
  import SongList from 'base/song-list'
  import { mapActions } from 'vuex'
  import { playListMixin } from 'common/js/mixin'
  export default {
    name: "index",
    mixins: [ playListMixin ],
    components: {
      Scroll,
      Loading,
      SongList
    },
    props: {
      songs: {
        type: Array,
        default: () => []
      },
      bgImage: {
        type: String,
        default: ''
      },
      title: {
        type: String,
        default: ''
      },
      rank: {
        type: Boolean,
        default: false
      }
    },
    mounted() {
      this.bgImageHeight = this.$refs.bgImage.clientHeight;
      this.$refs.list.$el.style.top = this.bgImageHeight + 'px';
    },
    created() {
      this.listenScroll = true;
      this.probeType = 3;
    },
    methods: {
      $_handlerPlayList(newPlayList) {
        let bottom = newPlayList.length ? '60px' : 0;
        this.$refs.list.$el.style.bottom = bottom;
        this.$refs.list.refresh();
      },
      back() {
        this.$router.back();
      },
      randomClick() {
        this.randomPlay(this.songs);
      },
      selectSong(item,index) {
        this.selectPlay({
          list: this.songs,
          index
        });
      },
      listScroll(pos) {
        let y = Math.floor(pos.y);
        let scale = 1, zIndex = 0, height = 0, paddingTop = '70%', display = 'block',
          percent = y / this.bgImageHeight,
          moveY = Math.max(-(this.bgImageHeight - 40),y);

        if (y > 0) {
          zIndex = 10;
          scale += percent
        } else if (y <= -(this.bgImageHeight - 40)) {
          paddingTop = 0;
          height = 40;
          zIndex = 10;
          display = 'none';
        }

        this.$refs.play.style.display = display;
        this.$refs.bgImage.style.zIndex = zIndex;
        this.$refs.bgImage.style.height = height + 'px';
        this.$refs.bgImage.style.paddingTop = paddingTop;
        this.$refs.bgImage.style.transform = `scale(${scale})`;
        this.$refs.bgLayer.style.transform = `translate3d(0,${moveY}px,0)`;
      },
      ...mapActions([
        'selectPlay',
        'randomPlay'
      ])
    }
  }
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .music-list
    position: fixed
    z-index: 100
    top: 0
    left: 0
    bottom: 0
    right: 0
    background: $color-background
    .back
      position absolute
      top: 0
      left: 6px
      z-index: 50
      .icon-back
        display: block
        padding: 10px
        font-size: $font-size-large-x
        color: $color-theme
    .title
      position: absolute
      top: 0
      left: 10%
      z-index: 40
      width: 80%
      no-wrap()
      text-align: center
      line-height: 40px
      font-size: $font-size-large
      color: $color-text
    .bg-image
      position: relative
      width: 100%
      height: 0
      padding-top: 70%
      transform-origin: top
      background-size: cover
      .play-wrapper
        position: absolute
        bottom: 20px
        z-index: 50
        width: 100%
        .play
          box-sizing: border-box
          width: 135px
          padding: 7px 0
          margin: 0 auto
          text-align: center
          border: 1px solid $color-theme
          color: $color-theme
          border-radius: 100px
          font-size: 0
          .icon-play
            display: inline-block
            vertical-align: middle
            margin-right: 6px
            font-size: $font-size-medium-x
          .text
            display: inline-block
            vertical-align: middle
            font-size: $font-size-small
      .filter
        position: absolute
        top: 0
        left: 0
        width: 100%
        height: 100%
        background: rgba(7, 17, 27, 0.4)
    .bg-layer
      position: relative
      height: 100%
      background: $color-background
    .list
      position: absolute
      top: 0
      bottom: 0
      width: 100%
      background: $color-background
      .song-list-wrapper
        padding: 20px 30px
</style>