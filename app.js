App({
  onLaunch(options) {
    
  },
  onShow(options) {
    var randomNum = Math.random()
    this.globalData.randomNum = randomNum;
  },
  globalData:{
    userInfo:{},//用户信息
    cusId:'',
    base_url:'https://www.tianrenyun.com/',
    id: '',//小程序keypoolid
    sign:'',//设备编号
    tp:"",//0单货道，1多货道
    sessionId:'',
    type:'',
    hasUserInfo:"",//是否授权
    deviceName:"",
    deviceId:"",
    classify:"",//设备类型
    randomNum:"",//图片后缀随机数
    gList:{},//购物车商品
    orderTimes:'',
  }
});
