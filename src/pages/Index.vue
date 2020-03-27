<template>
  <div class="container" v-if="canIUse">
    <img mode="aspectFill" class="bg" />
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
import { showToast, getPathFromName } from "../utils";
import { saveFileToLocal } from "../utils/fileCache";
import config from "@/application/config";

export default {
  data() {
    return {
      canIUse: false,
      // 以上是下单使用的字段

      myCode: "",
      // 分享相关
      group_buy_id: "",
      address_id: "",
      leaderId: "",
      commentId: "",
      isViewDetail: false,
      sharing_nickname: "",
      customer_address_id: "",
      sharing_wxid: "",
      share_client_id: 0,
      click_nickname: "",
      click_wxid: "",
      // 防止多次请求登陆
      isLoading: false,
      loadingImgType: 0,
      share_product_id: -1,
      toPage: "",
      isFromLeader: false
    };
  },
  methods: {
    getInfo(e) {
      if (e.detail.userInfo) {
        this.canIUse = false;
        wx.login({
          success: res => {
            this.myCode = res.code;
            this.requestInfo(res.code);
          }
        });
      }
    },
    login() {
      // TODO 应该在 fail() 上报错误
      wx.getSetting({
        success: res => {
          if (res.authSetting["scope.userInfo"]) {
            wx.login({
              success: res => {
                this.requestInfo(res.code);
              },
              fail: () => {
                this.onGetSettingFail();
              }
            });
          } else {
            this.onGetSettingFail();
          }
        },
        fail: () => {
          this.onGetSettingFail();
        }
      });
    },
    onGetSettingFail() {
      if (!this.isFromShare()) {
        // 在非分享的情况下, 由于小程序的规定不能强制用户登录
        this.redirectHome();
      } else {
        this.canIUse = true;
      }
    },
    isFromShare() {
      // 是否来自分享, 理论上可以使用小程序提供的场景值判断; 但是用值是否存在更健壮
      let isFromShare =
        this.group_buy_id || this.commentId || this.customer_address_id;
      console.log(isFromShare);
      return isFromShare;
    },
    redirectHome() {
      this.$router.replace({ path: "home" });
    },
    requestInfo(code) {
      if (this.isLoading) {
        return;
      }
      this.isLoading = true;
      const user = config.getUserInfo();
      let clientId, wxid;
      if (user) {
        clientId = user.id;
        wxid = user.wxid;
      }
      wx.getUserInfo({
        withCredentials: true,
        success: res => {
          this.$api
            .login({
              isShow: false,
              code: code,
              encryptedData: res.encryptedData,
              iv: res.iv,
              client_id: clientId,
              wxid: wxid,
              userInfo: res.rawData
            })
            .then(res => {
              this.goWithRequestData(res.data);
            })
            .catch(err => {
              console.log("err", err);
              showToast("网络请求报错:" + err.msg, "none", 3000);
              this.isLoading = false;
              this.canIUse = true;
            });
        }
      });
    },
    /**
     * data: api.login() => result
     * 根据本地的参数 (getDataFromOptions) 决定跳转的路径和参数
     *
     * */
    goWithRequestData(data) {
      let resClientID = data.id;
      this.isLoading = false;
      // 更新本地的缓存数据
      getApp().globalData.subscribeCouponList = [];
      config.setToken(data.token);
      config.setUserInfo(data);
      if (this.share_client_id && +resClientID !== +this.share_client_id) {
        getApp().globalData.share_client_id = this.share_client_id;
      }
      // 如果有二维码则缓存
      if (data.qrcode_url) {
        this.saveVoucherQrcodeToLocal(data.qrcode_url);
      }
      // this.group_buy_id 有值, 则跳转到该团购详情
      if (this.group_buy_id && this.group_buy_id !== "") {
        this.click_nickname = data.nickname;
        this.click_wxid = data.wxid;
        // 通过分享链接关注，并获取已领取未提示的优惠券信息
        this.goToMall();
      } else if (this.isFromLeader && this.customer_address_id) {
        // isFromLeader 为 true, 则默认要跳转到该团长自己的社区, 防止默认社区不一致先切换关注社区
        // this.group_buy_id 为空证明该团长没有正在进行的团购, 所以只能跳转到首页
        this.$api
          .setDefaultAddress({
            customer_address_id: this.customer_address_id,
            client_id: resClientID
          })
          .finally(() => {
            // 不管结果都跳转到首页
            this.goToHome(resClientID);
          });
      } else if (this.commentId) {
        // 有素材的 id, 则优先跳到首页的素材详情
        this.goToComment(resClientID);
      } else if (this.toPage) {
        // 分享参数中有些会带 page 字段, 调用 getPathFromName() 方法获取到对应的 path
        this.goToHome(resClientID);
      } else {
        // 如果 this.group_buy_id 无值, 则获取关注的社区, 如果该社区有正在开的团购则跳转到团购详情
        this.$api
          .getDefaultAddress({
            client_id: resClientID,
            errorMsg: "获取默认社区失败"
          })
          .then(res => {
            let addressInfo = res.data;
            if (addressInfo.group_buy_id) {
              // 关注社区有正在开团的团购
              // TODO 是否需要立刻缓存 address 信息
              this.group_buy_id = addressInfo.group_buy_id;
              this.address_id = addressInfo.id;
              this.goToMall();
            } else {
              this.goToHome(resClientID);
            }
          })
          .catch(err => {
            this.goToHome(resClientID);
          });
      }
    },
    // 关注社区, 但没有设置为默认社区
    commentShare(clientId) {
      return this.$api.commentShare({
        client_id: clientId,
        customer_address_id: this.customer_address_id
      });
    },
    goToMall() {
      // 存在不是从分享跳转的情况
      if (this.click_wxid) {
        this.$api
          .shareLink({
            click_wxid: this.click_wxid,
            click_nickname: this.click_nickname,
            sharing_wxid: this.sharing_wxid,
            sharing_nickname: this.sharing_nickname,
            leader_client_id: this.leader_client_id,
            group_buy_id: this.group_buy_id
          })
          .then(({ data }) => {
            // 如果返回了优惠券则到团购详情中展示出来
            if (data.coupon_list && data.coupon_list.length) {
              getApp().globalData.subscribeCouponList.push(...data.coupon_list);
            }
          })
          .catch(error => {
            showToast(error);
            // 分享链接关注操作失败也要跳转到分享页
          })
          .finally(() => {
            this.getAddressAndGoToMall();
          });
      } else {
        const queryOptions = {
          group_buy_id: this.group_buy_id,
          addressId: this.address_id,
          fromShare: false
        };
        if (this.share_product_id !== -1) {
          queryOptions.share_product_id = this.share_product_id;
        }
        this.$router.replace({
          path: "/pages/mallDetail",
          query: queryOptions
        });
      }
    },
    saveVoucherQrcodeToLocal(url) {
      saveFileToLocal("voucherQrCode", url, false);
    },
    checkAndUpdate() {
      const canUse = wx.canIUse("getUpdateManager");
      if (canUse) {
        const updateManager = wx.getUpdateManager();
        updateManager.onCheckForUpdate(res => {
          if (res.hasUpdate) {
            this.$api.needUpdate({ isShow: false }).then(res => {
              if (res.data.force === true) {
                updateManager.onUpdateReady(function() {
                  wx.showModal({
                    title: "更新提示",
                    content: "新版本已经准备好，请确认重启应用",
                    showCancel: false,
                    confirmText: "确认重启",
                    success: function(res) {
                      if (res.confirm) {
                        updateManager.applyUpdate();
                      }
                    }
                  });
                });
              }
            });
          }
        });
      }
    },
    getDisplayCoupon() {
      this.$api.getDisplayCoupon({}).then(({ data: couponList }) => {
        if (couponList && couponList.length > 0) {
          getApp().globalData.subscribeCouponList.push(...couponList);
        }
      });
    },
    // 跳转去「首页 - 素材详情」, 可以考虑和 goToHome() 合并
    async goToComment(clientId) {
      let replace = {
        path: "home",
        query: {
          commentId: this.commentId,
          isViewDetail: this.isViewDetail
        }
      };
      await this.commentShare(clientId);
      this.$router.replace(replace);
    },
    async goToHome(clientId) {
      let replace = {
        path: "home"
      };
      if (this.customer_address_id) {
        await this.commentShare(clientId);
        if (this.toPage) {
          replace.query = {
            toPage: getPathFromName(this.toPage)
          };
        }
      }
      this.$router.replace(replace);
    },
    /*
     * -- mallDetail.vue 分享参数:
     * group_buy_id      // 团购 id
     * leader_client_id  // 团长 id
     * sharing_nickname  // 分享人名称
     * sharing_wxid      // userInfo.wxid
     * share_client_id   // userInfo.id
     *
     * -- productDetail.vue 分享参数:
     * group_buy_id      // 团购 id
     * leader_client_id  // 团长 id
     * sharing_nickname  // 分享人名称
     * sharing_wxid      // userInfo.wxid
     * share_client_id   // userInfo.id
     * share_product_id  // 商品 id
     *
     * -- materialDetail.vue 分享参数:
     * commentId             // 素材 id
     * share_client_id       // userInfo.id
     * customer_address_id   // 社区 id
     *
     * -- materialDetailSingle.vue 分享参数:
     * commentId             //  素材 id
     * isViewDetail          //  区分是否为明细页分享 (materialDetailSingle.vue | materialDetail.vue)
     * customer_address_id   // 社区 id
     * share_client_id
     *
     * -- receiveCoupon.vue 分享参数:
     * customer_address_id   // 社区 id
     * page                  // 跳转的路径
     *
     * -- 提货通知 (预期跳转路径为: 「首页」>「我的凭证」)分享参数:
     * groupBuyId      // 团购 id
     *
     * -- 团长端小程序跳转参数:
     * isFromLeader      // 从团长端跳转
     * from              // 过来的路由
     * group_buy_id      // 团购 id
     * customer_address_id   // 社区 id
     */
    getDataFromOptions(options) {
      console.log("options", options);
      this.commentId = options.commentId;
      this.isViewDetail = !!options.isViewDetail;
      this.group_buy_id = options.group_buy_id;
      this.sharing_nickname = options.sharing_nickname;
      this.sharing_wxid = options.sharing_wxid;
      this.leader_client_id = options.leader_client_id;
      this.customer_address_id = options.customer_address_id;
      this.toPage = options.page;
      if (options.share_client_id) {
        this.share_client_id = options.share_client_id;
      }
      if (options.share_product_id) {
        this.share_product_id = options.share_product_id;
      }
      if (options.isFromLeader) {
        this.isFromLeader = options.isFromLeader;
      }
      // 提货通知的参数
      getApp().globalData.groupBuyId = options.groupBuyId
        ? options.groupBuyId
        : "";
    },
    getAddressAndGoToMall() {
      // 使用finally无论接口是否成功调用都执行，不用重复代码
      this.$api
        .getAddressByGroupBuy({
          group_buy_id: this.group_buy_id
        })
        .then(response => {
          const queryOptions = {
            group_buy_id: this.group_buy_id,
            addressId: response.data.id,
            fromShare: true
          };
          if (this.share_product_id !== -1) {
            queryOptions.share_product_id = this.share_product_id;
          }
          this.$router.replace({
            path: "/pages/mallDetail",
            query: queryOptions
          });
        });
    }
  },
  onLoad(options) {
    wx.setNavigationBarTitle({
      title: "/:messages>simple-name:/"
    });
    // 尝试获取全局获取的小程序间跳转参数
    // getEnterOptionsSync() 方法的兼容性太差, 所以用缓存数据的方式传递参数
    let fromLeaderOption = getApp().globalData.fromLeaderMpOptions;
    if (fromLeaderOption) {
      // 清空缓存, 否则下次进入时会再次读取而导致错误
      getApp().globalData.fromLeaderMpOptions = null;
      options = Object.assign(options, fromLeaderOption);
    }
    this.getDataFromOptions(options);
    this.checkAndUpdate();
    // 只要重新进入邻寻，将分享人id清空
    getApp().globalData.share_client_id = 0;
    this.login();
    this.loadingImgType = Math.ceil(Math.random() * 3);
  },
  onUnload() {
    try {
      this._watchers = [];
      this._watcher.teardown();
    } catch (e) {
      console.log("报错了");
    }
    Object.assign(this.$data, this.$options.data());
  }
};
</script>

<style lang="scss" scoped>
.container {
  position: relative;
  height: 100vh;
}

.animation-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 100%;
  height: 100vh;
}

.bg {
  z-index: 100;
  position: absolute;
  height: 100%;
  width: 100%;
}

.userinfo {
  position: relative;
  padding-top: 15px;
  z-index: 200;
  width: 375px;
  height: 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
  top: 10vh;
}

.userinfo-avatar {
  overflow: hidden;
  display: block;
  width: 80px;
  height: 80px;
  margin: 10px;
  margin-top: 25px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 3px 3px 10px rgba(0, 0, 0, 0.2);
}

.log-bottom {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  bottom: 30vh;
}

.log-button {
  width: 225px;
  padding-top: 2.5px;
  padding-bottom: 2.5px;
  background: #e60035;
  box-shadow: 3px 3px 10px rgba(0, 0, 0, 0.2);
  border-radius: 30pt;
  color: white;
  z-index: 200;
  transition: 0.2s;
  font-size: 13pt;
  font-weight: normal;
}

.log-button:active {
  background: rgb(170, 5, 44);
}

.userinfo {
  /* color: #fff; */
  font-size: 14px;
}

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
