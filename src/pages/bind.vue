<template>
  <div>
    test
  </div>
</template>

<script>
  export default {
    data() {
      return {};
    },
    methods: {},
    onLoad(options) {
      console.log(options)
      this.$router.push('/pages/home')
    }
  };
</script>

<style lang="scss" scoped>


</style>
