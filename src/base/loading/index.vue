<template>
  <div class="loading">
    <img src="./loading.gif">
    <p class="desc">{{ title }}</p>
  </div>
</template>

<script>
  export default {
    name: "index",
    props: {
      title: {
        type: String,
        default: '正在载入...'
      }
    }
  }
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"

  .loading
    width: 100%
    text-align: center
    position: absolute
    top: 50%
    transform: translateY(-50%)
    img
      width 24px
      height 24px
    .desc
      line-height: 20px
      font-size: $font-size-small
      color: $color-text-l
</style>