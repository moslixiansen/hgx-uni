import { baseURL, miniSdkVersion } from './config'
import { showToast } from "./help";

const apiGet = function (url, extCfg = {}) {
  return request({
    url,
    method: 'GET',
    extCfg
  })
}

const apiPost = function (url, data = {}, extCfg = {}) {
  return request({
    url,
    method: 'POST',
    data,
    extCfg
  })
}

const request = function ({ url = '', method = 'POST', data = null, extCfg = {} }) {
  // url 拼接
  url = baseURL + url
  // Loading 处理
  extCfg.isLoading = extCfg.isLoading === undefined ? true : extCfg.isLoading // 默认显示 loading
  extCfg.isLoading && wx.showLoading({ mask: true, title: extCfg.loadingTitle || '' })
  // 设置请求头信息
  const header = {
    'content-type': 'application/json',
    'platform': `xx-xx`,
    'mini-sdk-version': miniSdkVersion, // api BaseController 记录日志时的版本号
    'mini-token': '',
    'mini-opt': '',
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url,
      method,
      data,
      header,
      success (res) {
        if (res.statusCode === 200) {
          if (res.data.result) {
            // 请求成功, 接口返回 true
            extCfg.successMsg && showToast(extCfg.successMsg, 'success')
            resolve(res.data)
          } else {
            // 请求成功, 接口返回 false
            console.log(`debug request.js apiError, request url = ${url} `, res.data)
            if (extCfg.showApiErrMsg) {
              const errMsg = extCfg.apiErrMsg || res.data.msg
              showToast(errMsg)
            }
            reject(res.data.msg)
          }
        } else {
          // http 出错, 比如 状态码 404, 400, 500, 502 等
          console.log(`debug request.js httpError, request url = ${url} `, res)
          extCfg.httpErrorMsg && showToast(extCfg.httpErrorMsg)
          reject(res.data.message)
        }
      },
      fail (err) {
        // 调用 wx.request() 失败
        console.log(`debug request.js wx.request() call fail, request url = ${url} `, err)
        reject(err)
      },
      complete () {
        // 隐藏 loading
        extCfg.isLoading && wx.hideLoading()
      }
    })
  })
}

export {
  apiGet,
  apiPost
}
