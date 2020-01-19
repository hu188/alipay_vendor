//mothod 1：post，0：get
function http(url, data, mothod) {
   my.showLoading({
      content: '加载中...'
    });
  return new Promise(function(resolve, reject) {
    my.request({
      url: url,
      method: mothod == 1 ? 'POST' : 'GET',
      data: data,
      dataType: 'json',
      success: function(res) {
        const {  data, code } = res.data
        if (code == 0) {
          resolve(data)
        } else {
          my.showToast({
            type: 'exception',
            content: '请求异常',
            duration: 3000
          });
          resolve(res.data)
        }
        my.hideLoading();
      },
      fail: function(res) {
        reject(res);
        my.hideLoading();
      },

    });
  })
}
module.exports = {
  http: http
}