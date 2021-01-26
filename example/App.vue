<template>
    <div id="app">
        <button @click="show">click me</button>
        <button @click="changeLanguage">language</button>
        <n-c :locale="locale" @onsuccess="handleSubmit" ref="nc"></n-c>
    </div>
</template>

<script>
    export default {
        name: "App",
        data() {
          return {
            locale: 'zh',
          };
        },
        mounted() {
            this.$refs.nc.show();
        },
        methods: {
            show() {
                this.$refs.nc.show('zhewei.zhu');
            },
            handleSubmit(code) {
                this.login(code).then(prod => {
                    console.log(prod);
                })
            },
            login(code) {
                return new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    const data = new FormData();
                    data.append('username', 'username');
                    data.append('password', 'password');
                    data.append('code', code);
                    xhr.open('post',`http://10.43.188.158:8080/login`);
                    xhr.onreadystatechange = function () {
                        switch (xhr.readyState) {
                            case 4:
                                if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
                                    resolve(JSON.parse(xhr.response));
                                } else {
                                    reject(false);
                                }
                                break;
                        }
                    }
                    xhr.send(data);
                })
            },
            changeLanguage() {
                if (this.locale === 'zh') {
                    this.locale = 'en';
                } else {
                    this.locale = 'zh';
                }
            }
        }
    }
</script>

<style scoped>

</style>
