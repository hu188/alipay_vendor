//获取应用实例
const app = getApp();
import {
  encode
} from '../../../utils/encode';
import {
  http
} from '../../../utils/http';
Page({
  data: {
    orderNo:'',
     base_url: "",
     order:{},
  },
  onLoad(option) {
    const that = this;
    that.setData({
      orderNo:orderNo,
      base_url:app.globalData.base_url
    })
    let orderNo = option.orderNo;
      const params = {
      sign: encode({
        orderNo: orderNo
      }, app.globalData.sessionId),
      sessionId: app.globalData.sessionId,
      params: {
        orderNo: orderNo
      }
    }
    http(this.data.base_url +'qsq/miniService/miniProComm/weChatCommon/saveOrderDetails', params, 1).then(res => {
      that.setData({
        order: res,
      })
    })
  },
});
