import Vue from 'vue'
import App from './App.vue'
import RJ from '../packages';
Vue.use(RJ);

Vue.config.productionTip = false

new Vue({
    render: h => h(App),
}).$mount('#app')
