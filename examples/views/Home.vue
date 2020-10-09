<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <n-c ref="nc"></n-c>
  </div>
</template>

<script>
// @ is an alias to /src

export default {
  name: 'Home',
  mounted() {
    this.$refs.nc.show();
    console.log(this.$refs.nc.setCode('123'));
  }
}
</script>
