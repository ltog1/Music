<template>
  <div class="progress-bar" ref="progressBar" @click="progressBarClick">
    <div class="progress" ref="progress"></div>
    <div class="progress-btn" ref="progressBtn"
         @touchstart.prevent="progressTouchStart"
         @touchmove.prevent="progressTouchMove"
         @touchend="progressTouchEnd">
    </div>
  </div>
</template>

<script>
  export default {
    name: "index",
    props: {
      // 当前播放时间和总时长的比例
      currentPercent: {
        type: Number,
        default: 0
      }
    },
    mounted() {
      this.progressBar = this.$refs.progressBar;
    },
    watch: {
      currentPercent(newPercent) {
        if (this.touch.isStart || newPercent <= 0) {
          return ;
        }

        let width = newPercent * this.progressBar.clientWidth;
        this.setDom(width);
      }
    },
    created() {
      this.touch = {
        dx: 0,
        isStart: false,
        offsetLeft: 0
      }
    },
    methods: {
      progressBarClick(e) {
        let progressBar = this.progressBar,
         startX = (e.touches ? e.touches[0].pageX : e.clientX) - progressBar.offsetLeft;

        this.setDom(startX);

        const percent = startX / progressBar.clientWidth;
        this.$emit('progressChange', percent);
      },
      progressTouchStart() {
        const touch = this.touch;
        touch.isStart = true;
        touch.offsetLeft = this.progressBar.offsetLeft;
      },
      progressTouchMove(e) {
        const touch = this.touch;
        if (!touch.isStart) {
          return ;
        }

        let x = e.touches ? e.touches[0].pageX : e.clientX;
        let diffX = x - touch.offsetLeft >= 0 ? x - touch.offsetLeft : 0;
        touch.dx = Math.min(diffX, this.progressBar.clientWidth);

        this.setDom(touch.dx);
      },
      progressTouchEnd() {
        const touch = this.touch;
        touch.isStart = false;

        this.setDom(touch.dx);

        const percent = touch.dx / this.progressBar.clientWidth;
        this.$emit('progressChange', percent);
      },
      setDom(width, translate = width) {
        this.$refs.progress.style.width = width + 'px';
        this.$refs.progressBtn.style.transform = `translate3d(${translate}px,0,0)`;
      }
    }
  }
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"

  .progress-bar
    position: relative
    top: 13px
    height: 4px
    background: rgba(0, 0, 0, 0.3)
    .progress
      position: absolute
      height: 100%
      background: $color-theme
    .progress-btn
      position: absolute
      left -8px
      top -6px
      width 16px
      height 16px
      box-sizing: border-box
      border: 3px solid $color-text
      border-radius: 50%
      background: $color-theme
</style>