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
    gList: {},//购物车信息
    deviceName: '',
    base_url: '',
    allGoodList: [],
    payType: 6,//支付宝支付
  },
  onLoad() {

  },
  onShow() {
    let gList = app.globalData.gList;

    this.setData({
      base_url: app.globalData.base_url,
      gList: gList,
      deviceName: app.globalData.deviceName
    })
  },
  submitOrderTap: function() {
    var t = new Date().getTime();
    if (t - app.globalData.orderTimes > 5000) {
      app.globalData.orderTimes = t
      if (app.globalData.classify.indexOf("FF") != -1) {
        //根据设备id查找商品
        const params = {
          sign: encode({
            deviceId: app.globalData.deviceId
          }, app.globalData.sessionId),
          sessionId: app.globalData.sessionId,
          params: {
            deviceId: app.globalData.deviceId
          }
        }
        http(this.data.base_url + 'qsq/service/external/goods/queryGoods', params, 1).then(res => {

          //FF类型设备
          var goodsRoadColumn = res[0].goodsRoadColumn;
          var goods = res[0].goodsRoad1;
          var goodsRoadColumns = "[" + goodsRoadColumn + "]";
          var goodsRoadColumnsJson = JSON.parse(goodsRoadColumns)

          for (var i = 0; i < goodsRoadColumnsJson.length; i++) {
            this.data[goodsRoadColumnsJson[i].value] = goodsRoadColumnsJson[i].columnName;
          }
          var arr = [];
          var goodsJson = JSON.parse(goods);
          for (var i = 0; i < goodsJson.length; i++) {
            arr.push(goodsJson[i]);
            arr[i].commodityName = goodsJson[i][this.data.t]; //t:名称
            arr[i].picture = goodsJson[i][this.data.j]; //j:图片
            arr[i].num = goodsJson[i][this.data.n]; //n:数量
            arr[i].valid = goodsJson[i][this.data.i]; //是否有效 非0有效 
            arr[i].goodId = i + 1;
          }
          this.setData({
            allGoodList: arr
          })
          //查询设备状态（在线、离线、设备忙）
          const params = {
            sign: encode({
              sign: app.globalData.sign,
              appid: app.globalData.id
            }, app.globalData.sessionId),
            sessionId: app.globalData.sessionId,
            params: {
              sign: app.globalData.sign,
              appid: app.globalData.id
            }
          }
          http(this.data.base_url + 'qsq/service/external/device/queryStatus', params, 1).then(res => {
            //无返回设备状态正常
            if (res == '') {
              //创建预付订单
              this.saveOrderInfo()
            } else {
              //显示设备错误状态信息（离线、设备忙）
              my.showToast({
                type: 'exception',
                content: res,
                duration: 3000
              });
            }
          })
        })
      }
    }
  },
  //创建预付订单 查看库存查看，设备是否在线
  saveOrderInfo() {
    //验证商品库存是否充足
    const goodsList = this.data.gList.list;
    const allGoodList = this.data.allGoodList;
    var ts = '';
    for (var j = 0; j < goodsList.length; j++) {
      const gl = allGoodList.filter(item => item.goodId == goodsList[j].goodId)
      if (gl[0].num - goodsList[j].count < 0) {
        ts += gl[0].commodityName + ","
      }
    }
    ts = ts.substring(0, ts.length - 1)
    if (ts == '') {
      const params = {
        sign: encode({
          goodsList: JSON.stringify(goodsList),
          deviceId: app.globalData.deviceId,
          cusId: app.globalData.cusId,
          payType: this.data.payType,
          tp: app.globalData.tp,
          type: app.globalData.type.type,
          levelTypeId: app.globalData.type.levelTypeId,
          keyPoolId: app.globalData.id
        }, app.globalData.sessionId),
        sessionId: app.globalData.sessionId,
        params: {
          goodsList: JSON.stringify(goodsList),
          deviceId: app.globalData.deviceId,
          cusId: app.globalData.cusId,
          payType: this.data.payType,
          tp: app.globalData.tp,
          type: app.globalData.type.type,
          levelTypeId: app.globalData.type.levelTypeId,
          keyPoolId: app.globalData.id
        }
      }
      http(this.data.base_url + 'qsq/miniService/miniProComm/aliPayCommon/saveCommonPay', params, 1).then(res => {
        if (res.tradeNo) {
          my.tradePay({
            tradeNO: res.tradeNo,
            success: function(res) {
              console.info(res);
              if (res.resultCode == 6002) {
                my.showToast({
                  type: 'exception',
                  content: '网络异常',
                  duration: 2000
                });
              } else if (res.resultCode == 9000) {
                my.showToast({
                  type: 'success',
                  content: '支付成功',
                  duration: 2000
                });
                //支付完成清空购物车
                app.globalData.gList = {};
                my.switchTab({
                  url: '../goods/goods', // 跳转的 tabBar 页面的路径（需在 app.json 的 tabBar 字段定义的页面）。注意：路径后不能带参数
                  
                });
              }else if (res.resultCode == 6001) {
                my.showToast({
                  type: 'exception',
                  content: '订单已取消',
                  duration: 2000
                });
              }
            },
            fail: function(res) {
              console.info(res)
            },
          });
        }
      })
    } else {
      $Message({
        content: ts + '库存不足，请重新扫码',
        type: 'error'
      });
    }
  },
});
