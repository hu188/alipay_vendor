//获取应用实例
const app = getApp();
import {
  encode
} from '../../utils/encode';
import {
  http
} from '../../utils/http';

const lg = require('../../utils/login.js');
Page({
  data: {
    userInfo: {},
    hasUserInfo: '',
    base_url: '',
  },
  onShow() {
    this.setData({
      base_url: app.globalData.base_url,
      hasUserInfo: app.globalData.hasUserInfo,
      userInfo: app.globalData.userInfo,
    })
    //this.login()

  },

  //查看订单
  viewOrders() {
    my.switchTab({
      url: '../order/order',
    });
  },
  //授权登录
  onGetAuthorize(res) {
      lg.saveAliPayLogin().then((res)=>{
       this.onShow()
    },(err)=>{
      
    });
     
    // const that = this;
    // my.getOpenUserInfo({
    //   fail: (res) => {
    //   },
    //   success: (res) => {
    //     let userInfo = JSON.parse(res.response).response // 以下方的报文格式解析两层 response
    //    that.setData({
    //      userInfo:userInfo,
    //      hasUserInfo:true
    //    })
    //    app.globalData.hasUserInfo = true;
    //    lg.saveAliPayLogin()
    //   }
    // });
  },
});
