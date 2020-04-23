!function(t,n){"object"==typeof exports&&"object"==typeof module?module.exports=n():"function"==typeof define&&define.amd?define([],n):"object"==typeof exports?exports["network-cidr"]=n():t["network-cidr"]=n()}(global,(function(){return function(t){var n={};function i(e){if(n[e])return n[e].exports;var o=n[e]={i:e,l:!1,exports:{}};return t[e].call(o.exports,o,o.exports,i),o.l=!0,o.exports}return i.m=t,i.c=n,i.d=function(t,n,e){i.o(t,n)||Object.defineProperty(t,n,{enumerable:!0,get:e})},i.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},i.t=function(t,n){if(1&n&&(t=i(t)),8&n)return t;if(4&n&&"object"==typeof t&&t&&t.__esModule)return t;var e=Object.create(null);if(i.r(e),Object.defineProperty(e,"default",{enumerable:!0,value:t}),2&n&&"string"!=typeof t)for(var o in t)i.d(e,o,function(n){return t[n]}.bind(null,o));return e},i.n=function(t){var n=t&&t.__esModule?function(){return t.default}:function(){return t};return i.d(n,"a",n),n},i.o=function(t,n){return Object.prototype.hasOwnProperty.call(t,n)},i.p="",i(i.s=0)}([function(t,n,i){"use strict";i.r(n);class e{constructor(t,n){if(!t||"string"!=typeof t)throw new Error('invalid "net" parameter');if(!n){const i=t.split("/",2);if(t=i[0],!(n=i[1])&&(!(n=8*t.split(".").filter(t=>!!+t).length)||n>32))throw new Error("invalid network address: "+t)}if("string"==typeof n&&n.indexOf(".")>-1){this.maskLong=e.ipToLong(n);for(let t=32;t>=0;t--)if(this.maskLong===4294967295<<32-t>>>0){this.bitmask=t;break}}else{if(!n)throw new Error("invalid mask: empty");this.bitmask=parseInt(n,10),this.bitmask>0&&(this.maskLong=4294967295<<32-this.bitmask>>>0)}if(this.netLong=(e.ipToLong(t)&this.maskLong)>>>0,!(this.bitmask>=1&&this.bitmask<=32))throw new Error("invalid mask: "+n);this.size=Math.pow(2,32-this.bitmask),this.hosts=this.size>=2?this.size-2:1,this.base=e.longToIp(this.netLong),this.mask=e.longToIp(this.maskLong),this.hostmask=e.longToIp(~this.maskLong),this.first=this.bitmask<=30?e.longToIp(this.netLong+1):this.base,this.last=this.bitmask<=30?e.longToIp(this.netLong+this.size-2):e.longToIp(this.netLong+this.size-1),this.broadcast=e.longToIp(this.netLong+this.size-1)}contains(t){return"string"==typeof t&&(t.indexOf("/")>0||4!==t.split(".").length)&&(t=new e(t)),t instanceof e?this.contains(t.base)&&this.contains(t.broadcast||t.last):(e.ipToLong(t)&this.maskLong)>>>0==(this.netLong&this.maskLong)>>>0}forEach(t){let n=e.ipToLong(this.first),i=0;for(;n<=e.ipToLong(this.last);n++,i++)t(e.longToIp(n),i,this)}static longToIp(t){return[(t&255<<24)>>>24,(t&255<<16)>>>16,(65280&t)>>>8,255&t].join(".")}static ipToLong(t){const n=(t+"").split(".");if(0===n.length||n.length>4)throw new Error("invalid ip");for(let t=0;t<n.length;t++){const i=+n[t];if(i!=i||i<0||i>255)throw new Error("invalid byte: "+i)}return((n[0]||0)<<24|(n[1]||0)<<16|(n[2]||0)<<8|(n[3]||0))>>>0}toString(){return this.base+"/"+this.bitmask}toJSON(){return{...this}}[Symbol.iterator](){const t=this.netLong,n=e.ipToLong(this.last);return{index:t,value:e.longToIp(t),get done(){return!(this.index<=n)},next(){return this.index++,this.value=e.longToIp(this.index),this}}}[Symbol.toPrimitive](t){return"string"===t?this.toString():"number"===t?+this.hosts:"boolean"===t?!!this:this.toString()}get[Symbol.toStringTag](){return this.constructor.name}static[Symbol.hasInstance](t){return"NetworkCidr"===t.constructor.name}}n.default=e}])}));