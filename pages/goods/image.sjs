var b_url = "https://osstianrenyun.oss-cn-hangzhou.aliyuncs.com/dealer/img/"//正式
//var b_url = "https://osstianrenyun.oss-cn-hangzhou.aliyuncs.com/localTest/img/"//测试
function images(id, randomNum) {
  return b_url + id + '.png?' + randomNum
}


function price(p, p1 = 0) {
  if (p1 >= p) {
    return '0.00'
  } else {
    p = p - p1
    if (p < 0) {
      return '-' + Number(Math.abs(p)).toFixed(2)
    } else {
      return Number(Math.abs(p)).toFixed(2)
    }
  }

}

function time(inputTime) {
  var data = getDate(inputTime);
  var y = data.getFullYear();
  var M = data.getMonth() + 1;
  M = M < 10 ? ('0' + M) : M;
  var d = data.getDate();
  d = d < 10 ? ('0' + d) : d;
  var h = data.getHours();
  h = h < 10 ? ('0' + h) : h;
  var m = data.getMinutes();
  m = m < 10 ? ('0' + m) : m;
  var s = data.getSeconds();
  s = s < 10 ? ('0' + s) : s;
  return y + "-" + M + "-" + d + ' ' + h + ':' + m + ':' + s;
}

export default {
  images: images,
  price: price,
  time: time
};