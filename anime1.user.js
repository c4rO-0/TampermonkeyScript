// ==UserScript==
// @name         anime1.me收藏番剧
// @namespace    http://tampermonkey.net/
// @version      0.4
// @license      MPL-2.0
// @description  添加番剧收藏功, 快速跳转到收藏的番剧.
// @author       c4r
// @match        *://anime1.me/*
// @grant        GM_addStyle
// @require      https://code.jquery.com/jquery-latest.js
// ==/UserScript==

(function () {
    'use strict';

    GM_addStyle(`
.episode {
    margin-left: 5px;
    margin-bottom: 5px;
    min-width: 30px;
    text-align: center;
    display: inline-block;
    border: solid 2px rgba(51,51,51,.75);
}
.episode > a{
    display: block;
}
.read {
    background:#cecece;
}
.pages {
    height: 50px;
    overflow:auto;
}
.page {
    margin-bottom: 5px;
    min-width: 30px;
    text-align: center;
    display: inline-block;
    border: solid 2px rgba(51,51,51,.75);
    background:#8BC34A;
}
    `)

    /**
     * 
     */
    function getPlaylist() {
        let strPlaylist = localStorage.getItem('anime1Playlist')

        if (strPlaylist === undefined || strPlaylist === null) {
            strPlaylist = ''
        } else {

        }

        let arryPlaylist = new Array()

        let slotList = strPlaylist.split('\r\n').slice(0, -1)

        slotList.forEach(item => {
            let titlePos = item.indexOf("title :")
            let urlPos = item.indexOf('url :')
            if (titlePos < 0 || urlPos < 0) {

            } else {
                let title = item.slice(7, urlPos - 1)
                let url = item.slice(urlPos + 5)

                arryPlaylist.push({ 'title': title, 'url': url })


            }
        })


        return arryPlaylist
    }

    function delSub(title, url) {
        let strPlaylist = localStorage.getItem('anime1Playlist')
        let str = 'title :' + title + ' url :' + url + '\r\n'

        // console.log(strPlaylist)
        // console.log('---')
        // console.log(str)
        // console.log('include : ', strPlaylist.includes(str))

        if (strPlaylist.includes(str)) {
            strPlaylist = strPlaylist.replace(str, '')
            console.log(strPlaylist)
            localStorage.setItem('anime1Playlist', strPlaylist)
        }


    }


    function addPlaylist(title, url) {
        let strPlaylist = localStorage.getItem('anime1Playlist')
        if (strPlaylist === undefined || strPlaylist === null) {
            strPlaylist = ''
        } else {

        }

        if (strPlaylist.includes('title :' + title + ' url :' + url)) {
            alert('已经收藏')
        } else {

            strPlaylist = strPlaylist + 'title :' + title + ' url :' + url + '\r\n'

            localStorage.setItem('anime1Playlist', strPlaylist)


            // location.reload()
            $('#subscribe > ul').append('<li style="display: flex;">\
                <a unsubscribed url="'+
                url + '" name="' + title + '" title="退订">[x] </a>\
                <a href='+
                url + '> ' + title + '</a>\
                </li>')
            alert('收藏成功')
        }

    }

    function showPlaylist() {
        $('<section id="subscribe" class="widget widget_recent_entries"><h3 class="widget-title">收藏列表</h3><ul></ul></section>').insertBefore(
            $('#recent-posts-6')
        )

        let arrayPlaylist = getPlaylist()

        arrayPlaylist.forEach(item => {
            $('#subscribe > ul').append('<li style="display: flex;">\
            <a unsubscribed url="'+
                item.url + '" name="' + item.title + '" title="取消收藏">[x] </a>\
            <a href='+
                item.url + '> ' + item.title + '</a>\
            </li>')
        })


    }

    // 加载并显示集数
    function showEpisodeList(){
        // 如果在总集列表页面
        if($("#content h1.page-title").length > 0 ){

            let existPre = false
            let existNext = false
            let cPage = 1
            if($('div.nav-previous').length > 0){
                // 发现上一页
                existPre = true
            }
            if($('div.nav-next').length>0 ){
                // 发现下一页
                existNext = true
            }

            if(!existPre && !existNext){
                // 一共只有一页
                cPage = 1
            }else if(existPre && !existNext){
                // 存在上一页, 当前为第一页
                cPage = 1
            }else{
                // 存在上一页, 存在下一页
                let urlNext =   $('div.nav-next a').attr('href')
                cPage = parseInt(urlNext.slice(urlNext.lastIndexOf('/')+1))+1
            }

            let maxItemsInPage = 14

            // 预测总共页数
            let epFStr = $("article:eq(0)").find('h2.entry-title a').text().trim()
            let numEpF = parseInt(epFStr.slice(epFStr.indexOf('[')+1,-1))

            $('<section id="list-page" class="pages"> </section>').insertAfter("#content h1.page-title")

            let totalPage = cPage + Math.ceil(numEpF/maxItemsInPage)-1

            for (let page = totalPage; page > 0; page--) { 
                $("#list-page").append('<ul id="list-ep-'+page+'"></ul>')
                if(page == cPage){
                    $('#list-ep-'+page).append("<li \
                    class=page>\
                    <a href='"+$('footer span.cat-links:eq(0) > a').attr('href')+"/page/" + page +"'>P"+page+"</a></li>")

                
                    // 准备加载集数
                    $("article").each((index, element) =>{

                        let url = $(element).find('h2.entry-title a').attr('href')
                        let id = element.id
                        let epStr = $(element).find('h2.entry-title a').text().trim()


                        $('#list-ep-'+page).append("<li \
                        class=episode><a href='#"+id+"'>"+epStr.slice(epStr.indexOf('[')+1,-1)+"</a></li>")

                    })
                }else{
                    
                    let cnumEpF = numEpF + (cPage - page) * maxItemsInPage
                    let cnumEpL = numEpF + (cPage - page-1) * maxItemsInPage +1
                    if(cnumEpL <= 0){
                        cnumEpL = 1
                    }

                    $('#list-ep-'+page).append("<li \
                    class=page>\
                    <a href='"+$('footer span.cat-links:eq(0) > a').attr('href')+"/page/" + page +"'>P"+page+"[" 
                    + cnumEpF + "-"
                    + cnumEpL + "]</a></li>")

                }
            }


        }
    }

    $(document).ready(function () {

        if ($('footer span.cat-links').length > 0) {

            // 添加订阅按钮
            $('#primary-menu').append('\
            <li class="menu-item menu-item-type-post_type"> \
                <a  id="menu-subscribe"> 收藏</a></li>')
            $("#menu-subscribe").on("click", () => {
                let title = $('footer span.cat-links:eq(0) > a').text()

                let url = $('footer span.cat-links:eq(0) > a').attr('href')

                // console.log(title, url)
                addPlaylist(title, url)

            });


        }

        showPlaylist()

        showEpisodeList()

        $(document).on('click', 'a[unsubscribed]', (event) => {
            // 

            // console.log(event.target)
            let title = $(event.target).attr('name')
            let url = $(event.target).attr('url')

            // console.log('删除 : ', title , url)

            delSub(title, url)
            // location.reload()
            $(event.target).closest('li').remove()
        })
    })


})();