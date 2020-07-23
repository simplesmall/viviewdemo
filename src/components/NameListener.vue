<template>
  <div>
    <h3>监听BUS组件</h3>
    <p>监听来自总线BUS的name:</p>
    {{name}}
    <div v-show="name">
      <h4>这是自己操作的结果</h4>
      {{selfName}}
    </div>
    <br>
    监听来自总线BUS的age:
    {{selfAge}}
  </div>
</template>

<script>
  export default {
    name: "NameListener",
    props: ['name', 'age'],
    data() {
      return {
        selfName: '咦?',
        selfAge:0
      }
    },
    mounted() {
    },
    methods: {
      runEditSelf(name) {
        this.selfName = name + '+这是我自己加的'
      },
      editAge(age){
        this.selfAge = age +'  after'
      }
    },
    watch: {
      name: function(val) {
        document.querySelector('p').style = 'color:red';
        this.runEditSelf(val)
      },
      age:function (val) {
        this.editAge(val)
      }
    }
  }
</script>

<style scoped>

</style>
