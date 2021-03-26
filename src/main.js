import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axiosConfig from 'api/axiosConfig'
import VueLazyload from 'vue-lazyload'
import 'common/stylus/index.styl'

Vue.config.productionTip = false

Vue.use(axiosConfig)
Vue.use(VueLazyload, {
  preLoad: 1.3,
  attempt: 1,
  error: '',
  loading: require('common/image/default.png'),
});

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
