<script>
  import { getNewVersion } from "./utils/help"

  export default {
    onLaunch: function () {
      console.log("App Launch");
      // 检查是否有新版本
      getNewVersion()
    },
    onShow: function () {
      console.log("App Show");
    },
    onHide: function () {
      console.log("App Hide");
    },
    onError(errMsg) {
      console.log(errMsg);
    },
  };
</script>

<style>
  /*每个页面公共css */
</style>
