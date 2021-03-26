<template>
  <transition appear name="slide">
    <music-list :songs="songs" :bgImage="disc.icon" :title="disc.name"></music-list>
  </transition>
</template>

<script>
  import { mapState } from 'vuex'
  import { getSongList } from 'api/recommend'
  import { createSong,isValidMusic,processSongsUrl } from 'common/js/song'
  import MusicList from 'components/music-list/index'
  export default {
    name: "index",
    components: {
      MusicList
    },
    data() {
      return {
        songs: []
      };
    },
    computed: {
      ...mapState([
        'disc'
      ])
    },
    created() {
      this.getSongList();
    },
    methods: {
      async getSongList() {
        let { id } = this.disc;
        if (!id) {
          this.$router.push({ path: '/recommend' });
          return ;
        }

        const data = await getSongList(id);
        const songs = await processSongsUrl(this.normalizeSongs(data.songlist));
        this.songs = songs;
      },
      normalizeSongs(list) {
        let result = [];
        list.forEach(musicData => {
          if (musicData.songid && musicData.albumid) {
            if (isValidMusic(musicData)) {
              result.push(new createSong(musicData));
            }
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