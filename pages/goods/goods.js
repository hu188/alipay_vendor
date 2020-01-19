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
    base_url: "https://www.tianrenyun.com/",
    checkIndex: 0,
    goodsList: [],
    sign: '',//设备编号，
    tp: '',//0单货道，1多货道
    classify: "",//设备类型
    deviceId: "",//设备id
    randomNum: '',
    isLayered: false,//是否分层
    s_height: [],
    g_Count: 0,//购物车数量
    g_total_money: 0,//购物车总价
    hideCarDetails: true,
    gList: [],//购物车商品
  },
  onLoad(options) {
    //BbfIIBHJBdjAa
    var url = 'https://www.tianrenyun.com/qsq/paomian/?sign=BmcKLAeVhAeVhAc&type=2&appid=5&tp=1'
    //var url = 'https://www.tianrenyun.com/qsq/paomian/?sign=&type=2&appid=5&tp='
    
    if (options.q) {
      url = decodeURIComponent(options.q);
    }
    this.decodeUrl(url);
    this.setData({
      base_url: app.globalData.base_url,
      randomNum: app.globalData.randomNum
    })
    lg.getSessionKey(this)
  },
  //解析二维码
  decodeUrl(url) {
    if (url) {
      url = url
    }
    var urlList = url.split("?")
    var params = urlList[1].split("&")
    var si = params[0].split("=")
    var type = params[1].split("=")
    var id = params[2].split("=")
    var tp = params[3].split("=")

    if (type[1] == 2) {
      app.globalData.base_url = "https://qsq.mynatapp.cc/"
    }
    app.globalData.id = id[1]
    app.globalData.sign = si[1]
    app.globalData.tp = tp[1]
    this.setData({
      sign: si[1],
      tp: tp[1]
    });
  },
  //扫码
  scan(){
     my.scan({
      type: 'qr',
      success: (res) => {
       
        this.decodeUrl(res.code)
        this.queryDevice(this.data.sign)
      },
    });
  },
  //查询设备信息
  queryDevice(sign) {
    if (sign) {
      const params = {
        sign: encode({
          sign: sign
        }, app.globalData.sessionId),
        sessionId: app.globalData.sessionId,
        params: {
          sign: sign
        }
      }
      http(this.data.base_url + 'qsq/service/external/device/query', params, 1).then(res => {
        this.setData({
          classify: res[0].classify,
          deviceId: res[0].deviceId
        })
        app.globalData.deviceName = res[0].deviceName
        app.globalData.deviceId = res[0].deviceId
        app.globalData.classify = res[0].classify
        //普通设备
        //扫码进入，发送73包
        const data = {
          sign: encode({
            deviceId: this.data.deviceId
          }, app.globalData.sessionId),
          sessionId: app.globalData.sessionId,
          params: {
            deviceId: this.data.deviceId
          }
        }
        http(this.data.base_url + 'qsq/service/external/device/sendPacket', data, 1).then(res => {
          if (res.result != '') {
            my.showToast({
              type: 'exception',
              content: res.result,
              duration: 3000,
            });
          }

        })
        this.queryGoods(this.data.deviceId)


      })
    }
  },

  //根据设备id查找商品
  queryGoods(deviceId) {
    const that = this;
    const params = {
      sign: encode({
        deviceId: deviceId
      }, app.globalData.sessionId),
      sessionId: app.globalData.sessionId,
      params: {
        deviceId: deviceId
      }
    }
    http(that.data.base_url + 'qsq/service/external/goods/queryGoods', params, 1).then(res => {

      if (that.data.classify.indexOf("FF") != -1) {
        var goodsRoadColumn = JSON.parse("[" + res[0].goodsRoadColumn + "]");
        for (var i = 0; i < goodsRoadColumn.length; i++) {
          that.data[goodsRoadColumn[i].value] = goodsRoadColumn[i].columnName;
        }
        var goods = JSON.parse(res[0].goodsRoad1);

        for (var j = 0; j < goods.length; j++) {
          goods[j].commodityName = goods[j][that.data.t]; //t:名称
          goods[j].picture = goods[j][that.data.j]; //j:图片
          goods[j].num = goods[j][that.data.n]; //n:数量
          goods[j].valid = goods[j][that.data.i]; ///是否有效 0有效，1无效 
          goods[j].retailPrice = goods[j][that.data.p]; //原价
          goods[j].goodId = j + 1;
          goods[j].count = 0;

          if (that.data.s && goods[j][that.data.s] >= 100 && goods[j][that.data.s] <= 1100) {
            that.setData({
              isLayered: true,//是否分层
            })
          }
          //购物车有商品，遍历数量
          let selectGood = this.data.gList

          if (selectGood.length > 0) {
            selectGood.forEach((item) => {

              if (item.goodId == goods[j].goodId) {
                goods[j].count = item.count
              }
            })
          }
        }


        //分层显示
        var good = {};
        var arr = [];
        if (that.data.isLayered) {
          var goodRoads = ["第一层", "第二层", "第三层", "第四层", "第五层", "第六层", "第七层", "第八层", "第九层", "第十层"];
          var index = 0;
          for (var k = 100; k <= 1000; k = k + 100) {

            var s = goods.filter((item) => {
              return item.s > k && item.s < k + 100
            })
            if (s.length > 0) {
              good = {
                type: goodRoads[index],
                goodsList: s,
                index: index
              }
              index++;
              arr.push(good)
              good = {};
            }
          }


        } else {
          good = {
            type: "商品",
            goodsList: goods,
            index: 0
          }
          arr.push(good)
        }
        that.setData({
          goodsList: arr
        })

        //用于切换选项卡
        var s_height = [0];
        var list = that.data.goodsList;
        var h = 0;
        for (var a = 0; a < list.length; a++) {
          var good_num = list[a].goodsList.length;
          h += 35 + good_num * 90
          s_height.push(h);
        }
        that.setData({
          s_height: s_height
        })
      }
    })
  },
  changeType(e) {
    var i = e.currentTarget.dataset.index;
    this.setData({
      checkIndex: i
    })
  },
  scroll(e) {

    const that = this;
    const scrollHight = that.data.s_height;
    for (var i in scrollHight) {
      if (e.detail.scrollTop < scrollHight[i]) {
        that.setData({
          checkIndex: i - 1
        })
        break;
      }
    }

  },
  //选择商品数量
  onChange(e) {
    //判断是否授权
    if (app.globalData.hasUserInfo && app.globalData.cusId) {
      let { goodType, goodIndex, type } = e.currentTarget.dataset;
      const that = this;
      let tp = app.globalData.tp;
      let goodsList = that.data.goodsList;
      let gList = that.data.gList;
      let good = goodsList[goodType].goodsList[goodIndex];
      //有效值为1 不可购买
      if (good.valid && good.valid == 1) {
        my.showToast({
          type: 'exception',
          content: '货到故障！请选择其他商品！',
          duration: 2000
        });
      } else {

        if (type == "add") {
          //单货道只能购买一个
          if (tp == 0 && gList.length >= 1) {
            my.showToast({
              type: 'exception',
              content: '只能选择一个商品喔！',
              duration: 2000
            });
            return;
          } else {
            good.count++;
            good.count = Math.min(good.count, good.num);
          }
        } else {
          good.count--;
        }

        var s = gList.filter(item => item.goodId != good.goodId && item.count > 0);
        s.push(good);
        var selectGoods = s.filter(item => item.count > 0);
        var totalMoney = 0;
        var totalCount = 0;
        selectGoods.forEach((item) => {
          totalCount += item.count;
          let price = item.retailPrice * item.count;
          totalMoney += price;
        })
        that.setData({
          goodsList: goodsList,
          gList: selectGoods,
          g_Count: totalCount,
          g_total_money: totalMoney
        })
        app.globalData.gList = {
          list: selectGoods,
          g_Count: totalCount,
          g_total_money: totalMoney
        }
      }
    } else {
      my.confirm({
        title: '温馨提示',
        content: '购买商品需要先授权登录，您确定去登陆吗？',
        confirmButtonText: '确定登录',
        cancelButtonText: '暂不需要',
        success: (result) => {
          if (result.confirm) {
            my.switchTab({
              url: '../mycenter/mycenter', // 跳转的 tabBar 页面的路径（需在 app.json 的 tabBar 字段定义的页面）。注意：路径后不能带参数
            });
          }
        },
      });
    }
  },
  showCarDetails() {
    let hideCarDetails = this.data.hideCarDetails;
    this.setData({
      hideCarDetails: !hideCarDetails,
    })
  },
  hideCarDetails() {
    this.setData({
      hideCarDetails: true,
    })
  },
  //购物车数量操作，num数量，goodId:商品id
  cartChange(e) {
    let { type, goodId } = e.currentTarget.dataset;
    let tp = app.globalData.tp;

    let gList = this.data.gList;
    let goodsList = this.data.goodsList;
    gList.forEach((item) => {
      if (item.goodId == goodId) {
        if (type == "add") {
          //单货道只能购买一个
          if (tp == 0 && gList.length >= 1) {
            my.showToast({
              type: 'exception',
              content: '只能选择一个商品喔！',
              duration: 2000
            });
            return;
          } else {
            item.count++;
            item.count = Math.min(item.count, item.num)
          }
        } else {
          item.count--;
        }
      }
    });

    var totalMoney = 0;
    var totalCount = 0;
    var s = gList.filter((item) => {

      totalCount += item.count;
      let price = item.retailPrice * item.count;
      totalMoney += price;
      return item.count > 0
    })
    this.setData({
      goodsList: goodsList,
      gList: s,
      g_Count: totalCount,
      g_total_money: totalMoney,
      hideCarDetails: s.length > 0 ? false : true
    })
    app.globalData.gList = {
      list: s,
      g_Count: totalCount,
      g_total_money: totalMoney
    };

  },
  //清空购物车
  clearCarDetails() {
    let goodsList = this.data.goodsList;
    goodsList.forEach((item) => {
      item.goodsList.forEach((good) => {
        good.count = 0
      })
    })
    this.setData({
      gList: [],
      goodsList: goodsList,
      hideCarDetails: true,
      g_Count: 0,
      g_total_money: 0
    })
    app.globalData.gList = {};
  },
  toPay() {
    my.navigateTo({
      url: "../submitOrder/submitOrder"
    });
  },
  onShow() {
    let gl = this.data.gList;

    if (app.globalData.gList.list) {
      this.setData({
        gList: app.globalData.gList.list,
        g_Count: app.globalData.gList.g_Count,
        g_total_money: app.globalData.gList.g_total_money
      })
    } else {
      this.setData({
        gList: [],
        g_Count: 0,
        g_total_money: 0
      })
    }
    if (this.data.deviceId) {
      this.queryGoods(this.data.deviceId);

    }

  },
});
