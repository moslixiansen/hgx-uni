import {TAB_BAR, AUTH_PAGE, TAB_BAR_POINT_STORE} from "../utils/config"
import {showBindModal} from "../utils/help"

const filterQuery = function (url, query) {
  const queryData = []
  for (const key in query) {
    let item = query[key]
    if (item === undefined) {
      item = ''
      console.warn('开发者提示您：当前有跳转页面传递了一个未定义的参数' + key + '，请检查')
    }
    if (typeof item !== 'string') {
      item = JSON.stringify(item)
    }
    // 避免跳转时被&截断 导致
    item = item.replace(/&/g, '＆')
    queryData.push(key + '=' + item)
  }

  if (queryData.length > 0) {
    url += '?' + queryData.join('&')
  }

  return url
}

/**
 * 可以在这里进行路由拦截, 在每个路由跳转前要做的事情
 * @param {*} url
 * @param {*} params
 */
const beforeEach = function (url, params) {
  // 将 ../ 形式的 url 变成 /pages/   效果:  '../../coupon/coupon'  => '/pages/coupon/coupon'
  const index = url.lastIndexOf('../')
  if (index !== -1) {
    url = '/pages' + url.slice(index + 2)
  }

  if (url === TAB_BAR_POINT_STORE) {
    wx.reLaunch({url})
    return null
  }

  const isTabBar = TAB_BAR.includes(url)

  // 如果 url 是 tabBar, 则用 switchTab
  if (isTabBar) {
    wx.switchTab({
      url,
      success: () => Promise.resolve(),
      fail: err => Promise.reject(err),
    })
    return null
  }

  const isBind = getApp().globalData.clientInfo
  const isAuthPage = AUTH_PAGE.includes(url)
  // 如果 未绑定会员信息 && 非tabBar页 && 非登录注册授权页
  // 则拦截跳转, 弹窗提示绑定会员
  if (!isBind && !isTabBar && !isAuthPage) {
    showBindModal()
    // 拦截页面的跳转
    url = null
  }

  // 统一传参处理
  if (url && params) {
    url = filterQuery(url, params)
  }

  return url
}

const navigateTo = function (url, params, events = {}) {
  url = beforeEach(url, params)

  if (url) {
    return new Promise((resolve, reject) => {
      wx.navigateTo({
        url,
        events,
        success: () => resolve(),
        fail: err => reject(err),
      })
    })
  }
}

const reLaunch = function (url, params) {
  url = beforeEach(url, params)

  if (url) {
    return new Promise((resolve, reject) => {
      wx.reLaunch({
        url,
        success: () => resolve(),
        fail: err => reject(err),
      })
    })
  }
}

const redirectTo = function (url, params) {
  url = beforeEach(url, params)

  if (url) {
    return new Promise((resolve, reject) => {
      wx.redirectTo({
        url,
        success: () => resolve(),
        fail: err => reject(err),
      })
    })
  }
}

const switchTab = function (url) {
  url = beforeEach(url)

  if (url) {
    return new Promise((resolve, reject) => {
      wx.switchTab({
        url,
        success: () => resolve(),
        fail: err => reject(err),
      })
    })
  }
}

const navigateBack = function (delta) {
  return new Promise((resolve, reject) => {
    wx.navigateBack({
      delta,
      success: () => resolve(),
      fail: err => reject(err),
    })
  })
}

export default {
  push: navigateTo,
  replace: redirectTo,
  back: navigateBack,
  reLaunch,
  switchTab
}
