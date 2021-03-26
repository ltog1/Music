<template>
  <div class="singer" ref="singer">
    <list-view :data="singer" @select="select" ref="listView"></list-view>
    <router-view></router-view>
  </div>
</template>

<script>
  import { getSingerList } from 'api/singer'
  import Singer from 'common/js/singer'
  import ListView from 'base/listview/index'
  import { mapMutations } from 'vuex'
  import { playListMixin } from 'common/js/mixin'
  export default {
    name: "index",
    mixins: [ playListMixin ],
    components: {
      ListView
    },
    data() {
      return {
        singer: {}
      };
    },
    created() {
      this.getSingerList();
    },
    methods: {
      $_handlerPlayList(newPlayList) {
        let bottom = newPlayList.length ? '60px' : 0;
        this.$refs.singer.style.bottom = bottom;
        this.$refs.listView.refresh();
      },
      async getSingerList() {
        const data = await getSingerList();
        this.singer = this.normalizeSinger(data.list);
      },
      normalizeSinger(list) {
        let map = { '热门': [] };
        for (let i = 0; i < 26; i++) {
          const en = String.fromCharCode(65 + i);
          map[en] = [];

          list.forEach((singer,index) => {
            if (singer.Findex === en) {
              map[en].push(new Singer({
                id: singer.Fsinger_mid,
                name: singer.Fsinger_name
              }));
            }

            if (i === 0 && index <= 10) {
              map['热门'].push(new Singer({
                id: singer.Fsinger_mid,
                name: singer.Fsinger_name
              }));
            }
          });
        }
        return map;
      },
      // 点击歌手跳转对应详情页
      select(singer) {
        this.setSinger(singer);
        this.$router.push({ path: `/singer/${singer.id}`});
      },
      ...mapMutations([
        'setSinger'
      ])
    }
  }
</script>

<style lang="stylus" scoped>
  .singer
    position: fixed
    top: 88px
    bottom: 0
    width: 100%
</style>