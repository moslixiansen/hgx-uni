<template>
  <div class="container" v-if="canIUse">
    <img class="bg" mode="aspectFill"/>
    <div class="userinfo">
      <div class="userinfo-avatar">
        <open-data type="userAvatarUrl"></open-data>
      </div>
      <open-data type="userNickName" style="font-size: 13pt;"></open-data>
    </div>
    <div class="log-bottom">
      <button class="log-button" open-type="getUserInfo" @getuserinfo="getInfo">
        登录
      </button>
    </div>
  </div>
  <div v-else class="animation-container">
    <div class="loading-img-container">
      <div class="loading-img loading-img-y">
        <img
          v-if="loadingImgType === 1"
          src="/static/assets/ic_loading_1.png"
          style="width: 56px;height:50px;"
          class="loading-img-rotate"
        />
        <img
          v-else-if="loadingImgType === 2"
          src="/static/assets/ic_loading_2.png"
          style="width: 51px;height:41px;"
          class="loading-img-rotate"
        />
        <img
          v-else-if="loadingImgType === 3"
          src="/static/assets/ic_loading_3.png"
          style="width: 72px;height:51px;"
          class="loading-img-rotate"
        />
      </div>
    </div>
    <div class="loading" style="display:flex;">
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        canIUse: false,
        loadingImgType: Math.ceil(Math.random() * 3)
      };
    },
    methods: {},
    onLoad(options) {

      this.$api.getOpenId()
        .then()
        .catch()
        .finally(() => {
          this.$router.push('/pages/bind', {
            name: 'leo'
          })
        })
    }
  };
</script>

<style lang="scss" scoped>
  .animation-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    position: relative;
    width: 100%;
    height: 45vh;
  }

  .loading-gif {
    width: 83px;
    height: 96px;
    min-width: 83px;
    min-height: 96px;
  }

  .loading-img-container {
    overflow: hidden;
    width: 100%;
    height: 180px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;

    // animation: loading-rotate 1.5s ease-in;
    // animation-iteration-count: infinite;
  }

  .loading-img {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 80px;
  }

  .loading-img-y {
    -webkit-transform: translateY(100%);
    transform: translateY(100%);
    animation: loading-y 1.5s cubic-bezier(0.5, -0.5, 1, 1);
    animation-iteration-count: infinite;
    // animation-timing-function: cubic-bezier(0.5, -0.5, 1, 1);
    //
    // .56,.24,.54,.81
    // .55,.3,.54,.81
    // 0.68, 0.55, 0.27, 0.95
  }

  .loading-img-rotate {
    animation: loading-rotate 1.5s;
    animation-iteration-count: infinite;
    animation-timing-function: 0.9, 0, 0.55, 1.09;
  }

  .loading-text {
    font-size: 18px;
    // font-weight:500;
    font-family: Verdana;
  }

  @keyframes loading-rotate {
    0% {
      transform: rotate(0deg);
    }

    85% {
      transform: rotate(-40deg);
    }
    100% {
      transform: rotate(-40deg);
    }
  }

  .loading-img-y {
    -webkit-transform: translateY(100%);
    transform: translateY(100%);
    animation: loading-y 1.5s cubic-bezier(0.5, -0.5, 1, 1);
    animation-iteration-count: infinite;
    // animation-timing-function: cubic-bezier(0.5, -0.5, 1, 1);
    //
    // .56,.24,.54,.81
    // .55,.3,.54,.81
    // 0.68, 0.55, 0.27, 0.95
  }

  .loading-img-rotate {
    animation: loading-rotate 1.5s;
    animation-iteration-count: infinite;
    animation-timing-function: 0.9, 0, 0.55, 1.09;
  }

  .loading-text {
    font-size: 18px;
    // font-weight:500;
    font-family: Verdana;
  }

  @keyframes loading-rotate {
    0% {
      transform: rotate(0deg);
    }

    85% {
      transform: rotate(-40deg);
    }
    100% {
      transform: rotate(-40deg);
    }
  }

  @keyframes loading-y {
    0% {
      transform: translateY(110%);
    }

    42.5% {
      transform: translateY(-70%);
    }

    85% {
      transform: translateY(110%);
    }
    100% {
      transform: translateY(110%);
    }
  }

  .loading {
    margin-top: 4pt;
  }

  .loading span {
    display: inline-block;
    vertical-align: middle;
    width: 0.5em;
    height: 0.5em;
    margin: 0.19em;
    background: #a2d339;
    border-radius: 0.5em;
    animation: loading 1s infinite alternate;
  }

  /*
       * Dots Colors
       * Smarter targeting vs nth-of-type?
       */

  .loading span:nth-of-type(2) {
    background: #d9e347;
    animation-delay: 0.6s;
  }

  .loading span:nth-of-type(3) {
    background: #ffe955;
    animation-delay: 0.8s;
  }

  .loading span:nth-of-type(4) {
    background: #ffd265;
    animation-delay: 1s;
  }

  .loading span:nth-of-type(5) {
    background: #ffb573;
    animation-delay: 1.2s;
  }

  /*
       * Animation keyframes
       * Use transition opacity instead of keyframes?
       */
  @keyframes loading {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
</style>
