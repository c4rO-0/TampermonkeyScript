// ==UserScript==
// @name         知乎-封面图片跳转到问题
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.zhihu.com/
// @match        https://www.zhihu.com/hot
// @match        https://www.zhihu.com/question/*
// @require      https://cdn.jsdelivr.net/npm/jquery@3.5.0/dist/jquery.min.js
// @require      https://cdn.jsdelivr.net/npm/jquery.scrollto@2.1.2/jquery.scrollTo.js
// @grant       GM.setValue
// @grant       GM.getValue
// ==/UserScript==

(function() {
    'use strict';

    function httpGetAsync(theUrl, callback) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
                callback(xmlHttp.responseText);
        }
        xmlHttp.open("GET", theUrl, true); // true for asynchronous 
        xmlHttp.send(null);
    }

    function getAnswerURL(questionUrl, imgCode) {
        return new Promise((resolve, reject) => {

            httpGetAsync(questionUrl, (responseText) => {

                let repHTML = $.parseHTML(responseText)

                let answerUrl = $(repHTML).find('img[data-original*="'+imgCode+'"]').closest('.AnswerItem').find('> meta[itemprop="url"]').attr('content')

                resolve(answerUrl)

            })
        })
    }

    function isQuestionPage() {
        return $('.QuestionPage').length > 0
    }


    $(document).on('click', 'a.HotItem-img', (evt)=>{

        if($(evt.target).attr('href').includes('question')){

            evt.stopPropagation();
            evt.preventDefault();

            let imgUrl = $(evt.target).find('img').attr('src')
            let imgCode = imgUrl.substring(imgUrl.lastIndexOf('/')+1, imgUrl.lastIndexOf('_'))


            let qUrl = $(evt.target).attr('href')

            console.log('img code' , imgCode)

            console.log('store zhihu-imgCode')
            let codeList = JSON.parse(localStorage.getItem('zhihu-imgCode') || '{}')

            codeList[qUrl] = {
                'code':imgCode,
                'timestamp': Date.now(),
            }

            console.log('codeList', codeList)

            localStorage.setItem('zhihu-imgCode', JSON.stringify(codeList))

            let win = window.open(qUrl, '_blank');
            win.focus();

            // getAnswerURL(qUrl, imgCode).then(answerUrl => {
            //     console.log('find answer url : ', answerUrl)
            //     if(answerUrl){

            //         let win = window.open(answerUrl, '_blank');
            //         win.focus();
            //     }else{

            //         console.log('store zhihu-imgCode')
            //         let codeList = JSON.parse(localStorage.getItem('zhihu-imgCode') || '{}')

            //         codeList[qUrl] = {
            //             'code':imgCode,
            //             'timestamp': Date.now(),
            //         }

            //         console.log('codeList', codeList)

            //         localStorage.setItem('zhihu-imgCode', JSON.stringify(codeList))

            //         let win = window.open(qUrl, '_blank');
            //         win.focus();
            //     }

            // })
    
        }else{
            console.log('is not question')
        }

    })

    $(document).ready(()=>{
        let codeList = JSON.parse(localStorage.getItem('zhihu-imgCode') || '{}')

        if(isQuestionPage()){

            let questionURL = $('.QuestionPage >meta[itemprop="url"]').attr('content')

            if(codeList[questionURL]){
                console.log('found questionRUL')
                let timestamp = Date.now()
                if(Math.abs(timestamp - codeList[questionURL]['timestamp']) < 5*1000){
                    console.log('jump!!!')

                    // for (let i = 0; i < 5; i++) { 
                        if($('img[data-original*="'+codeList[questionURL]['code']+'"]').length > 0){
                            $.scrollTo(
                                $('img[data-original*="'+codeList[questionURL]['code']+'"]').closest('.AnswerItem').find('.ContentItem-meta'),
                                {
                                    offset: -52
                                }
                            )
        
                            delete codeList[questionURL]
        
                            localStorage.setItem('zhihu-imgCode', JSON.stringify(codeList))
                        }else{
                            
                            // $.scrollTo('.AnswerItem:last')
                            alert('not found img')
    
                        }
                    // }

                    // if($('img[data-original*="'+codeList[questionURL]['code']+'"]').length == 0){
                    //     $.scrollTo('.AnswerItem:first')
                    // }


                }else{
                    console.log('over time', timestamp, Math.abs(timestamp - codeList[questionURL]['timestamp']))
                }
            }else{
                console.log('found not')
            }
        }

        // del all overtime
        let codeListNew = {}
        let timestamp = Date.now()
        for (let [qKey, qValue] of Object.entries(codeList)) {

            if ( Math.abs(timestamp - qValue['timestamp']) < 5*1000) {
                codeListNew[qKey] = qValue
            }
        }
        localStorage.setItem('zhihu-imgCode', JSON.stringify(codeListNew))


    })


})();