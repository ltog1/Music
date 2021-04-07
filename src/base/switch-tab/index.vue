<template>
  <ul class="switches">
    <li class="switch-item"
        :class="{'active': currentIndex === index}"
        v-for="(item,index) in switches" :key="index"
        @click="switchItem(index)">
      <span>{{ item }}</span>
    </li>
  </ul>
</template>

<script>
  export default {
    name: "index",
    props: {
      switches: {
        type: Array,
        default: () => []
      },
      currentIndex: {
        type: Number,
        default: 0
      }
    },
    methods: {
      switchItem(index) {
        this.$emit('switchItem',index);
      }
    }
  }
</script>

<style scoped lang="stylus">
  @import "~common/stylus/variable"

  .switches
    display: flex
    align-items: center
    width: 240px
    margin: 0 auto
    border: 1px solid $color-highlight-background
    border-radius: 5px
    .switch-item
      flex: 1
      padding: 8px
      text-align: center
      font-size: $font-size-medium
      color: $color-text-d
      &.active
        background: $color-highlight-background
        color: $color-text
</style>