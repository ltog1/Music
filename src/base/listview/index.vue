<template>
  <scroll class="listview" ref="scroll" :data="data" :listenScroll="listenScroll" :probeType="probeType" @scroll="listviewScroll">
    <ul>
      <li v-for="(item,key) in data" :key="key" class="list-group" ref="listGroup">
        <h2 class="list-group-title">{{ key }}</h2>
        <ul>
          <li v-for="singer in item" :key="singer.id" class="list-group-item" @click="selectItem(singer)">
            <img class="avatar" v-lazy="singer.icon">
            <span class="name">{{ singer.name }}</span>
          </li>
        </ul>
      </li>
    </ul>

    <div class="list-shortcut">
      <ul ref="shortcutList" @touchstart.stop.prevent="alphabetTouchStart" @touchmove.stop.prevent="alphabetTouchMove">
        <li class="item"
            v-for="(item,key,index) in data"
            :key="key"
            :data-index="index"
            :class="{'current': currentIndex === index}"
        >{{ key === '热门' ? '热' : key }}</li>
      </ul>
    </div>

    <div class="list-fixed" ref="fixedTitle" v-if="fixedShow">
      <div class="fixed-title">{{ fixedText }}</div>
    </div>

    <loading v-if="!Object.keys(data).length" />
  </scroll>
</template>

<script>
  import Scroll from 'base/scroll/index'
  import Loading from 'base/loading/index'

  const fixedHeight = 30;
  export default {
    name: "index",
    components: {
      Scroll,
      Loading
    },
    props: {
      data: {
        type: Object,
        default: null
      }
    },
    data() {
      return {
        currentIndex: 0,
        fixedShow: true,
        diffY: 0
      };
    },
    watch: {
      diffY(newDiffY) {
        let moveY = (newDiffY >= 0 && newDiffY <= fixedHeight) ? newDiffY - fixedHeight : 0;

        // 减少操作DOM次数
        if (this.moveY === moveY) {
          return ;
        }

        this.moveY = moveY;
        this.$refs.fixedTitle.style.transform = `translate3d(0,${moveY}px,0)`;
      }
    },
    computed: {
      fixedText() {
        let arr = [];
        for (let key in this.data) {
          arr.push(key);
        }
        return arr[this.currentIndex];
      }
    },
    updated() {
      this.calculateHeight();
    },
    created() {
      this.touch = {
        itemHeight: 0,  // 右侧字母每个字母的高度
        startY: 0,  // 右侧首个字母距离顶部的距离
      }
      this.listenScroll = true;
      this.probeType = 3;
      this.listHeight = [];
    },
    methods: {
      // 计算每个字母对应歌手区域的高度,累加高度
      calculateHeight() {
        let height = 0,arr = [];

        arr[0] = height;
        for (let i = 0,length = this.$refs.listGroup.length; i < length; i++) {
          const item = this.$refs.listGroup[i];
          height += item.clientHeight;
          arr.push(height);
        }
        this.listHeight = arr;
      },
      // 滚动滚动条,与右侧字母双向联动,高亮显示
      listviewScroll(pos) {
        let y = pos.y;
        // 滚动到顶部,大于0时
        if (y > 0) {
          this.fixedShow = false;
          return;
        }
        this.fixedShow = true;

        // 在中间滚动
        y = Math.floor(Math.abs(y));
        for (let i = 0,length = this.listHeight.length; i < length; i++) {
          const item1 = this.listHeight[i],
            item2 = this.listHeight[i + 1];

          if (y >= item1 && y < item2) {
            this.diffY = item2 - y;
            this.currentIndex = i;
            return;
          }
        }
      },
      alphabetTouchStart(e) {
        let index = e.target.getAttribute('data-index');
        this.scrollToElement(this.$refs.listGroup,index);

        let shortcutList = this.$refs.shortcutList;
        this.touch.startY = shortcutList.getBoundingClientRect().y;
        this.touch.itemHeight = shortcutList.children[0].clientHeight;
      },
      alphabetTouchMove(e) {
        if (this.timer) {
          clearTimeout(this.timer);
        }

        this.timer = setTimeout(() => {
          let moveY = e.touches ? e.touches[0].pageY : e.clientY;
          let index = Math.floor((moveY - this.touch.startY) / this.touch.itemHeight);

          if (index >= 0) {
            this.currentIndex = index;
            this.scrollToElement(this.$refs.listGroup,index);
          }
        },6);
      },
      scrollToElement(element,index) {
        element = element[index];
        this.$refs.scroll.scrollToElement(element,300);
      },
      selectItem(singer) {
        this.$emit('select',singer);
      },
      refresh() {
        this.$refs.scroll.refresh();
      }
    }
  }
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"

  .listview
    position: relative
    width: 100%
    height: 100%
    overflow: hidden
    background: $color-background
    .list-group
      padding-bottom: 30px
      .list-group-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
      .list-group-item
        display: flex
        align-items: center
        padding: 20px 0 0 30px
        .avatar
          width: 50px
          height: 50px
          border-radius: 50%
        .name
          margin-left: 20px
          color: $color-text-l
          font-size: $font-size-medium
    .list-shortcut
      position: absolute
      z-index: 30
      right: 0
      top: 50%
      transform: translateY(-50%)
      width: 20px
      padding: 20px 0
      border-radius: 10px
      text-align: center
      background: $color-background-d
      font-family: Helvetica
      .item
        padding: 3px
        line-height: 1
        color: $color-text-l
        font-size: $font-size-small
        &.current
          color: $color-theme
    .list-fixed
      position: absolute
      top: 0
      left: 0
      width: 100%
      .fixed-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
    .loading-container
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>