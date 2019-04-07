// ==UserScript==
// @name         导出网易云音乐歌单
// @namespace    http://tampermonkey.net/
// @version      0.5
// @license      MPL-2.0
// @description  导出并保存网易云音乐歌单
// @author       c4r
// @match        *://music.163.com/*
// @grant        none
// @require      https://code.jquery.com/jquery-latest.js
// ==/UserScript==

(function () {
    'use strict';

    /*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js */
    var saveAs = saveAs || function (e) { "use strict"; if (typeof e === "undefined" || typeof navigator !== "undefined" && /MSIE [1-9]\./.test(navigator.userAgent)) { return } var t = e.document, n = function () { return e.URL || e.webkitURL || e }, r = t.createElementNS("http://www.w3.org/1999/xhtml", "a"), o = "download" in r, a = function (e) { var t = new MouseEvent("click"); e.dispatchEvent(t) }, i = /constructor/i.test(e.HTMLElement) || e.safari, f = /CriOS\/[\d]+/.test(navigator.userAgent), u = function (t) { (e.setImmediate || e.setTimeout)(function () { throw t }, 0) }, s = "application/octet-stream", d = 1e3 * 40, c = function (e) { var t = function () { if (typeof e === "string") { n().revokeObjectURL(e) } else { e.remove() } }; setTimeout(t, d) }, l = function (e, t, n) { t = [].concat(t); var r = t.length; while (r--) { var o = e["on" + t[r]]; if (typeof o === "function") { try { o.call(e, n || e) } catch (a) { u(a) } } } }, p = function (e) { if (/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(e.type)) { return new Blob([String.fromCharCode(65279), e], { type: e.type }) } return e }, v = function (t, u, d) { if (!d) { t = p(t) } var v = this, w = t.type, m = w === s, y, h = function () { l(v, "writestart progress write writeend".split(" ")) }, S = function () { if ((f || m && i) && e.FileReader) { var r = new FileReader; r.onloadend = function () { var t = f ? r.result : r.result.replace(/^data:[^;]*;/, "data:attachment/file;"); var n = e.open(t, "_blank"); if (!n) e.location.href = t; t = undefined; v.readyState = v.DONE; h() }; r.readAsDataURL(t); v.readyState = v.INIT; return } if (!y) { y = n().createObjectURL(t) } if (m) { e.location.href = y } else { var o = e.open(y, "_blank"); if (!o) { e.location.href = y } } v.readyState = v.DONE; h(); c(y) }; v.readyState = v.INIT; if (o) { y = n().createObjectURL(t); setTimeout(function () { r.href = y; r.download = u; a(r); h(); c(y); v.readyState = v.DONE }); return } S() }, w = v.prototype, m = function (e, t, n) { return new v(e, t || e.name || "download", n) }; if (typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob) { return function (e, t, n) { t = t || e.name || "download"; if (!n) { e = p(e) } return navigator.msSaveOrOpenBlob(e, t) } } w.abort = function () { }; w.readyState = w.INIT = 0; w.WRITING = 1; w.DONE = 2; w.error = w.onwritestart = w.onprogress = w.onwrite = w.onabort = w.onerror = w.onwriteend = null; return m }(typeof self !== "undefined" && self || typeof window !== "undefined" && window || this.content); if (typeof module !== "undefined" && module.exports) { module.exports.saveAs = saveAs } else if (typeof define !== "undefined" && define !== null && define.amd !== null) { define("FileSaver.js", function () { return saveAs }) }


    function checkElementII(callback) {
        let checkPlaylist = $("#g_iframe").contents().find("tr").toArray().length;
        let checkInsertAnchorI = $("#g_iframe").contents().find("#playlist-track-count").length;
        let checkInsertAnchorII = $("#g_iframe").contents().find("#flag_trackCount").length;
        let checkInsertAnchor = checkInsertAnchorI + checkInsertAnchorII;
        let test = checkPlaylist == 0 || checkInsertAnchor == 0;
        if (test && count < limit) {
            setTimeout(() => { checkElementII(callback); }, 2000);
            count++;
            return;
        } else if (count < limit) {
            callback();
        }
    }

    function insertButton() {
        // console.log("insertting...");
        // console.log($("#g_iframe").contents().find("#playlist-track-count"));
        $("#g_iframe").contents().find("#playlist-track-count").parent().after("<a id='c4r-exportPlaylist' class='u-btni u-btni-dl' style='margin-left:20px'><i>导出歌单</i></a>");
        $("#g_iframe").contents().find("#flag_trackCount").parent().after("<a id='c4r-exportPlaylist' class='u-btni u-btni-dl' style='margin-left:20px'><i>导出歌单</i></a>");
        $("#g_iframe").contents().find("#c4r-exportPlaylist").on("click", savePlaylist);
    }


    function savePlaylist() {

        let str_store = "";
        let objMusicList = $("#g_iframe").contents().find("tr");

        $(objMusicList).each((index, element) => {
            if (index >= 1) {
                let objAuther = $(element).find("td").toArray()[3];

                //console.log($(element).find("b").attr("title")+" - "+$(objAuther).find("div").attr("title"));
                str_store = str_store + $(element).find("b").attr("title") + " - " + $(objAuther).find("div").attr("title") + "\r\n";
            }

            // list_Music.push(music($(element).find("b").attr("title"), $(objAuther).find("div").attr("title")));
        });


        //console.log(str_store);

        var blob = new Blob([str_store], { type: "text/plain;charset=utf-8" });

        var namePlaylist = $("#g_iframe").contents().find("h2.f-ff2.f-brk").text();
        if (namePlaylist == "") {
            namePlaylist = $("#g_iframe").contents().find("h2.f-ff2.f-thide").text();

        }

        saveAs(blob, namePlaylist + ".txt");
    }

    if (window.top != window.self)  //-- Don't run on frames or iframes
        return;
    let count = 0, limit = 10;

    checkElementII(insertButton);

})();