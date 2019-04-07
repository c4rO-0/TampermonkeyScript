// ==UserScript==
// @name         导出千千音乐歌单
// @namespace    http://tampermonkey.net/
// @version      0.1
// @license      MPL-2.0
// @description  导出并保存千千音乐歌单
// @author       c4r
// @match        *://music.taihe.com/*
// @grant        none
// @require      https://code.jquery.com/jquery-latest.js
// ==/UserScript==

(function () {
    'use strict';

    /*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js */
    var saveAs = saveAs || function (e) { "use strict"; if (typeof e === "undefined" || typeof navigator !== "undefined" && /MSIE [1-9]\./.test(navigator.userAgent)) { return } var t = e.document, n = function () { return e.URL || e.webkitURL || e }, r = t.createElementNS("http://www.w3.org/1999/xhtml", "a"), o = "download" in r, a = function (e) { var t = new MouseEvent("click"); e.dispatchEvent(t) }, i = /constructor/i.test(e.HTMLElement) || e.safari, f = /CriOS\/[\d]+/.test(navigator.userAgent), u = function (t) { (e.setImmediate || e.setTimeout)(function () { throw t }, 0) }, s = "application/octet-stream", d = 1e3 * 40, c = function (e) { var t = function () { if (typeof e === "string") { n().revokeObjectURL(e) } else { e.remove() } }; setTimeout(t, d) }, l = function (e, t, n) { t = [].concat(t); var r = t.length; while (r--) { var o = e["on" + t[r]]; if (typeof o === "function") { try { o.call(e, n || e) } catch (a) { u(a) } } } }, p = function (e) { if (/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(e.type)) { return new Blob([String.fromCharCode(65279), e], { type: e.type }) } return e }, v = function (t, u, d) { if (!d) { t = p(t) } var v = this, w = t.type, m = w === s, y, h = function () { l(v, "writestart progress write writeend".split(" ")) }, S = function () { if ((f || m && i) && e.FileReader) { var r = new FileReader; r.onloadend = function () { var t = f ? r.result : r.result.replace(/^data:[^;]*;/, "data:attachment/file;"); var n = e.open(t, "_blank"); if (!n) e.location.href = t; t = undefined; v.readyState = v.DONE; h() }; r.readAsDataURL(t); v.readyState = v.INIT; return } if (!y) { y = n().createObjectURL(t) } if (m) { e.location.href = y } else { var o = e.open(y, "_blank"); if (!o) { e.location.href = y } } v.readyState = v.DONE; h(); c(y) }; v.readyState = v.INIT; if (o) { y = n().createObjectURL(t); setTimeout(function () { r.href = y; r.download = u; a(r); h(); c(y); v.readyState = v.DONE }); return } S() }, w = v.prototype, m = function (e, t, n) { return new v(e, t || e.name || "download", n) }; if (typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob) { return function (e, t, n) { t = t || e.name || "download"; if (!n) { e = p(e) } return navigator.msSaveOrOpenBlob(e, t) } } w.abort = function () { }; w.readyState = w.INIT = 0; w.WRITING = 1; w.DONE = 2; w.error = w.onwritestart = w.onprogress = w.onwrite = w.onabort = w.onerror = w.onwriteend = null; return m }(typeof self !== "undefined" && self || typeof window !== "undefined" && window || this.content); if (typeof module !== "undefined" && module.exports) { module.exports.saveAs = saveAs } else if (typeof define !== "undefined" && define !== null && define.amd !== null) { define("FileSaver.js", function () { return saveAs }) }

    class Mexporter {
        constructor() {

            let lastPage = localStorage.getItem("lastPage");
            if (lastPage == undefined || lastPage == null  || lastPage == '' || parseInt(lastPage) <= 0) {
                this.lastPage = undefined
            } else {
                this.lastPage = parseInt(lastPage)
            }

            let strStore = localStorage.getItem("strStore");
            if (strStore == undefined || strStore == null || strStore == '') {
                this.strStore = ''
            } else {
                this.strStore = strStore
            }

            let listID = localStorage.getItem("listID");
            if (listID == undefined || listID == null || listID == '') {
                this.listID = undefined
            } else {
                this.listID = listID
            }

            let exporting = localStorage.getItem("exporting");
            if (exporting == undefined || exporting == null || exporting == '' || exporting === 'false') {
                this.exporting = false
            } else {
                this.exporting = true
            }

            if (this.lastPage === undefined
                || this.listID === undefined
                || this.exporting === false
                || $('div.songlist-info-box[data-songlistid]').attr('data-songlistid') != this.listID) {

                this.exporting = false
                this.strStore = ''
                this.lastPage = undefined
                this.listID = undefined

            } else {
                this.exporting = true
            }

        }

        saveMexporter() {
            localStorage.setItem('lastPage', this.lastPage)
            localStorage.setItem('strStore', this.strStore)
            localStorage.setItem('listID', this.listID)
            localStorage.setItem('exporting', this.exporting)
        }

        update() {
            console.log('updating....')
            let str_store = "";
            let objMusicList = $("li.songlist-item.clearfix");

            // console.log("obtain list...")
            $(objMusicList).each((index, element) => {


                let strSongName = $(element).find("a.songlist-songname.namelink").attr('title')

                let strAuther = $(element).find("span.singer > a:eq(0)").attr('title') // 多个歌手用,链接

                // console.log(strSongName + " - " + strAuther)
                str_store = str_store + strSongName + " - " + strAuther + "\r\n";

            });



            this.strStore = this.strStore + str_store

            // console.log(this.strStore)

            this.lastPage = parseInt($('span.page-navigator-current').text())

            this.listID = $('div.songlist-info-box[data-songlistid]').attr('data-songlistid')


            console.log('end update ....', this.lastPage,  this.listID )
        }
        /**
         * 
         * @param {String} namePlaylist 文件名, 歌单标题
         */
        export2Text(namePlaylist){
            var blob = new Blob([this.strStore], { type: "text/plain;charset=utf-8" });

            saveAs(blob, namePlaylist + ".txt");
        }

        reset(){
            this.lastPage = -1
            this.listID = ''
            this.strStore = ''
            this.exporting = false

            this.saveMexporter()
        }

        print(){
            console.log('===============exporter info==================')
            console.log('ID : ', this.listID)
            console.log('lastPage : ', this.lastPage)
            console.log('exporting : ', this.exporting)
            console.log('----------str--------')
            console.log(this.strStore)
            console.log('---------------------')
        }

    }

    /**
     * 判断当前是否为最后一页
     * @returns {undefined} 没有找到页码
     * @returns {boolean}
     */
    function isLastPage() {

        if ($('span.page-navigator-next-disable').length > 0 ) {
            return true
        }else if($('a.page-navigator-next').length > 0 ){
            return false
        } else {
            return undefined
        }

    }
    /**
     * 判断当前是否为第一页
     * @returns {undefined} 没有找到页码
     * @returns {boolean}
     */
    function isFirstPage() {

        if ($('span.page-navigator-prev-disable').length > 0 ) {
            return true
        }else if($('a.page-navigator-prev').length > 0 ){
            return false
        } else {
            return undefined
        }

    }    

    /**
     * 去往下一页
     */
    function nextPage() {
        $('a.page-navigator-next')[0].click()
    }

    function checkElementII(callback) {


        let checkPlaylist = window.$addTo === undefined || window.$addTo.length == 0;
        let checkInsertAnchor = $("ul.col-btns.fl").length == 0;


        let test = checkPlaylist || checkInsertAnchor;
        if (test && count < limit) {
            setTimeout(() => { checkElementII(callback); }, 2000);
            count++;
            return;
        } else if (count < limit) {
            callback();
        }
    }

    function titleList(){
        return window.title
    }

    let insertButton = function () {
        console.log("insertting...");

        // console.log($("#g_iframe").contents().find("#playlist-track-count"));
        
        

        let exporter = new Mexporter()
        console.log('exporting : ', exporter.exporting, '1st : ', isFirstPage(), 'end : ', isLastPage() )
        if(exporter.exporting ){
            let strButton = '\
            <li id="c4r-exportPlaylist" class="col-play">\
                <a class="btn-play">\
                    <span>导出中...</span>\
                </a>\
            </li>'
            $("ul.col-btns.fl").append(strButton)


            exporter.update()

            if(isLastPage()){

                $('#c4r-exportPlaylist > a').text('导出完成')
                $('#c4r-exportPlaylist > a').attr('href', "/songlist/"+ $('div.songlist-info-box[data-songlistid]').attr('data-songlistid'))
                
                exporter.export2Text(titleList())
                exporter.reset()
            }else{

                exporter.saveMexporter()
                nextPage()
            }
        }else{
            if(isFirstPage()){
                let strButton = '\
                <li id="c4r-exportPlaylist" class="col-play">\
                    <a class="btn-play">\
                        <span>导出歌单</span>\
                    </a>\
                </li>'
                $("ul.col-btns.fl").append(strButton)
                $("#c4r-exportPlaylist").on("click", savePlaylist);
            }else{
                let strButton = '\
                <li id="c4r-exportPlaylist" class="col-play">\
                    <a class="btn-play" href="/songlist/'+ $('div.songlist-info-box[data-songlistid]').attr('data-songlistid') +'">\
                        <span>回到第一页</span>\
                    </a>\
                </li>'
                $("ul.col-btns.fl").append(strButton)
            }
        }
    }


    function savePlaylist() {

        console.log('saving.....')
        let exporter = new Mexporter()
        
        exporter.update()

        if(isLastPage()){
            exporter.export2Text(titleList())
            exporter.reset()
        }else{
            exporter.exporting = true
            exporter.saveMexporter()
            nextPage()
        }

    }

    // if (window.top != window.self)  //-- Don't run on frames or iframes
    //     return;
    let count = 0, limit = 10;

    console.log("ready to run ")

    checkElementII(insertButton);


})();