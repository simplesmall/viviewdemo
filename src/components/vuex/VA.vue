<template>
  <div>
    <hr>
    <p>A组件</p>
    <input type="button" value="A组件按钮" @click="sendA">
    <VASon/>
    <hr>
  </div>
</template>

<script>
  import VASon from "./VASon";
  export default {
    name: "VA",
    methods: {
      sendA() {
        this.$store.dispatch('addAct', 12)
        console.log(this.$store.getters.countGet)
      }
    },
    components:{
      VASon
    }
  }
</script>

<style scoped>

</style>
