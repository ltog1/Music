<template>
  <div class="slider" @transitionend="transitionend" @touchstart="touchStart" @touchmove="touchMove" @touchend="touchEnd">
    <div class="slider-group" ref="sliderGroup">
      <slot></slot>
    </div>
    <div class="dots">
      <span class="dot" v-for="(item,index) in dots" :key="index" :class="{'active': currentIndex === index}"></span>
    </div>
  </div>
</template>

<script>
  export default {
    name: "index",
    props: {
      loop: {
        type: Boolean,
        default: true
      },
      autoplay: {
        type: Boolean,
        default: true
      },
      interval: {
        type: Number,
        default: 3000
      }
    },
    data() {
      return {
        sliderData: {
          isStart: false,
          isMove: false,
          startX: 0,
          dx: 0,
          offsetWidth: 0
        },
        children: null,
        currentIndex: 0,
        timer: null,
        dots: [],
      };
    },
    computed: {
      translateX() {
        if (this.loop) {
          return -(this.sliderData.offsetWidth + this.sliderData.offsetWidth * this.currentIndex);
        } else {
          return -(this.sliderData.offsetWidth * this.currentIndex);
        }
      }
    },
    mounted() {
      this.$nextTick(() => {
        this.initSlider();
        this.initDots();

        if (this.autoplay) {
          this.autoPlay();
        }
      });
    },
    methods: {
      initSlider() {
        let sliderGroup = this.$refs.sliderGroup;
        this.children = sliderGroup.children;
        this.childrenLength = this.children.length;

        let sliderData = this.sliderData,width = 0;
        sliderData.offsetWidth = sliderGroup.clientWidth;

        for (let i = 0; i < this.children.length; i++) {
          const item = this.children[i];
          item.classList.add('slider-item');
          item.style.width = sliderData.offsetWidth + 'px';
          width += sliderData.offsetWidth;
        }

        // 当设置为无缝滚动时,前后分别克隆最后一张和第一张图片，并左右两边各添加多一张图片的宽度,并左移一个图片的距离，显示第一张图片
        if (this.loop) {
          let lastChild = this.children[this.children.length - 1],
              firstChild = this.children[0];
          sliderGroup.appendChild(firstChild.cloneNode(true));
          sliderGroup.insertBefore(lastChild.cloneNode(true),sliderGroup.children[0]);

          width += 2 * sliderData.offsetWidth;

          this.$refs.sliderGroup.style.transform = `translate3d(-${sliderData.offsetWidth}px,0,0)`;
        }

        // 父容器的宽度等于每张图片宽度的总和
        sliderGroup.style.width = width + 'px';
      },
      initDots() {
        this.dots = new Array(this.childrenLength);
      },
      touchStart(e) {
        clearTimeout(this.timer);
        let sliderData = this.sliderData;
        sliderData.isStart = true;
        sliderData.startX = e.touches ? e.touches[0].pageX : e.clientX;
      },
      touchMove(e) {
        let sliderData = this.sliderData;
        if (!sliderData.isStart) {
          return;
        }

        let x = e.touches ? e.touches[0].pageX : e.clientX;
        sliderData.dx = x - sliderData.startX;

        sliderData.isMove = true;
        this.$refs.sliderGroup.style.transform = `translate3d(${sliderData.dx + this.translateX}px,0,0)`;
      },
      touchEnd() {
        let sliderData = this.sliderData;
        if (!sliderData.isStart || !sliderData.isMove) {
          return;
        }

        sliderData.isMove = false;
        sliderData.isStart = false;

        if (!this.loop) {
          // 如果不是无缝滚动且当前图片是第一张且向右滑动,或当前图片是最后一张且向左滑动,添加动画,让其图片平滑回来
          if (sliderData.dx >= 0 && this.currentIndex === 0 || sliderData.dx <= 0 && this.currentIndex === this.childrenLength - 1) {
            this.$refs.sliderGroup.style.transform = `translate3d(${this.translateX}px,0,0)`;
            this.trans();
            return;
          }
        }

        if (sliderData.dx <= -150) {
          this.next();
        } else if (sliderData.dx >= 150) {
          this.prev();
        }
        this.trans();
      },
      next() {
        this.currentIndex++;
      },
      prev() {
        this.currentIndex--;
      },
      trans() {
        let sliderGroup = this.$refs.sliderGroup;
        sliderGroup.style.transition = 'all 0.3s ease-in-out';
        sliderGroup.style.transform = `translate3d(${this.translateX}px,0,0)`;

        if (this.currentIndex >= this.childrenLength) {
          this.currentIndex = 0;
        } else if (this.currentIndex < 0) {
          this.currentIndex = this.childrenLength - 1;
        }
      },
      transitionend() {
        let sliderGroup = this.$refs.sliderGroup;
        sliderGroup.style.transition = 'none';
        sliderGroup.style.transform = `translate3d(${this.translateX}px,0,0)`;

        if (this.autoplay) {
          this.autoPlay();
        }
      },
      autoPlay() {
        this.timer = setTimeout(() => {
          // 如果不是无缝滚动且已滚动到最后一张，停止滚动
          if (!this.loop && this.currentIndex === this.childrenLength - 1) {
            clearTimeout(this.timer);
            return;
          }

          this.next();
          this.trans();
        },this.interval);
      },
    }
  }
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"

  .slider
    min-height: 1px
    .slider-group
      position: relative
      overflow: hidden
      white-space: nowrap
      .slider-item
        float: left
        box-sizing: border-box
        overflow: hidden
        text-align: center
        width 375px
        a
          display: block
          width: 100%
          overflow: hidden
          text-decoration: none
        img
          display: block
          width: 100%
    .dots
      position: absolute
      right: 0
      left: 0
      bottom: 12px
      transform: translateZ(1px)
      text-align: center
      font-size: 0
      .dot
        display: inline-block
        margin: 0 4px
        width: 8px
        height: 8px
        border-radius: 50%
        background: $color-text-l
        &.active
          width: 20px
          border-radius: 5px
          background: $color-text-ll
</style>