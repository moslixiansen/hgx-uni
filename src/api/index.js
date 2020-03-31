import { apiPost, apiGet } from '../utils/request'

// 首页相关 api
const home = {
  getOpenId(reqData) {
    return apiPost('MiniProgram/get-open-id', reqData)
  },
}

// 商城相关 api
const mall = {

}

// 购物车相关 api
const shoppingCart = {

}

// 会员中心相关 api
const clientCenter = {

}


export default {
  ...home,
  ...mall,
  ...shoppingCart,
  ...clientCenter
};
