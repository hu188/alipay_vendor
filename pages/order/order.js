//获取应用实例
const app = getApp();
import {
  encode
} from '../../utils/encode';
import {
  http
} from '../../utils/http';
Page({
  data: {
    tabs: [{ "tabName": "已付款", "typeId": "4" }, { "tabName": "未付款", "typeId": "3" }, { "tabName": "已退款", "typeId": "2" }, { "tabName": "出货失败", "typeId": "6" }],
    selectType: "4",
    base_url: "",
    orderList: [],
    start: 0,
    pageSize: 10,
    stop: false,
    hasUserInfo: false,
  },
  onLoad() {
    

  },
  selectTab(e) {
    let id = e.currentTarget.dataset.id;
    this.setData({
      selectType: id,
      start: 0,
      stop: false,
      orderList: []
    })
    this.queryOrder(id)
  },

  queryOrder(status) {
    const that = this;
    let list = that.data.orderList;
    if (true) {
      const params = {
        sign: encode({
          cusId: app.globalData.cusId,
          status: status,
          start: that.data.start,
          pageSize: that.data.pageSize
        }, app.globalData.sessionId),
        sessionId: app.globalData.sessionId,
        params: {
          cusId: app.globalData.cusId,
          status: status,
          start: that.data.start,
          pageSize: that.data.pageSize
        }
      }
      http(this.data.base_url + 'qsq/miniService/miniProComm/weChatCommon/getSpedingRecord', params, 1).then(res => {

        that.setData({
          orderList: list.concat(res.orderList),
          start: res.start,
          stop: res.stop
        })
      })
    }
  },
  //
  onScrollToLower() {
    let stop = this.data.stop;
    if (!stop) {
      this.queryOrder(this.data.selectType)
    }
  },
  viewDetail(e) {
    let orderNo = e.currentTarget.dataset.orderNo;
    my.navigateTo({
      url: "./orderDetail/orderDetail?orderNo=" + orderNo
    });
  },
  //退款
  refund(e) {
    const {
      orderNo,
      money
    } = e.currentTarget.dataset
    const params = {
      sign: encode({
        orderNo: orderNo,
        money: money,
        deviceName: app.globalData.deviceName
      }, app.globalData.sessionId),
      sessionId: app.globalData.sessionId,
      params: {
        orderNo: orderNo,
        money: money,
        deviceName: app.globalData.deviceName
      }
    }
    http(this.data.base_url + 'qsq/service/external/refund/orderRefund', params, 1).then(res => {
      my.showToast({
        type: 'success',
        content: res
      });
    })
  },
  onShow() {
    this.setData({
      base_url: app.globalData.base_url,
      hasUserInfo: app.globalData.hasUserInfo
    })
    if (this.data.hasUserInfo && app.globalData.cusId) {
      this.queryOrder(this.data.selectType)
    }
  }
});
