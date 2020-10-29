// ==UserScript==
// @name         知乎-匿名提问者标注
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  在问题页, 标注匿名提问, 防止钓鱼
// @author       C4r
// @match        https://www.zhihu.com/*
// @require      https://cdn.jsdelivr.net/npm/jquery@3.5.0/dist/jquery.min.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    function isHome() {
        return $("#TopstoryContent").length > 0
    }

    function isQuestionPage() {
        return $('.QuestionPage').length > 0
    }

    function isAuthorPage() {
        return $('#ProfileHeader').length > 0
    }

    function getLogURL(questionURL) {
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

    function getAuthorUrl(logURL) {
        return new Promise((resolve, reject) => {

            httpGetAsync(logURL, (responseText) => {

                // console.log('get response')

                let repHTML = $.parseHTML(responseText)


                let author = $(repHTML).find('.zm-item:last > div > a').attr('href')

                if (author != undefined) {

                    let userInfo = {
                        'name': $(repHTML).find('.zm-item:last > div > a').text(),
                        'url': $(repHTML).find('.zm-item:last > div > a').get(0).href,
                        'a': $(repHTML).find('.zm-item:last > div > a').get(0).outerHTML
                    }

                    resolve(userInfo)
                } else {
                    // console.log( '匿名提问 : ',  undefined)
                    resolve(undefined)
                }

            })
        })
    }

    class Author {
        constructor(url) {
            this.url = url
            this.name = undefined
            this.avatar = undefined
            this.isOrg = undefined
            this.isVerified = undefined
            this.ask = undefined
            this.answer = undefined
            // 关注了
            this.following = undefined
            // 关注者
            this.follower = undefined
            this.post = undefined
            this.agree = undefined
            this.score = undefined
            this.scoreMarker = undefined
        }


        print() {
            console.log('url        : ', this.url)
            console.log('name       : ', this.name)
            console.log('avatar     : ', this.avatar)
            console.log('isOrg      : ', this.isOrg)
            console.log('isVerified : ', this.isVerified)
            console.log('ask        : ', this.ask)
            console.log('answer     : ', this.answer)
            console.log('following  : ', this.following)
            console.log('follower   : ', this.follower)
            console.log('post       : ', this.post)
            console.log('agree      : ', this.agree)
            console.log('score      : ', this.score)
        }

        updateAuthorFromPage(pageHTML) {

            this.name = $(pageHTML).find('.ProfileHeader-name').text()

            this.avatar = $(pageHTML).find('img.Avatar').attr('src')

            this.ask = parseInt($(pageHTML).find('.Profile-mainColumn li.Tabs-item[aria-controls="Profile-asks"] span').text())

            this.answer = parseInt($(pageHTML).find('.Profile-mainColumn li.Tabs-item[aria-controls="Profile-answers"] span:eq(0)').text())
                + parseInt($(pageHTML).find('.Profile-mainColumn li.Tabs-item[aria-controls="Profile-answers"] span:eq(1)').text())

            this.post = parseInt($(pageHTML).find('.Profile-mainColumn li.Tabs-item[aria-controls="Profile-posts"] span').text())

            this.following = parseInt($(pageHTML).find('.FollowshipCard a:eq(0) .NumberBoard-itemValue').attr('title'))

            this.follower = parseInt($(pageHTML).find('.FollowshipCard a:eq(1) .NumberBoard-itemValue').attr('title'))

            let arrayAgree = $($(pageHTML).find('.Zi--Like').closest('.css-12ofpn8').find('.css-vurnku').contents().get(0)).text().match(/\d+/g)
            if(arrayAgree){
                this.agree = parseInt(arrayAgree.join(''))
            }else{
                this.agree = 0
            }
            // this.agree = parseInt($($(pageHTML).find('.Zi--Like').closest('.css-12ofpn8').find('.css-vurnku').contents().get(0)).text().match(/\d+/g).join(''))
        }



        /**
         * 评估作者
         * @returns 1-10
         */
        evaluateAuthor() {

            let score = 5

            if (this.agree >= 1.1 * this.answer) {
                score = score + 1 // Math.ceil( this.agree/this.answer )
                // console.log('agree up')
            } else if (this.agree <= 0.2 * this.answer) {
                score = score - 2
                // console.log('agree down')
            } else if (this.answer <= 0.5 * this.ask) {
                score = score - 1
            }

            if (this.answer >= 1.5 * this.ask) {
                score = score + 1
                // console.log('answer up')
            } else if (this.answer <= 0.2 * this.ask) {
                score = score - 2
            } else if (this.answer <= 0.7 * this.ask) {
                score = score - 1
            }

            if (this.follower < 100) {
                score = score - 1
                // console.log('follower up')
            }

            if (this.follower >= 100) {
                score = score + 1
                // console.log('follower up')
            }

            if (this.follower >= 1000) {
                score = score + 2
            }

            if (score > 10) {
                score = 10
            } else if (score < 1) {
                score = 1
            }

            this.score = score

            if (this.score > 6) {
                this.scoreMarker = '☼'
            } else if (this.score < 4) {
                this.scoreMarker = '🔥'
            } else {
                this.scoreMarker = '☉' 
            }

        }

    }

    /**
     * 
     * @param {str} authorUrl 作者页链接 
     * https://www.zhihu.com/org/guan-cha-zhe-wang-31 <- 官方帐号
     * https://www.zhihu.com/people/liaoxuefeng <- 个人帐号
     * @returns {Author} author
     * 
     */
    function getAuthorInfoDetail(authorUrl) {
        return new Promise((resolve, reject) => {

            httpGetAsync(authorUrl, (responseText) => {

                // console.log('get response')

                let repHTML = $.parseHTML(responseText)

                let author = new Author(authorUrl)

                author.updateAuthorFromPage(repHTML)

                author.evaluateAuthor()

                resolve(author)

            })
        })
    }


    function topic() {
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

    function noteQuestionPage(content, jump) {
        return '\
<div class="Labels LabelContainer" AnonymousNote>\
    <div class="Labels-item">\
        <div class="PositiveLabel">\
            <div class="PositiveLabelLayout">\
                <div class="PositiveLabelLayout-bar">\
                    <div class="PositiveLabelBar PositiveLabelBar--link PositiveLabelBar--special" data-za-detail-view-path-module="Content" data-za-detail-view-path-module_name="">\
                        <div class="PositiveLabelBar-content">\
                            <div class="PositiveLabelBar-main">\
                                <span class="PositiveLabelBar-title">'+ content + '</span>\
                            </div>\
                            <div class="PositiveLabelBar-side">'+ jump + '</div>\
                        </div>\
                    </div>\
                </div>\
            </div>\
        </div>\
    </div>\
</div>'
    }

    function addNoteQuestionPage(content, jump) {
        if ($('[AnonymousNote]').length > 0) {
            $('[AnonymousNote] .PositiveLabelBar-title').empty()
            $('[AnonymousNote] .PositiveLabelBar-title').append(content)
            $('[AnonymousNote] .PositiveLabelBar-side').empty()
            $('[AnonymousNote] .PositiveLabelBar-side').append(jump)

        } else {
            // console.log('插入')
            $('.QuestionHeader h1.QuestionHeader-title').after(noteQuestionPage(content, jump));
        }
    }


    function loadHotlist() {
        $('.HotList-list section').each((index, section) => {

            if ($(section).find('[AnonymousNote]').length == 0) {
                // if($(section).find('[AnonymousNote]').length == 0 ){   
                let questionURL = $(section).find('.HotItem-content a').attr('href')
                let logURL = getLogURL(questionURL)
                if (logURL.includes('question')) {
                    if ($(section).find('[AnonymousNote][checking]').length == 0) {
                        $(section).find('.HotItem-metrics').append('<span class="HotItem-action" AnonymousNote checking> 🔍 👤 </span>')
                    }

                    getAuthorUrl(logURL).then(authorInfo => {
                        if (authorInfo == undefined) {
                            if ($(section).find('[AnonymousNote]').length > 0) {
                                $(section).find('[AnonymousNote]').empty()
                                $(section).find('[AnonymousNote]').append('<a class="Profile-lightItem" valueAuthor title="powered by C4r" href="https://zhuanlan.zhihu.com/p/269994286">👻 匿名 </a>')

                                $(section).find('[AnonymousNote]').removeAttr('checking')
                                $(section).find('[AnonymousNote]').attr('done', '')
                            } else {
                                $(section).find('.HotItem-metrics').append('<span class="HotItem-action" AnonymousNote done title="匿名提问"><a class="Profile-lightItem" valueAuthor title="powered by C4r" href="https://zhuanlan.zhihu.com/p/269994286">👻 匿名 </a></span>')
                            }

                        } else {
                            // console.log('找到题主 : ', authorInfo)
                            if ($(section).find('[AnonymousNote]').length > 0) {
                                $(section).find('[AnonymousNote]').empty()
                                $(section).find('[AnonymousNote]').append(' 👤 ' + authorInfo.a)
                                $(section).find('[AnonymousNote]').removeAttr('checking')
                                $(section).find('[AnonymousNote]').attr('done', '')
                            } else {
                                $(section).find('.HotItem-metrics').append('<span class="HotItem-action" AnonymousNote done title="题主"> 👤 ' + authorInfo.a + ' </span>')
                            }

                            getAuthorInfoDetail(authorInfo.url).then(author => {
                                if( $(section).find('[AnonymousNote] [valueAuthor]').length == 0){
                                    $(section).find('[AnonymousNote]').append('<a class="Profile-lightItem" valueAuthor title="score : '+ author.score.toString() +' by C4r" href="https://zhuanlan.zhihu.com/p/269994286">' + author.scoreMarker + '</a>')
                                }
                                
                            })
                        }
                    })
                }

            }
        })
    }

    function callbackHotList() {
        if ($('.HotList-list').length > 0) {
            // console.log('refresh author info...')
            loadHotlist()
        }
    }

    $(document).ready(() => {

        if (isHome()) {

            // 热榜
            if ($('.HotList-list').length > 0) {
                loadHotlist()
            }

            let observerHotList = new MutationObserver(callbackHotList)
            observerHotList.observe($('#TopstoryContent').get(0),
                {
                    subtree: true, childList: true, characterData: false, attributes: true,
                    attributeOldValue: false, characterDataOldValue: false
                })


        } else if (isQuestionPage()) {

            let questionURL = $('.QuestionPage >meta[itemprop="url"]').attr('content')

            let logURL = getLogURL(questionURL)

            if ($('.QuestionAuthor').length == 0) {
                // console.log('问题页 ', logURL)
                addNoteQuestionPage('读取日志中...', '<a href=' + logURL + '>问题日志</a>')

                getAuthorUrl(logURL).then(authorInfo => {
                    if (authorInfo == undefined) {
                        addNoteQuestionPage('<a class="Profile-lightItem" valueAuthor title="powered by C4r" href="https://zhuanlan.zhihu.com/p/269994286"> ⚠ 注意 : 这是一篇匿名提问 👻 </a>', '<a href=' + logURL + '>问题日志</a>')
                        let oText = $('.PageHeader h1.QuestionHeader-title').text()
                        $('.PageHeader h1.QuestionHeader-title').text('👻 ' + oText)
                    } else {
                        // console.log('找到题主 : ', authorInfo)
                        addNoteQuestionPage('👤 ' + authorInfo.a, '<a href=' + logURL + '>问题日志</a>')
                        // let oText = $('.PageHeader h1.QuestionHeader-title').text()
                        // $('.PageHeader h1.QuestionHeader-title').text('👤 ' + oText)

                        getAuthorInfoDetail(authorInfo.url).then(author => {
                            addNoteQuestionPage( 
                                '👤 ' + authorInfo.a + 
                                '<a class="Profile-lightItem" valueAuthor title="score : '+ author.score.toString() +' by C4r" href="https://zhuanlan.zhihu.com/p/269994286">' + author.scoreMarker + '</a>', 
                                '<a href=' + logURL + '>问题日志</a>')
                            let oText = $('.PageHeader h1.QuestionHeader-title').text()
                            $('.PageHeader h1.QuestionHeader-title').text(author.scoreMarker + oText)
                        })
                    }
                })
            } else {
                $('.QuestionAuthor').append('<a href=' + logURL + '>问题日志</a>')
                getAuthorUrl(logURL).then(authorInfo => {
                    getAuthorInfoDetail(authorInfo.url).then(author => {

                        $('.QuestionAuthor div.AuthorInfo-content').append('<a class="Profile-lightItem" valueAuthor title="score : '+ author.score.toString() +' by C4r" href="https://zhuanlan.zhihu.com/p/269994286">' + author.scoreMarker + '</a>')

                        let oText = $('.PageHeader h1.QuestionHeader-title').text()
                        $('.PageHeader h1.QuestionHeader-title').text(author.scoreMarker + oText)
                    })
                })
            }

        } else if (isAuthorPage()) {

            $('.Profile-lightList').prepend(
                '<a class="Profile-lightItem" valueAuthor title="powered by C4r" href="https://zhuanlan.zhihu.com/p/269994286"><span class="Profile-lightItemName">题主估分</span><span class="Profile-lightItemValue">🖩</span></a>')

            let author = new Author(window.location.href)

            author.updateAuthorFromPage(document)

            author.evaluateAuthor()

            // author.print()

            // console.log('分数 : ',author.evaluateAuthor())

            // append score
            let scoreString = author.score.toString() + author.scoreMarker

            if ($('[valueAuthor]').length > 0) {
                $('[valueAuthor] .Profile-lightItemValue').text(scoreString)

            } else {
                $('.Profile-lightList').prepend(
                    '<a class="Profile-lightItem" valueAuthor title="powered by C4r" href="https://zhuanlan.zhihu.com/p/269994286"><span class="Profile-lightItemName">题主估分</span><span class="Profile-lightItemValue">' + scoreString + '</span></a>')
            }


        }

    })
})();