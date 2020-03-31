export const isDevelopment = (function () {
  return process.env.NODE_ENV === 'development'
})()

export const baseURL = isDevelopment ? 'http://api.hgxcs.huaguosun.com/api/' : 'https://api.huaguosun.com/api/'

export const qiniuUrl = isDevelopment ? 'https://test.img.huaguosun.com' : 'https://img.huaguoshan.com'

export const qiniuShareImageUrl = qiniuUrl + '/share'

export const miniSdkVersion = wx.getSystemInfoSync().SDKVersion

// tabBar 页的路径, 如果上线有变动 tabBar 页需要修改此处
export const TAB_BAR_HOME = '/pages/home'
export const TAB_BAR_MALL = '/pages/mall'
export const TAB_BAR_SHOPPING_CART = '/pages/shoppingCart'
export const TAB_BAR_CLIENT_CENTER = '/pages/clientCenter'

export const TAB_BAR = [
  TAB_BAR_HOME,
  TAB_BAR_MALL,
  TAB_BAR_SHOPPING_CART,
  TAB_BAR_CLIENT_CENTER,
]

export const AUTH_PAGE = [
  '/pages/index',
  '/pages/bind',
  '/pages/register',
]

