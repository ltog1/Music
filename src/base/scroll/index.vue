<template>
  <div ref="wrapper">
    <slot></slot>
  </div>
</template>

<script>
  import BetterScroll from 'better-scroll'
  export default {
    name: "index",
    props: {
      // 列表中的数据
      data: {
        type: [Array,Object],
        default: null
      },
      // 为1时,滚动的时候派发scroll事件(屏幕滑动超过一定时间后),会截流
      // 为2时,滚动的时候派发scroll事件(实时),不会截流
      // 为3时,除了实时派发scroll事件，在swipe的情况下仍然能实时派发scroll事件
      probeType: {
        type: Number,
        default: 1
      },
      // 点击列表是否派发click事件
      click: {
        type: Boolean,
        default: true
      },
      // 是否派发滚动事件
      listenScroll: {
        type: Boolean,
        default: false
      },
      // 是否派发滚动到底部的事件，用于上拉加载
      pullup: {
        type: Boolean,
        default: false
      },
      // 是否派发顶部下拉的事件，用于下拉刷新
      pulldown: {
        type: Boolean,
        default: false
      },
      // 是否派发列表滚动开始的事件
      beforeScroll: {
        type: Boolean,
        default: false
      },
      // 当数据更新后,刷新scroll的延时
      refreshDelay: {
        type: Number,
        default: 20
      }
    },
    watch: {
      data() {
        setTimeout(() => {
          this.refresh();
        }, this.refreshDelay)
      }
    },
    mounted() {
      this.$nextTick(() => {
        this.initScroll();
      });
    },
    methods: {
      initScroll() {
        if (!this.$refs.wrapper) {
          return;
        }

        this.scroll = new BetterScroll(this.$refs.wrapper, {
          click: this.click,
          probeType: this.probeType
        });

        // 派发滚动事件
        if (this.listenScroll) {
          this.scroll.on('scroll', pos => {
            this.$emit('scroll',pos);
          });
        }

        // 派发滚动到底部事件
        if (this.pulldown) {
          this.scroll.on('scrollEnd',() => {
            if (this.scroll.y <= (this.scroll.maxScrollY + 50)) {
              this.$emit('scrollToEnd');
            }
          });
        }

        // 派发滚动开始事件
        if (this.beforeScroll) {
          this.scroll.on('beforeScrollStart',() => {
            this.$emit('beforeScrollStart');
          });
        }
      },
      // 禁用 BetterScroll，DOM 事件（如 touchstart、touchmove、touchend）的回调函数不再响应。
      disable() {
        this.scroll && this.scroll.disable();
      },
      // 启用 BetterScroll，默认开启
      enable() {
        this.scroll && this.scroll.enable();
      },
      // 更新 BetterScroll
      refresh() {
        this.scroll && this.scroll.refresh();
      },
      scrollTo() {
        this.scroll && this.scroll.scrollTo.apply(this.scroll,arguments);
      },
      scrollToElement() {
        this.scroll && this.scroll.scrollToElement.apply(this.scroll,arguments);
      }
    }
  }
</script>

<style scoped>

</style>