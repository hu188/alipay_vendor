//获取应用实例
const app = getApp();
import {
  encode
} from '../../../utils/encode';
import {
  http
} from '../../../utils/http';

const lg = require('../../../utils/login.js');
Page({
  data: {
    base_url:"",
    hasUserInfo:'',
  },
  onLoad() { 
    this.setData({
      base_url: app.globalData.base_url,
      hasUserInfo:app.globalData.hasUserInfo
    })
  },
  login() {
    my.getAuthCode({
      scopes: 'auth_user', // 主动授权：auth_user，静默授权：auth_base。或者其它scope
      success: (res) => {
        if (res.authCode) {
          const params = {
            sign: encode({
              authCode: res.authCode,
              keyPoolId: app.globalData.id
            }, app.globalData.sessionId),
            sessionId: app.globalData.sessionId,
            params: {
              authCode: res.authCode,
              keyPoolId: app.globalData.id
            }
          }
          // 认证成功
          // 调用自己的服务端接口，让服务端进行后端的授权认证，并且种session，需要解决跨域问题
          http(this.data.base_url + 'qsq/miniService/miniProComm/aliPayCommon/saveAliPayLogin', params, 1).then(res => {
            console.info(res)
          })
        }
      },
    });
  },
});
