// ==UserScript==
// @name         知乎站外链接跳转
// @namespace    
// @version      0.1
// @description  在知乎站外链接的警告页面添加跳转按钮, 省去复制粘贴的麻烦.
// @author       c4r
// @match        *://link.zhihu.com/?target=*
// @grant        none
// @require      https://code.jquery.com/jquery-latest.js
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...
    let obj=$("p.link");
    let url=$(obj).text();
    // $(obj).attr("href",url);
    let objButton=$("div.content");
    $(objButton).append( "<a class=\"link-button js-show-tip\" href=\"" +url+ "\">点击跳转</a>" );
})();