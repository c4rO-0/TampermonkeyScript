// ==UserScript==
// @name         导出QQ音乐歌单
// @namespace    http://tampermonkey.net/
// @version      0.2
// @license      MPL-2.0
// @description  导出并保存QQ音乐歌单
// @author       c4r
// @match        *://y.qq.com/*
// @grant        none
// @require      https://code.jquery.com/jquery-latest.js
// ==/UserScript==

/**
 * QQ 歌单导出失败, 因为无法在网页上查看全部歌单, 已经歌单里的全部歌曲
 */

(function () {
    'use strict';

    /*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js */
    var saveAs = saveAs || function (e) { "use strict"; if (typeof e === "undefined" || typeof navigator !== "undefined" && /MSIE [1-9]\./.test(navigator.userAgent)) { return } var t = e.document, n = function () { return e.URL || e.webkitURL || e }, r = t.createElementNS("http://www.w3.org/1999/xhtml", "a"), o = "download" in r, a = function (e) { var t = new MouseEvent("click"); e.dispatchEvent(t) }, i = /constructor/i.test(e.HTMLElement) || e.safari, f = /CriOS\/[\d]+/.test(navigator.userAgent), u = function (t) { (e.setImmediate || e.setTimeout)(function () { throw t }, 0) }, s = "application/octet-stream", d = 1e3 * 40, c = function (e) { var t = function () { if (typeof e === "string") { n().revokeObjectURL(e) } else { e.remove() } }; setTimeout(t, d) }, l = function (e, t, n) { t = [].concat(t); var r = t.length; while (r--) { var o = e["on" + t[r]]; if (typeof o === "function") { try { o.call(e, n || e) } catch (a) { u(a) } } } }, p = function (e) { if (/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(e.type)) { return new Blob([String.fromCharCode(65279), e], { type: e.type }) } return e }, v = function (t, u, d) { if (!d) { t = p(t) } var v = this, w = t.type, m = w === s, y, h = function () { l(v, "writestart progress write writeend".split(" ")) }, S = function () { if ((f || m && i) && e.FileReader) { var r = new FileReader; r.onloadend = function () { var t = f ? r.result : r.result.replace(/^data:[^;]*;/, "data:attachment/file;"); var n = e.open(t, "_blank"); if (!n) e.location.href = t; t = undefined; v.readyState = v.DONE; h() }; r.readAsDataURL(t); v.readyState = v.INIT; return } if (!y) { y = n().createObjectURL(t) } if (m) { e.location.href = y } else { var o = e.open(y, "_blank"); if (!o) { e.location.href = y } } v.readyState = v.DONE; h(); c(y) }; v.readyState = v.INIT; if (o) { y = n().createObjectURL(t); setTimeout(function () { r.href = y; r.download = u; a(r); h(); c(y); v.readyState = v.DONE }); return } S() }, w = v.prototype, m = function (e, t, n) { return new v(e, t || e.name || "download", n) }; if (typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob) { return function (e, t, n) { t = t || e.name || "download"; if (!n) { e = p(e) } return navigator.msSaveOrOpenBlob(e, t) } } w.abort = function () { }; w.readyState = w.INIT = 0; w.WRITING = 1; w.DONE = 2; w.error = w.onwritestart = w.onprogress = w.onwrite = w.onabort = w.onerror = w.onwriteend = null; return m }(typeof self !== "undefined" && self || typeof window !== "undefined" && window || this.content); if (typeof module !== "undefined" && module.exports) { module.exports.saveAs = saveAs } else if (typeof define !== "undefined" && define !== null && define.amd !== null) { define("FileSaver.js", function () { return saveAs }) }


    let songList = new Object()

    function getList() {
        let objMusicList = $(".songlist__list > li");

        // console.log("obtain list...")
        $(objMusicList).each((index, element) => {
            // if (index == 0) {
            // 单个歌曲element, 抓取信息
            // 未完

            let strSongName = $(element).find("span.songlist__songname_txt a").attr('title')

            let strAuther = $(element).find("div.songlist__artist a").attr("title")

            if (songList.hasOwnProperty(strSongName)) {

            } else {
                songList[strSongName] = strAuther
                console.log(strSongName, strAuther)
            }

            


            // }
        });

        // console.log(songList)
    }

    function checkElementI() {
        console.log("check element 1...", window.i, $(".songlist__list > li").length)

        window.i =  'qrHref'
        if (window.i == 'qrHref') {
            getList()
        }
        if (window.i === undefined || window.i == 'qrHref') {
            setTimeout(() => { checkElementI(); }, 100);
            return;
        }
    }


    function checkElementII(callback) {
        console.log("check element...")

        // window.i =  'qrHref'
        // if(window.i == 'qrHref'){
        //     getList()
        // }
        let checkPlaylist = $(".songlist__list > li").toArray().length;
        let checkInsertAnchorI = $('div.data__actions[role="toolbar"], div.mod_songlist_toolbar').length; 
        let checkInsertAnchor = checkInsertAnchorI;
        let test = checkPlaylist == 0 || checkInsertAnchor == 0;
        if (test && count < limit) {
            setTimeout(() => { checkElementII(callback); }, 2000);
            count++;
            return;
        } else if (count < limit) {
            callback();
        }
    }



    let insertButton = function () {
        console.log("insertting...");

        let strButton =
            "<a id='c4r-exportPlaylist' class='mod_btn_green'>导出歌单</a>"
        // console.log($("#g_iframe").contents().find("#playlist-track-count"));
        // $(strButton).insertBefore($("div.collect-handler div.select"))

        // 正常歌单页
        if($('div.data__actions[role="toolbar"]').length > 0){
            $('div.data__actions[role="toolbar"]').append(strButton)
        }

        // 我的音乐
        if($('div.mod_songlist_toolbar').length > 0){
            $('div.mod_songlist_toolbar').append(strButton)
        }        
        
        $("#c4r-exportPlaylist").on("click", savePlaylist);
    }


    function savePlaylist() {

        let str_store = "";

        console.log("obtain list...", songList)

        for (let strSongName in songList) {
            
            let strAuther = songList[strSongName];
            console.log(strSongName, strAuther)
            str_store = str_store + strSongName + " - " + strAuther + "\r\n";
        }


        //console.log(str_store);

        var blob = new Blob([str_store], { type: "text/plain;charset=utf-8" });

        // var namePlaylist = $.trim($("div.info_collect_main div.collect-user-item").text());
        // let strTitle = $("div.collect-info div[data-spm-anchor-id]").text()
        // let namePlaylist = $.trim(strTitle.substr(1, strTitle.lastIndexOf("》") - 1))
        let namePlaylist = $("#p_name_show").attr('title')
        // if (namePlaylist == "") {
        //     namePlaylist = $("#g_iframe").contents().find("h2.f-ff2.f-thide").text();

        // }
        // console.log(namePlaylist)
        saveAs(blob, namePlaylist + ".txt");
    }

    // if (window.top != window.self)  //-- Don't run on frames or iframes
    //     return;
    let count = 0, limit = 10;



    console.log("ready to run ")

    checkElementI()

    checkElementII(insertButton);

})();