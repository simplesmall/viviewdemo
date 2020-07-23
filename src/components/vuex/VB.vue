<template>
  <div>
    <p>B组件</p>

    <input type="button" value="B组件按钮" @click="sendB">
    <VBSon/>
    <div v-show="show">
      <h3>展示出来咯</h3>
    </div>
  </div>
</template>

<script>
  import VBSon from "./VBSon";
  export default {
    name: "VB",
    data(){
      return{
        show:false
      }
    },
    methods:{
      sendB(){
        this.$store.dispatch('addAct',23)
      }
    },
    components:{
      VBSon
    },
    watch:{
      '$store.state.counter':function (val) {
          if (val>100){
            this.show = true
            console.log("组件B中已经超过100了")
          }
      }
    }
  }
</script>

<style scoped>

</style>
