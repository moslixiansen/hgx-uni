/**
 * 提示消息
 * @param {*} title 提示的内容
 * @param {*} icon 图标
 *  success  显示成功图标，此时 title 文本最多显示 7 个汉字长度
 *  loading  显示加载图标，此时 title 文本最多显示 7 个汉字长度
 *  none  不显示图标，此时 title 文本最多可显示两行，1.9.0及以上版本支持
 * @param {*} duration 提示的延迟时间
 * @param {*} mask 是否显示透明蒙层，防止触摸穿透
 */
function showToast(title, icon = 'none', mask = false, duration = 3000) {
  wx.showToast({
    title,
    icon,
    mask,
    duration,
  })
}

/**
 * 检查数据类型 -- 返回值为传入变量对应的数据类型
 * @param {*} ""
 * @returns Boolean
 */
function isType(param = '') {
  return function (type) {
    return Object.prototype.toString.call(param) === `[object ${type}]`
  }
}

/**
 * 获取新版本的内容
 */
function getNewVersion() {
  const updateManager = wx.getUpdateManager()
  updateManager.onUpdateReady(function () {
    wx.showModal({
      title: '更新提示',
      content: '新版本已经准备好，是否重启应用？',
      success: function (res) {
        // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
        res.confirm && updateManager.applyUpdate()
      }
    })
  })
  updateManager.onUpdateFailed(function () {
    // 新版本下载失败
    console.log("拉取新版本失败！")
  })
}


function showBindModal() {
  wx.showModal({
    title: '提示',
    content: '您还未绑定花果鲜会员哦，请先绑定花果鲜会员~',
    showCancel: true,
    cancelText: '随便看看',
    confirmText: '立即绑定',
    confirmColor: '#56BD6E',
    success(res) {
      res.confirm && wx.reLaunch({ url: '/pages/home' })
    }
  })
}


export {
  showToast,
  isType,
  getNewVersion,
  showBindModal,
}
