import Vue from "vue";
import App from "./App";
import api from "./api";
import store from "./store";
import router from "./router";

Vue.config.productionTip = false;

App.store = store;
App.mpType = "app";
App.api = api;

Vue.prototype.$api = api;
Vue.prototype.$store = store;
Vue.prototype.$router = router;

const app = new Vue({
  ...App
});
app.$mount();
