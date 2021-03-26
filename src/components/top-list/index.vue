<template>
  <transition appear name="slide">
    <music-list :songs="songs" :bgImage="topList.icon" :title="topList.name" :rank="rank"></music-list>
  </transition>
</template>

<script>
  import MusicList from 'components/music-list/index'
  import { mapState } from 'vuex'
  import { getMusicList } from 'api/rank'
  import { createSong, isValidMusic, processSongsUrl } from 'common/js/song'
  export default {
    name: "index",
    components: {
      MusicList
    },
    data() {
      return {
        songs: [],
        rank: true
      };
    },
    computed: {
      ...mapState([
        'topList'
      ])
    },
    created() {
      this.getTopList();
    },
    methods: {
      async getTopList() {
        let { id } = this.topList;
        if (!id) {
          this.$router.push({ path: '/rank' });
          return ;
        }
        const data = await getMusicList(id);
        const songs = await processSongsUrl(this.normalizeSongs(data));
        this.songs = songs;
      },
      normalizeSongs(list) {
        let result = [];
        list.forEach(musicData => {
          if (isValidMusic(musicData.data)) {
            result.push(new createSong(musicData.data));
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