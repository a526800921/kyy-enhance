/**
 * 项目配置中心
  */

import { Store } from '../render'

// 本地图片存放地址
export const imgPrefix = 'https://xxx'

export const store = new Store({
  imgPrefix,
  installMessage: '添加“xxx”至手机桌面，下次读书更方便',
  appName: 'xxx',
})
