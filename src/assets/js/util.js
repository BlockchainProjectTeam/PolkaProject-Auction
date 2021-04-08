import BigNumber from 'bignumber.js'
const qs = require( 'qs' );

export default{
  // 时间戳转换UTC日期 （秒）
  timestampToDate( timestamp ) {
    if ((timestamp + '').length == 10) {
      timestamp = timestamp * 1000
    }
    var date = new Date(timestamp); //时间戳为10位需*1000
    var Y = date.getUTCFullYear() + '-';
    var M = (date.getUTCMonth() + 1 < 10 ? '0' + (date.getUTCMonth() + 1) : date.getUTCMonth() + 1) + '-';
    var D = (date.getUTCDate() < 10 ? '0' + date.getUTCDate() : date.getUTCDate()) + ' ';
    var h = (date.getUTCHours() < 10 ? '0' + date.getUTCHours() : date.getUTCHours()) + ':';
    var m = (date.getUTCMinutes() < 10 ? '0' + date.getUTCMinutes() : date.getUTCMinutes()) + ':';
    var s = date.getUTCSeconds() < 10 ? '0' + date.getUTCSeconds() : date.getUTCSeconds();
    return Y + M + D + h + m + s +' (+UTC)';
  },
  timestampToTime( timestamp, instance ) {
    if ( timestamp <= 0 ) {
      return '';
    }
    let d = Math.floor( timestamp / 60 / 60 / 24 );
    d = d > 1 ? d + instance.$t('days') : d > 0 ? d + instance.$t('day') : '';
    let h = Math.floor( timestamp / 3600 ) % 24;
    h = h > 1 ? h + instance.$t('hrs') : h > 0 ? h + instance.$t('hr') : '';
    let m = Math.floor( timestamp / 60 ) % 60;
    m = m > 1 ? m + instance.$t('mins'): m > 0 ? m + instance.$t('min'): '';
    let s = timestamp % 60;
    s = s > 0 ? s + instance.$t('s') : '';
    let res= d?(d+h):h?(h+m):m?(m+s):s
    return res
  },

  //axios Post 参数格式化
  qsStringify(param) {
    return qs.stringify(param)
  },

  /**
   * cookie操作
   */
  setCookie(name, value, options) {
    options = options || {};
    if (value === null) {
      value = '';
      options.expires = -1;
    }
    var expires = '';
    if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
      var date;
      if (typeof options.expires == 'number') {
        date = new Date();
        date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
      } else {
        date = options.expires;
      }
      expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
    }
    var path = options.path ? '; path=' + options.path : '';
    var domain = options.domain ? '; domain=' + options.domain : '';
    var s = [cookie, expires, path, domain, secure].join('');
    var secure = options.secure ? '; secure' : '';
    var c = [name, '=', encodeURIComponent(value)].join('');
    var cookie = [c, expires, path, domain, secure].join('')
    document.cookie = cookie;
  },

  getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
      var cookies = document.cookie.split(';');
      for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].trim();
        // Does this cookie string begin with the name we want?
        if (cookie.substring(0, name.length + 1) == (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  },
  //清除所有cookie函数
  clearAllCookie() {
    // 过期时间
    var expire = (new Date(0)).toGMTString()
    var keys = document.cookie.match(/[^ =;]+(?=\=)/g);
    if (keys) {
      for (var i = keys.length - 1; i--;) {
        document.cookie = keys[i] + "=; expire=" + expire + "; path=/";
      }
    }
  },
  setLocalstorage(key, value, expires) {
    var data = { value: value, expires: Date.now() + (expires * 24 * 60 * 60 * 1000) };
    localStorage.setItem(key, JSON.stringify(data));
  },

  getLocalstorage(key) {
    var data = JSON.parse(localStorage.getItem(key));
    if (data !== null) {
      if (data.expires != null && data.expires < Date.now()) {
        localStorage.removeItem(key);
      } else {
        return data.value;
      }
    }
    return null
  },
  // 判断终端
  browserVersions() {
    var u = navigator.userAgent.toLowerCase();
    return {
      android: u.indexOf('android') > -1 || u.indexOf('adr') > -1, //android终端
      iPhone: u.indexOf('iphone') > -1, //是否为iPhone或者QQHD浏览器
      Safari: !!u.match(/version\/([\d.]+).*safari/), //是否为Safari浏览器
      weixin: u.indexOf('micromessenger') > -1, //是否微信
      mdsApp: u.indexOf('mdsapp') > -1, //是否MdsApp
      mdsVer: u.indexOf('mdsapp') > -1 ? u.match(/mdsapp\/[^\s]+\s?/)[0].trim().split('/')[1] : '0' //MdsApp版本
    };
  },
  // 计算指定字符串的字节数
  computeByteSize(str) {
    for (var i = 0, byte = 0; i < str.length; i++) {
      var charCode = str.charCodeAt(i);
      if (0 <= charCode && charCode <= 0x7f) {
        byte += 1;
      } else if (128 <= charCode && charCode <= 0x7ff) {
        byte += 2;
      } else if (2048 <= charCode && charCode <= 0xffff) {
        byte += 3;
      } else if (65536 < charCode && charCode <= 0x1FFFFF) {
        byte += 4;
      } else if (0x200000 < charCode && charCode <= 0x3FFFFFF) {
        byte += 5;
      } else if (0x4000000 < charCode && charCode <= 0x7FFFFFFF) {
        byte += 6;
      }
    }
    return byte
  },
  // 邮箱中间用*替代
  formatEmailByStar(str) {
    if (String(str).indexOf('@') > 0) {
      return String(str).replace(/(\w{1,3})(.+)(@.+)/g, "$1****$3")
    }
    return str
  },
  getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var l = window.location.hash.split('?')[1]
    var r = l ? l.match(reg) : null;

    if (r != null) return decodeURIComponent(r[2]);
    return null;
  },
  formatStrByDot( str, start = 6, end = 3 ) {
    if(String(str).length > 12){
      var reg = new RegExp('(.{' + start + '})(.+)(.{' + end + '})', 'g');
      return String(str).replace(reg, "$1...$3")
    }
    return str;
  },
  // // 根据精度不同千分化数据
  // formatByDecimal(num,decimal,point=4) {
  //   return new BigNumber(num).div(Math.pow(10,decimal)).toFormat(point,1);
  // },
  // // 根据精度不同获取数据
  fixedByDecimal(num,decimal,point=4) {
    return new BigNumber(num).div(Math.pow(10,decimal)).toFixed(point,1);
  },
  // 根据精度不同计算数据 乘法
  timesByDecimal(num,decimal) {
    return new BigNumber(num).times(Math.pow(10,decimal)).toFixed(0);
  },
  formatNumToShort( num, decimal, point = 4 ) {
    num = new BigNumber(num).div(Math.pow(10,decimal)).toNumber();
    if (num >= 1000000) {
      return new BigNumber(num).div(1000000).toFixed(point,1) - 0 + "M";
    } else if (num - 0 >= 1000) {
      return new BigNumber(num).div(1000).toFixed(point,1) - 0 + "k";
    } else {
      return new BigNumber(num).toFixed(point,1) - 0;
    }
  },
  formatNum(num,point=4) {
    return new BigNumber(num).toFormat(point);
  },
  BigNumber(num) {
    return new BigNumber(num)
  },
  // 格式化字符串
  getFormatCode(strValue) {
    return strValue.replace(/\r\n/g, '<br/>').replace(/\n/g, '<br/>').replace(/\s/g, ' ');
  },
}
