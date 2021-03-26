<template>
  <div class="recommend" ref="recommend">
    <scroll ref="scroll" class="recommend-content" :data="descList">
      <div>
        <div class="slider-wrapper" v-if="sliders.length">
          <slider>
            <div v-for="item in sliders" :key="item.id"><a :href="item.linkUrl"><img :src="item.picUrl" @load="refreshScroll"></a></div>
          </slider>
        </div>
        <div class="recommend-list">
          <h1 class="list-title">热门歌单推荐</h1>
          <ul>
            <li class="item" v-for="(item,index) in descList" :key="index" @click="selectItem(item)">
              <div class="icon"><img v-lazy="item.imgurl"></div>
              <div class="text">
                <h2 class="name">{{ item.creator.name }}</h2>
                <p class="desc">{{ item.dissname }}</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </scroll>
    <loading v-if="!descList.length" />
    <router-view></router-view>
  </div>
</template>

<script>
  import Slider from 'base/slider/index'
  import Scroll from 'base/scroll/index'
  import Loading from 'base/loading/index'
  import { getRecommend, getDiscList } from 'api/recommend'
  import { playListMixin } from 'common/js/mixin'
  import { mapMutations } from 'vuex'
  export default {
    name: "index",
    mixins: [ playListMixin ],
    components: {
      Slider,
      Scroll,
      Loading
    },
    data() {
      return {
        sliders: [], // 轮播图数据
        descList: [], // 歌单列表数据
      };
    },
    created() {
      this.getRecommend();
      this.getDiscList();
    },
    methods: {
      $_handlerPlayList(newPlayList) {
        let bottom = newPlayList.length ? '60px' : 0;
        this.$refs.recommend.style.bottom = bottom;
        this.$refs.scroll.refresh();
      },
      async getRecommend() {
        const data = await getRecommend();
        this.sliders = data;
      },
      async getDiscList() {
        const data = await getDiscList();
        this.descList = data.list;
      },
      refreshScroll() {
        if (!this.checkload) {
          this.$refs.scroll.refresh();
          this.checkload = true;
        }
      },
      selectItem(item) {
        this.setDisc({
          id: item.dissid,
          icon: item.imgurl,
          name: item.dissname,
        });
        this.$router.push({ path: `/recommend/${item.dissid}` });
      },
      ...mapMutations([
        'setDisc'
      ])
    }
  }
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"

  .recommend
    position: fixed
    width: 100%
    top: 88px
    bottom: 0
    .recommend-content
      height: 100%
      overflow: hidden
      .slider-wrapper
        position: relative
        width: 100%
        overflow: hidden
      .recommend-list
        .list-title
          height: 65px
          line-height: 65px
          text-align: center
          font-size: $font-size-medium
          color: $color-theme
        .item
          display: flex
          box-sizing: border-box
          align-items: center
          padding: 0 20px 20px 20px
          .icon
            flex: 0 0 60px
            width: 60px
            padding-right: 20px
            img
              width 60px
              height 60px
          .text
            display: flex
            flex-direction: column
            justify-content: center
            flex: 1
            line-height: 20px
            overflow: hidden
            font-size: $font-size-medium
            .name
              margin-bottom: 10px
              color: $color-text
            .desc
              color: $color-text-d
</style>