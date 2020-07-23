<template>
<div>
  <div v-show="!isLogin">
    <div>
      登录页面
      <input type="button" value="可以吗" @click="isLogin = true">
    </div>
  </div>
  <div v-show="isLogin">
    <div>
      Main页面
      <input type="button" value="可以吗" @click="isLogin = false">
    </div>
  </div>
</div>
</template>
<script>
  import Event from "../utils/Utils";
  export default {
    name: "Main",
    data() {
      return {
        isLogin: false
      }
    },
    watch:{
      isLogin:function (val) {
        if (val){
          console.log("系统页面")
        }else {
          console.log("登录页面")
        }
      }
    }
  }
</script>

<style scoped>

</style>
