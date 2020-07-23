<template>
  <div>
    <h3>A组件：{{name}}</h3>
    <button @click="sendName">将数据发送给C组件</button>
  </div>
</template>

<script>
  import Event from '../Help/Vue.js'

  export default {
    name: "A",
    data(){
      return{
        name:'来自组件A的name'
      }
    },
    methods:{
      sendName(){
        Event.$emit('senderA',this.name)
      }
    }
  }
</script>

<style scoped>

</style>
