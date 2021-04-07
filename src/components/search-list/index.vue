<template>
  <scroll class="suggest"
          ref="scroll"
          :data="songs"
          :pulldown="pulldown"
          @scrollToEnd="scrollToEnd"
  >
    <ul class="suggest-list">
      <li class="suggest-item" v-for="(item,index) in songs" :key="index" @click="selectItem(item)">
        <div class="icon"><i :class="[item.type ? 'icon-mine' : 'icon-music']"></i></div>
        <div class="name"><p class="text">{{ getName(item) }}</p></div>
      </li>
      <loading title="" v-if="!noMore" />
    </ul>

    <div class="no-result-wrapper" v-if="!songs.length"><no-result /></div>
  </scroll>
</template>

<script>
  import { search } from 'api/search'
  import { createSong,isValidMusic,processSongsUrl } from 'common/js/song'
  import Scroll from 'base/scroll'
  import Loading from 'base/loading'
  import NoResult from 'base/no-result'
  import Singer from 'common/js/singer'
  import { mapMutations, mapActions } from 'vuex'

  const perpage = 20;

  export default {
    name: "index",
    props: {
      query: {
        type: String,
        default: ''
      },
      showSinger: {
        type: Number,
        default: 1
      }
    },
    components: {
      Scroll,
      Loading,
      NoResult
    },
    data() {
      return {
        page: 1,
        songs: [],
        noMore: false
      };
    },
    watch: {
      query() {
        this.songs = [];
        this.once = false;
        this.noMore = false;

        if (this.query) {
          this.search();
        }
      }
    },
    created() {
      this.pulldown = true;
    },
    methods: {
      async search() {
        const data = await search(this.query, this.page, perpage, this.showSinger);
        if (this.checkMore(data)) {
          return ;
        }

        const songs = await this.getResult(data);
        this.songs = this.songs.concat(songs);
      },
      async getResult(data) {
        const songs = await processSongsUrl(this.normalizeSongs(data.song.list));
        const { zhida } = data;
        if (zhida.type) {
          if (!this.once) {
            songs.unshift(zhida);
            this.once = true;
          }
        }

        return songs;
      },
      getName(item) {
        let name = '';
        if (item.type) {
          name = item.singername;
        } else {
          name = `${item.name}-${item.singer}`;
        }
        return name;
      },
      normalizeSongs(list) {
        let result = [];
        list.forEach(musicData => {
          if (isValidMusic(musicData)) {
            result.push(new createSong(musicData));
          }
        });
        return result;
      },
      // 上拉加载更多
      scrollToEnd() {
        this.page++;
        this.search();
      },
      checkMore(data) {
        const song = data.song;
        if (!song.list.length || (song.curnum + song.curpage * perpage) > song.totalnum) {
          this.noMore = true;
        }
        return this.noMore;
      },
      selectItem(item) {
        // 点击跳转歌手页
        if (item.type) {
          this.setSinger(new Singer({
            id: item.singermid,
            name: item.singername,
          }));
          this.$router.push({ path: `/search/${item.singermid}` });
        } else {  // 点击插入一首歌曲
          this.insertSong(item);
        }

        this.$emit('selectItem',this.query);
      },
      refresh() {
        this.$refs.scroll.refresh();
      },
      ...mapMutations([
        'setSinger'
      ]),
      ...mapActions([
        'insertSong'
      ])
    }
  }
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .suggest
    height: 100%
    overflow: hidden
    .suggest-list
      padding: 0 30px
      .suggest-item
        display: flex
        align-items: center
        padding-bottom: 20px
        &:last-of-type
          padding-bottom: 10px
      .loading
        position relative
        top 12px
      .icon
        flex: 0 0 30px
        width: 30px
        [class^="icon-"]
          font-size: 14px
          color: $color-text-d
      .name
        flex: 1
        font-size: $font-size-medium
        color: $color-text-d
        overflow: hidden
        .text
          no-wrap()
    .no-result-wrapper
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>