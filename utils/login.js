const app = getApp();
import {
  http
} from '../utils/http';
import {
  encode
} from '../utils/encode';

// 获取sessionId
function getSessionKey(obj) {
  const that = this;
  const keyPoolId = app.globalData.id;
  const base_url = app.globalData.base_url;
  http(base_url + "qsq/miniService/miniProComm/weChatCommon/saveSecretKey", { keyPoolId: keyPoolId }, 1).then(res => {
    if (res.sessionId) {
      app.globalData.sessionId = res.sessionId;
      app.globalData.type = {
        type: res.type,
        levelTypeId: res.levelTypeId
      }
    }
    that.saveAliPayLogin().then((res)=>{
      
    },(fail)=>{
      
    });
    // my.getSetting({
    //   success: (res) => {
    //     if (res.authSetting["userInfo"]) {
    //       //已授权，更新用户信息
    //       app.globalData.hasUserInfo = true;
    //       that.saveAliPayLogin();
    //     } else {
    //       //未授权
    //       app.globalData.hasUserInfo = false;
    //     }
    //   }
    // })
    //查询设备
    obj.queryDevice(app.globalData.sign)
  })
}
function  saveAliPayLogin() {
  return new Promise((resolve, reject) => {
  const base_url = app.globalData.base_url;
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
          http(base_url + 'qsq/miniService/miniProComm/aliPayCommon/saveAliPayLogin', params, 1).then(res => {
            if (res) {
              app.globalData.cusId = res.id;
              app.globalData.hasUserInfo = true;
              app.globalData.userInfo = res;
              // my.getAuthUserInfo({
              //   success: (res) => {
              //     app.globalData.userInfo = res;
              //     console.info(res)
              //   },
              // });
               resolve(res);
            }
          })
        }
      },
      fail: (error) => {
           app.globalData.hasUserInfo = false;
            reject({
            message: '授权失败',
            error
          });
        }
    });
     });
  }

module.exports = {
  getSessionKey: getSessionKey,
  saveAliPayLogin:saveAliPayLogin
}