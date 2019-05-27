// ==UserScript==
// @name         画中画
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       c4r
// @match        https://www.bilibili.com/video/*
// @match        https://www.bilibili.com/bangumi/*
// @match        https://live.bilibili.com/*
// @match        https://www.mgtv.com/b/*
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...
    //玩法：修改第二层div.c4r的类，可改的类名包括（.initial .success .error .processing .surprise .hide .fade），其中.inital和.success需要保证有且仅有一个存在。
    GM_addStyle (`
.processing {
  animation: rotate 2s infinite linear;
}
@keyframes rotate {
  from {
    transform:rotate(0deg);
  }
  to {
    transform:rotate(360deg);
  }
}
.initial {
  background-color: #cacaca;
  height:20px;
  width:20px;
  top:-4px;
  right:-24px;
  border-radius:10px;
}
.success {
  background-color: #ffffff;
  height:20px;
  width:20px;
  top:-4px;
  right:-24px;
  border-radius:10px;
}
.error {
  background-color: #fd676f;
}
.surprise, .c4r:hover {
  transform: scale(2) translate(-7px,7px);
}
.c4r {
  transition: opacity 0.25s ease, transform 0.3s ease;
}
.hide{
  opacity: 0;
}
.fade, .c4r:hover {
  animation: fade 1s 0.3s forwards;
}
@keyframes fade {
  25% {
    opacity: 0.25;
  }
  50% {
    opacity: 1;
  }
  75% {
    opacity: 0.25;
  }
  100% {
    opacity: 1;
  }
}
.coin {
  fill: #1890ff;
}
.c4r.initial .c4r-logo,
.c4r.success .coin{
  display:;
}
.c4r.initial .coin,
.c4r.success .c4r-logo{
  display: none;
}
`)
    document.getElementById('bilibiliPlayer').insertAdjacentHTML('beforeend','<div id="c4r-oxgs73w7rh" style="height: 40px;width: 40px;position: absolute;overflow: hidden;top: 0px;right: 0px;cursor: pointer;z-index: 999">\
<div class="c4r initial" style="position: relative;">\
<svg class="c4r-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 162.65 162.65"><path d="M102.74,20.66C67.1,13.31,7,103.51,31.89,108.3c13.7,2.65,24.31-4.73,33.83-6.17l13,.31a1.1,1.1,0,0,1,1.43.57,1.08,1.08,0,0,1-.57,1.43c-11,10.93-6.16,8.84-19.75,13-30.17,9.27-57.47,3.07-43.47-33.52C27.2,55.58,71.12,5,105.59,12.2a4.46,4.46,0,1,1-2.85,8.46Z" style="fill:#414042;fill-rule:evenodd"/><path d="M88.73,71.39a74.35,74.35,0,0,1,9.86,22.25c9.45-11.26,23-18.66,35.69-5.72a3.28,3.28,0,0,1-4.22,5c-12.77-4.54-18.35-1.41-26.57,10.46a41.16,41.16,0,0,0-2.9,5.13c.22,8.56-.94,17.53-2.93,27.55-.71,3.53-4.87,24.87-13.45,16.15-6.79-6.9,2.87-39.31,6.21-46,.19-.39.4-.78.6-1.18C90.49,94,88.23,83.34,83.59,75.51a3.28,3.28,0,0,1,5.14-4.07Zm-3.29,73.12a2.36,2.36,0,0,0-.62.85C85.29,144.85,85.3,144.89,85.44,144.51Z" style="fill:#414042;fill-rule:evenodd"/></svg>\
<svg class="coin" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28"><path d="M14.89 8.664h3.276c.541 0 .979-.4.979-.892s-.438-.892-.979-.892H9.681c-.541 0-.979.4-.979.892s.438.892.979.892h3.425v1.637a5.64 5.64 0 0 0-5.355 5.616v1.19a.892.892 0 1 0 1.784.001v-1.19a3.855 3.855 0 0 1 3.57-3.831v8.329a.892.892 0 0 0 1.784 0v-8.329a3.855 3.855 0 0 1 3.57 3.831v1.19a.892.892 0 0 0 1.784 0v-1.19a5.64 5.64 0 0 0-5.355-5.616V8.664zM14 26C7.373 26 2 20.627 2 14S7.373 2 14 2s12 5.373 12 12a12.002 12.002 0 0 1-12 12z"/></svg>\
</div>\
</div>')
    document.getElementById('c4r-oxgs73w7rh').addEventListener("click", ()=>{
        document.getElementsByTagName('video')[0].requestPictureInPicture();
    })
})();