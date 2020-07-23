<template>
  <div>
    <VA />
    <VB />
    <h3>Hello vuex</h3>
    <input type="button" value="addTest" @click="add">
    {{localCount}}
  </div>
</template>

<script>
  import VA from "./vuex/VA";
  import VB from "./vuex/VB";
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
    },
    components:{
      VA,
      VB
    },
    watch:{
      '$store.state.counter':function (val) {
        if (val>50){
          console.log("watch 里面的值:",val)
        }
      }
    }
  }
</script>

<style scoped>

</style>
