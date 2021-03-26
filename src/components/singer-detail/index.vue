<template>
  <transition appear name="slide">
    <music-list :songs="songs" :title="singer.name" :bgImage="singer.icon"></music-list>
  </transition>
</template>

<script>
  import MusicList from 'components/music-list/index'
  import { getSingerDetail } from 'api/singer'
  import { createSong,isValidMusic,processSongsUrl } from 'common/js/song'
  import { mapState } from 'vuex'
  export default {
    name: "index",
    components: {
      MusicList
    },
    data() {
      return {
        songs: []
      }
    },
    computed: {
      ...mapState([
        'singer'
      ])
    },
    created() {
      this.getSingerDetail();
    },
    methods: {
      async getSingerDetail() {
        let id = this.singer.id;
        if (!id) {
          this.$router.push('/singer');
          return;
        }

        const data = await getSingerDetail(id);
        const songs = await processSongsUrl(this.normalizeSongs(data.list));
        this.songs = songs;
      },
      // 序列化歌手详情数据
      normalizeSongs(list) {
        let result = [];
        list.forEach(item => {
          let { musicData } = item;
          if (isValidMusic(musicData)) {
            result.push(new createSong(musicData));
          }
        });
        return result;
      }
    }
  }
</script>

<style lang="stylus" scoped>
  .slide-enter-active, .slide-leave-active
    transition all .5s

  .slide-leave-to, .slide-enter
    transform translate3d(100%,0,0)
</style>