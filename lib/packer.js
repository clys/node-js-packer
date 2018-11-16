function ICommon(that) {
  if (null != that) {
    // 继承，表示that要从Common继承出来
    that.inherit = Common.prototype.inherit;
    that.specialize = Common.prototype.specialize
  }
  return that
}

// 静态方法
ICommon.specialize = function (p, c) {
  p || (p = {});
  c || (c = p.constructor);
  if (c === {}.constructor) c = new Function("this.inherit()");
  c.valueOf = new Function("return this");
  c.valueOf.prototype = new this.valueOf;
  c.valueOf.prototype.specialize(p);
  c.prototype = new c.valueOf;
  c.valueOf.prototype.constructor = c.prototype.constructor = c;
  // c的祖先就是ICommon
  c.ancestor = this;
  // c.specialize = ICommon.specialize
  c.specialize = arguments.callee;
  c.ancestorOf = this.ancestorOf;
  return c
};

ICommon.valueOf = new Function("return this");

ICommon.valueOf.prototype =
  {
    // 定义constructor为ICommon，也就是new ICommon.valueOf()的时候等于new ICommon
    constructor: ICommon,
    // 继承: 调用，调用函数inherit的函数对象的祖先方法
    // 这里是给specialize处理后的方法进行调用而使用的
    inherit: function () {
      return arguments.callee.caller.ancestor.apply(this, arguments)
    },
    // 返回从thant继承到ICommon.valueOf的对象
    specialize: function (that) {
      if (this === this.constructor.prototype && this.constructor.specialize) {
        return this.constructor.valueOf.prototype.specialize(that)
      }

      for (var i in that) {
        // constructor、toString、valueOf不克隆
        switch (i) {
          case"constructor":
          case"toString":
          case"valueOf":
            continue
        }
        // 方法覆盖前，保留到这个同名方法对象祖先里，这是是个聪明的做法
        if (typeof that[i] === "function" && that[i] !== this[i]) {
          that[i].ancestor = this[i]
        }
        this[i] = that[i]
      }
      // 如果that和this的toString不相同，并且不是Object的toString，就采用前面的方式保留原有的引用
      // 然后再进行继承
      if (that.toString !== this.toString && that.toString !== {}.toString) {
        that.toString.ancestor = this.toString;
        this.toString = that.toString
      }
      return this
    }
  };


function Common() {
}

this.Common = ICommon.specialize(
  {
    constructor: Common,
    toString: function () {
      return "[common " + (this.constructor.className || "Object") + "]"
    },
    // 判断klass和他的祖先链中的对象，是否等于当前对象的constructor
    // 也就是判断是否是同类型
    instanceOf: function (klass) {
      return this.constructor === klass || klass.ancestorOf(this.constructor)
    }
  });

// 定义静态属性
Common.className = "Common";         // 和java类似的className
Common.ancestor = null;             // 另Common的祖先类为空
// 判断klass的祖先链中是否有等于当前类--继承于Common类的
Common.ancestorOf = function (klass) {
  while (klass && klass.ancestor !== this) klass = klass.ancestor;
  return Boolean(klass)
};
// 令Common.valueOf的祖先类为ICommon
Common.valueOf.ancestor = ICommon;

