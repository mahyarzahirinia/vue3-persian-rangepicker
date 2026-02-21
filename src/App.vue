<script lang="ts" setup>
  import DatePicker from './components/DatePicker.vue';
</script>

<template>
  <div style="display: flex; justify-content: center; align-items: center">
    <DatePicker
      ui-mode="inline"
      type="datetime"
      color="blue"
      mode="range"
      locale="en"
      alt-name="rest"
      style="width: 300px"
    ></DatePicker>
  </div>
</template>

<style>
  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
  }
</style>
