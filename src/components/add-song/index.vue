<template>
  <transition name="slide" appear>
    <div class="add-song" v-show="showFlag" @click.stop>
      <div class="header">
        <h1 class="title">添加歌曲到列表</h1>
        <div class="close" @click="hide"><i class="icon-close"></i></div>
      </div>
      <div class="search-box-wrapper">
        <search-box ref="searchBox" placeholder="搜索歌曲" @query="onQueryChange" />
      </div>
      <div class="shortcut" v-show="!query">
        <switch-tab :switches="switches" :currentIndex="currentIndex" @switchItem="switchItem" />
        <div class="list-wrapper">
          <scroll class="list-scroll" ref="songList" :data="playHistory" v-if="currentIndex === 0">
            <div class="list-inner"><song-list :songs="playHistory" @selectSong="selectSong" /></div>
          </scroll>

          <scroll class="list-scroll" ref="searchHistoryList" :data="searchHistory" v-else>
            <div class="list-inner"><search-history-list :history="searchHistory" @select="$_addQuery" @deleteOne="$_deleteOne" /></div>
          </scroll>
        </div>
      </div>
      <div class="search-result" v-show="query">
        <search-list ref="searchList" :query="query" :showSinger="showSinger" @selectItem="selectSearchList"  />
      </div>

      <transition name="drop">
        <div class="top-tip" v-show="topTipShow">
          <i class="icon-ok"></i>
          <span class="text">1首歌曲已经添加到播放列表</span>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script>
  import SearchBox from 'base/search-box'
  import SwitchTab from 'base/switch-tab'
  import Scroll from 'base/scroll'
  import SearchHistoryList from 'base/search-history-list'
  import SongList from 'base/song-list'
  import SearchList from 'components/search-list'
  import { mapState, mapMutations, mapActions } from 'vuex'
  import { searchMixin } from 'common/js/mixin'
  import cache from 'common/js/cache'
  import { Song } from 'common/js/song'
  export default {
    name: "index",
    components: {
      SearchBox,
      SwitchTab,
      Scroll,
      SearchHistoryList,
      SongList,
      SearchList
    },
    mixins: [ searchMixin ],
    data() {
      return {
        showFlag: false,
        query: '',
        switches: ['最近播放','搜索历史'],
        currentIndex: 0,
        showSinger: 0,
        topTipShow: false
      };
    },
    computed: {
      ...mapState([
        'searchHistory',
        'playHistory'
      ])
    },
    watch: {
      topTipShow(newVal) {
        if (newVal) {
          setTimeout(() => {
            this.topTipShow = false;
          },2000);
        }
      }
    },
    methods: {
      show() {
        this.showFlag = true;
        this.refreshScroll();
      },
      hide() {
        this.showFlag = false;
        this.$emit('hide');
      },
      onQueryChange(query) {
        this.query = query;
        if (!this.query) {
          this.refreshScroll();
        }
      },
      refreshScroll() {
        setTimeout(() => {
          if (this.currentIndex === 0) {
            this.$refs.songList.refresh();
          } else {
            this.$refs.searchHistoryList.refresh();
          }
        },20);
      },
      switchItem(index) {
        this.currentIndex = index;
        setTimeout(() => {
          if (this.currentIndex === 0) {
            this.$refs.songList.scrollTo(0,0);
          } else {
            this.$refs.searchHistoryList.scrollTo(0,0);
          }
        },20);
      },
      selectSong(item,index) {
        if (index === 0 || this.topTipShow) {
          return ;
        }

        this.topTipShow = true;
        this.insertSong(new Song(item));
        this.setPlayHistory(cache.savePlaySong(item));
      },
      selectSearchList(query) {
        if (this.topTipShow) {
          return ;
        }

        this.topTipShow = true;
        this.$_saveSearchHistory(query);
      },
      ...mapMutations([
        'setSearchHistory',
        'setPlayHistory'
      ]),
      ...mapActions([
        'insertSong'
      ])
    }
  }
</script>

<style scoped lang="stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .add-song
    position: fixed
    top: 0
    bottom: 0
    width: 100%
    z-index: 200
    background: $color-background
    &.slide-enter-active, &.slide-leave-active
      transition: all 0.3s
    &.slide-enter, &.slide-leave-to
      transform: translate3d(100%, 0, 0)
    .header
      position: relative
      height: 44px
      text-align: center
      .title
        line-height: 44px
        font-size: $font-size-large
        color: $color-text
      .close
        position: absolute
        top: 0
        right: 8px
        .icon-close
          display: block
          padding: 12px
          font-size: 20px
          color: $color-theme

    .search-box-wrapper
      margin: 20px
    .shortcut
      .list-wrapper
        position: absolute
        top: 165px
        bottom: 0
        width: 100%
        .list-scroll
          height: 100%
          overflow: hidden
          .list-inner
            padding: 20px 30px
    .search-result
      position: fixed
      top: 124px
      bottom: 0
      width: 100%
    .top-tip
      position: fixed
      top: 0
      width: 100%
      z-index: 500
      background: $color-dialog-background
      text-align center
      padding 18px 0
      &.drop-enter-active, &.drop-leave-active
        transition all .3s
      &.drop-enter, &.drop-leave-to
        transform: translate3d(0, -100%, 0)
      .icon-ok
        font-size: $font-size-medium
        color: $color-theme
        margin-right: 4px
      .text
        font-size: $font-size-medium
        color: $color-text
</style>