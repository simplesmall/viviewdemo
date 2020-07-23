<template>
  <div>
    <h3>Hello vuex</h3>
    <input type="button" value="addTest" @click="add">
    {{localCount}}
  </div>
</template>

<script>
  export default {
    name: "XTest",
    data(){
      return{
        localCount:10
      }
    },
    methods:{
      add(){
        this.$store.dispatch('addAct',this.localCount)
        console.log(this.$store.state.counter)
        console.log(this.$store.getters.countGet)
      }
    }
  }
</script>

<style scoped>

</style>
