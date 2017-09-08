import Vue from 'vue'
import App from './App_mobile.vue'
import store from './store'

new Vue({
  el: '#app',
  store: store,
  render: h => h(App)
})