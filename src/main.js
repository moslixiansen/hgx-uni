import Vue from "vue";
import App from "./App";
import api from "./api";
import store from "./store";
import router from "./router";

// Promise.prototype.finally 的 polyfill，真机调试中不支持 es2018
require('promise.prototype.finally').shim()

Vue.config.productionTip = false;

App.mpType = "app";

Vue.prototype.$api = api;
Vue.prototype.$store = store;
Vue.prototype.$router = router;

const app = new Vue({
  ...App
});
app.$mount();
