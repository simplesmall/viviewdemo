<template>
  <div>
    <h3>B组件：{{age}}</h3>
    <button @click="sendAge">将数组发送给C组件</button>
  </div>
</template>

<script>
  import Event from '../Help/Vue.js'
  export default {
    name: "B",
    data(){
      return{
        age:23
      }
    },
    methods:{
      sendAge(){
        Event.$emit('senderB',this.age)
      }
    }
  }
</script>

<style scoped>

</style>
