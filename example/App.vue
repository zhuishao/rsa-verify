<template>
    <div id="app">
        <n-c ref="nc"></n-c>
    </div>
</template>

<script>
    export default {
        name: "App",
        mounted() {
            this.$refs.nc.show();
        }
    }
</script>

<style scoped>

</style>