function ParseMaster() {
  var E = 0, R = 1, L = 2;
  var G = /\((?!\?[<]?[:=!])/g, S = /\$\d/, I = /^\$\d+$/, T = /(['"])\1\+(.*)\+\1\1$/, ES = /\\./g, Q = /'/,
    DE = /\x01[^\x01]*\x01/g;
  var self = this;
  this.add = function (e, r) {
    if (!r) r = "";
    var l = (_14(String(e)).match(G) || "").length + 1;
    if (S.test(r)) {
      if (I.test(r)) {
        r = parseInt(r.slice(1)) - 1
      } else {
        var i = l;
        var q = Q.test(_14(r)) ? '"' : "'";
        while (i) r = r.split("$" + i--).join(q + "+a[o+" + i + "]+" + q);
        r = new Function("a,o", "return" + q + r.replace(T, "$1") + q)
      }
    }
    _33(e || "/^$/", r, l)
  };
  this.exec = function (s) {
    _3.length = 0;
    return _30(_5(s, this.escapeChar).replace(new RegExp(_1, this.ignoreCase ? "gi" : "g"), _31), this.escapeChar).replace(DE, "")
  };
  this.reset = function () {
    _1.length = 0
  };
  var _3 = [];
  var _1 = [];
  var _32 = function () {
    return "(" + String(this[E]).slice(1, -1) + ")"
  };
  _1.toString = function () {
    return this.join("|")
  };

  function _33() {
    arguments.toString = _32;
    _1[_1.length] = arguments
  }

  function _31() {
    if (!arguments[0]) return "";
    var i = 1, j = 0, p;
    while (p = _1[j++]) {
      if (arguments[i]) {
        var r = p[R];
        switch (typeof r) {
          case"function":
            return r(arguments, i);
          case"number":
            return arguments[r + i]
        }
        var d = (arguments[i].indexOf(self.escapeChar) === -1) ? "" : "\x01" + arguments[i] + "\x01";
        return d + r
      } else i += p[L]
    }
  }

  function _5(s, e) {
    return e ? s.replace(new RegExp("\\" + e + "(.)", "g"), function (m, c) {
      _3[_3.length] = c;
      return e
    }) : s
  }

  function _30(s, e) {
    var i = 0;
    return e ? s.replace(new RegExp("\\" + e, "g"), function () {
      return e + (_3[i++] || "")
    }) : s
  }

  function _14(s) {
    return s.replace(ES, "")
  }
}


ParseMaster.prototype = {constructor: ParseMaster, ignoreCase: false, escapeChar: ""};

function pack(script, encodeLevel, fastDecode, specialChar) {
  var I = "$1";
  script += "\n";
  encodeLevel = Math.min(parseInt(encodeLevel), 95);

  function runTasks(str) {
    for (var i = 0, len = tasks.length; i < len; i++) {
      str = tasks[i](str)
    }
    return str
  }

  var decoderTpl = function (p, a, c, k, e, d) {
    while (c--) if (k[c]) p = p.replace(new RegExp('\\b' + e(c) + '\\b', 'g'), k[c]);
    return p
  };
  var fastDecoderTpl = function () {
    if (!''.replace(/^/, String)) {
      while (c--) d[e(c)] = k[c] || e(c);
      k = [function (e) {
        return d[e]
      }];
      e = function () {
        return '\\w+'
      };
      c = 1
    }
  };
  var tasks = [];

  function pushTasks(p) {
    tasks[tasks.length] = p
  }

  function cleanScript(s) {
    var p = new ParseMaster;
    p.escapeChar = "\\";
    p.add(/'[^'\n\r]*'/, I);
    p.add(/"[^"\n\r]*"/, I);
    p.add(/\/\/[^\n\r]*[\n\r]/, " ");
    p.add(/\/\*[^*]*\*+([^\/][^*]*\*+)*\//, " ");
    p.add(/\s+(\/[^\/\n\r\*][^\/\n\r]*\/g?i?)/, "$2");
    p.add(/[^\w\x24\/'"*)\?:]\/[^\/\n\r\*][^\/\n\r]*\/g?i?/, I);
    if (specialChar) p.add(/;;;[^\n\r]+[\n\r]/);
    p.add(/\(;;\)/, I);
    p.add(/;+\s*([};])(?!\s*\))/, "$2");
    s = p.exec(s);
    p.add(/(\b|\x24)\s+(\b|\x24)/, "$2 $3");
    p.add(/([+\-])\s+([+\-])/, "$2 $3");
    p.add(/\s+/, "");
    return p.exec(s)
  }

  function transSpecialChar(str) {
    var p = new ParseMaster;
    p.add(/((\x24+)([a-zA-Z_]+))(\d*)/, function (m, o) {
      var l = m[o + 2].length;
      var s = l - Math.max(l - m[o + 3].length, 0);
      return m[o + 1].substr(s, l) + m[o + 4]
    });
    var r = /\b_[A-Za-z\d]\w*/;
    var codeBook = transEncode(str, newRegForG(r), levelSpecial);
    var encode = codeBook.encode;
    p.add(r, function (m, o) {
      return encode[m[o]]
    });
    return p.exec(str)
  }

  function encoding(str) {
    if (encodeLevel > 62) str = highAsciiToHex(str);
    var p = new ParseMaster;
    var encoder = getEncoder(encodeLevel);
    var reg = (encodeLevel > 62) ? /\w\w+/ : /\w+/;
    var codeBook = transEncode(str, newRegForG(reg), encoder);
    p.add(reg, function (m, o) {
      return codeBook.encode[m[o]]
    });
    return str && encoding_packing(p.exec(str), codeBook)
  }

  function transEncode(str, reg, encoder) {
    var words = str.match(reg);
    var sequence = [];
    var encode = {};
    var pass = {};
    if (words) {
      var wordSet = [];
      var position = {};
      var encodeValues = {};
      var count = {};
      var i = words.length, j = 0, word;

      //encoding
      do {
        word = "$" + words[--i];
        if (!count[word]) {
          count[word] = 0;
          wordSet[j] = word;
          position["$" + (encodeValues[j] = encoder(j))] = j++
        }
        count[word]++
      }
      while (i);

      //In the case where the code and the word are the same, the position needs to be the same, otherwise the decoding will be wrong.

      //handle encode is the same as word
      i = wordSet.length;
      do {
        word = wordSet[--i];
        if (position[word] != null) {
          sequence[position[word]] = word.slice(1);
          pass[position[word]] = true;
          count[word] = 0
        }
      }
      while (i);

      //sort by count
      wordSet.sort(function (m1, m2) {
        return count[m2] - count[m1]
      });

      //filling
      j = 0;
      do {
        if (sequence[i] == null) sequence[i] = wordSet[j++].slice(1);
        encode[sequence[i]] = encodeValues[i]
      }
      while (++i < wordSet.length)

    }
    return {'sequence': sequence, 'encode': encode, 'pass': pass}
  }

  function encoding_packing(cipherText, codeBook) {
    var controllerReg = newReg("e\\(c\\)", "g");
    cipherText = "'" + toSingleQuoteStr(cipherText) + "'";
    var codeBookSize = codeBook.sequence.length;
    var level = Math.min(codeBookSize, encodeLevel) || 1;
    for (var i in codeBook.pass) codeBook.sequence[i] = "";
    codeBook = "'" + codeBook.sequence.join("|") + "'.split('|')";
    var encoder = encodeLevel > 62 ? level95 : getEncoder(level);
    encoder = String(encoder).replace(/encodeLevel/g, "a").replace(/arguments\.callee/g, "e");
    var lowController = "c" + (level > 10 ? ".toString(a)" : "");
    var decoder = String(decoderTpl);
    if (fastDecode) {
      var fDecoder = fnToString(fastDecoderTpl);
      if (encodeLevel > 62) fDecoder = fDecoder.replace(/\\\\w/g, "[\\xa1-\\xff]");
      else if (level < 36) fDecoder = fDecoder.replace(controllerReg, lowController);
      if (!codeBookSize) fDecoder = fDecoder.replace(newReg("(c)\\s*=\\s*1"), "$1=0");
      decoder = decoder.replace(/\{/, "{" + fDecoder + ";");
    }
    decoder = decoder.replace(/"/g, "'");
    if (encodeLevel > 62) {
      decoder = decoder.replace(/'\\\\b'\s*\+|\+\s*'\\\\b'/g, "")
    }
    if (level > 36 || encodeLevel > 62 || fastDecode) {
      decoder = decoder.replace(/\{/, "{e=" + encoder + ";")
    } else {
      decoder = decoder.replace(controllerReg, lowController)
    }
    decoder = pack(decoder, 0, false, true);
    cipherText = [cipherText, level, codeBookSize, codeBook];
    if (fastDecode) {
      cipherText = cipherText.concat(0, "{}")
    }
    return "eval(" + decoder + "(" + cipherText + "))\n"
  }

  function getEncoder(level) {
    return level > 10 ? level > 36 ? level > 62 ? level95 : level62 : level36 : level10
  }

  var level10 = function (c) {
    return c
  };
  var level36 = function (c) {
    return c.toString(36);
  };
  var level62 = function (c) {
    return (c < encodeLevel ? '' : arguments.callee(parseInt(c / encodeLevel))) + ((c = c % encodeLevel) > 35 ? String.fromCharCode(c + 29) : c.toString(36))
  };
  var level95 = function (c) {
    return (c < encodeLevel ? '' : arguments.callee(c / encodeLevel)) + String.fromCharCode(c % encodeLevel + 161)
  };
  var levelSpecial = function (c) {
    return "_" + c
  };

  function toSingleQuoteStr(s) {
    return s.replace(/([\\'])/g, "\\$1")
  }

  function highAsciiToHex(str) {
    return str.replace(/[\xa1-\xff]/g, function (m) {
      return "\\x" + m.charCodeAt(0).toString(16)
    })
  }

  function newReg(s, f) {
    return new RegExp(s.replace(/\$/g, "\\$"), f)
  }

  function fnToString(f) {
    with (String(f)) return slice(indexOf("{") + 1, lastIndexOf("}"))
  }

  function newRegForG(reg) {
    return new RegExp(String(reg).slice(1, -1), "g")
  }

  pushTasks(cleanScript);
  if (specialChar) pushTasks(transSpecialChar);
  if (encodeLevel) pushTasks(encoding);
  return runTasks(script)
}

module.exports = pack;
