<template>
  <div class="progress-circle">
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="32" height="32">
      <circle class="progress-bar" r="25" cx="25" cy="25"
              fill="transparent"
              stroke-width="4"
              :stroke-dashoffset="dashoffset"
              :stroke-dasharray="dashArray">
      </circle>
    </svg>
    <slot></slot>
  </div>
</template>

<script>
  export default {
    name: "index",
    props: {
      currentPercent: {
        type: Number,
        default: 0
      }
    },
    computed: {
      dashoffset() {
        return (1 - this.currentPercent) * this.dashArray;
      }
    },
    data() {
      return {
        dashArray: 50 * Math.PI // 圆的周长:2πr
      };
    }
  }
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"

  .progress-circle
    position: relative
    .progress-bar
      transform: scale(0.9) rotate(-90deg)
      stroke: $color-theme
      stroke-width: 4px
      transform-origin: center
</style>