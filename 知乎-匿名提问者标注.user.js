// ==UserScript==
// @name         知乎-匿名提问者标注
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  在问题页, 标注匿名提问, 防止钓鱼
// @author       C4r
// @match        https://www.zhihu.com/*
// @require      https://cdn.jsdelivr.net/npm/jquery@3.5.0/dist/jquery.min.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function isHome(){
        return $("#TopstoryContent").length > 0
    }

    function isQuestionPage(){
        return $('.QuestionPage').length > 0
    }

    function getLogURL(questionURL){
        // return new URL('log', questionURL).href
        return questionURL + '/log'
    }


    function httpGetAsync(theUrl, callback) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
                callback(xmlHttp.responseText);
        }
        xmlHttp.open("GET", theUrl, true); // true for asynchronous 
        xmlHttp.send(null);
    }

    function getAuthorUrl(logURL){
        return new Promise((resolve, reject) => {

            httpGetAsync(logURL, (responseText) => {

                // console.log('get response')

                let repHTML = $.parseHTML(responseText)

                
                let author = $(repHTML).find('.zm-item:last > div > a').attr('href')

                if(author != undefined){

                    let userInfo = {
                        'name': $(repHTML).find('.zm-item:last > div > a').text(),
                        'url': $(repHTML).find('.zm-item:last > div > a').get(0).href,
                        'a': $(repHTML).find('.zm-item:last > div > a').get(0).outerHTML
                    }

                    resolve(userInfo)
                }else{
                    // console.log( '匿名提问 : ',  undefined)
                    resolve(undefined)
                }
                
            })
        })
    }

    function topic(){
        return '\
<div class="Tag QuestionTopic" data-za-detail-view-path-module="TopicItem" data-za-extra-module="{&quot;card&quot;:{&quot;content&quot;:{&quot;type&quot;:&quot;Topic&quot;,&quot;token&quot;:&quot;19962846&quot;}}}">\
    <span class="Tag-content">\
        <a class="TopicLink" href="//www.zhihu.com/topic/19962846" target="_blank">\
            <div class="Popover"><div id="Popover4-toggle" aria-haspopup="true" aria-expanded="false" aria-owns="Popover4-content">匿名提问</div>\
            </div>\
        </a>\
    </span>\
</div>\
        '
    }

    function noteQuestionPage(content, jump){
        return '\
<div class="Labels LabelContainer" AnonymousNote>\
    <div class="Labels-item">\
        <div class="PositiveLabel">\
            <div class="PositiveLabelLayout">\
                <div class="PositiveLabelLayout-bar">\
                    <div class="PositiveLabelBar PositiveLabelBar--link PositiveLabelBar--special" data-za-detail-view-path-module="Content" data-za-detail-view-path-module_name="">\
                        <div class="PositiveLabelBar-content">\
                            <div class="PositiveLabelBar-main">\
                                <span class="PositiveLabelBar-title">'+content +'</span>\
                            </div>\
                            <div class="PositiveLabelBar-side">'+ jump +'</div>\
                        </div>\
                    </div>\
                </div>\
            </div>\
        </div>\
    </div>\
</div>'
    }

    function addNoteQuestionPage(content, jump){
        if($('[AnonymousNote]').length > 0){
            $('[AnonymousNote] .PositiveLabelBar-title' ).empty()
            $('[AnonymousNote] .PositiveLabelBar-title' ).append(content)
            $('[AnonymousNote] .PositiveLabelBar-side' ).empty()
            $('[AnonymousNote] .PositiveLabelBar-side' ).append(jump)

        }else{
            console.log('插入')
            $('.QuestionHeader h1.QuestionHeader-title').after( noteQuestionPage(content, jump) );
        }
    }
    

    $(document).ready(()=>{

        if(isHome()){

            //  console.log("主页")

        }else if(isQuestionPage()){

            let questionURL = $('.QuestionPage >meta[itemprop="url"]').attr('content')

            let logURL = getLogURL(questionURL)

            // console.log('问题页 ', logURL)
            addNoteQuestionPage('读取日志中...', '<a href='+ logURL + '>问题日志</a>')

            getAuthorUrl(logURL).then(authorInfo =>{
                if(authorInfo == undefined){
                    addNoteQuestionPage('⚠ 注意 : 这是一篇匿名提问', '<a href='+ logURL + '>问题日志</a>')
                    let oText = $('.PageHeader h1.QuestionHeader-title').text()
                    $('.PageHeader h1.QuestionHeader-title').text( '[⚠ 匿名]' + oText )
                }else{
                    // console.log('找到题主 : ', authorInfo)
                    addNoteQuestionPage('题主 : ' + authorInfo.a, '<a href='+ logURL + '>问题日志</a>')
                    let oText = $('.PageHeader h1.QuestionHeader-title').text()
                    $('.PageHeader h1.QuestionHeader-title').text('[🗹]' + oText )
                }
            })
        }else{
            // console.log('unknown Page')
        }

    })
})();