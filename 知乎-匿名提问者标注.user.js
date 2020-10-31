// ==UserScript==
// @name         知乎-匿名提问者标注
// @namespace    http://tampermonkey.net/
// @version      1.5.0
// @license      MPL-2.0
// @description  在问题页, 标注匿名提问, 防止钓鱼
// @author       C4r
// @match        https://www.zhihu.com/*
// @require      https://cdn.jsdelivr.net/npm/jquery@3.5.0/dist/jquery.min.js
// @grant          GM_addStyle
// @grant       GM.setValue
// @grant       GM.getValue
// ==/UserScript==

(function () {
    'use strict';

    GM_addStyle(' \
    .wrapper { \
        margin: 102px 0;\
      }\
      .toggle_radio{\
        position: relative;\
        background: #497dd0;\
        margin: 4px auto;\
        overflow: hidden;\
        padding: 0 !important;\
        -webkit-border-radius: 50px;\
        -moz-border-radius: 50px;\
        border-radius: 50px;\
        position: relative;\
        height: 26px;\
        width: 110px;\
      }\
      .toggle_radio > * {\
        float: left;\
      }\
      .toggle_radio input[type=radio]{\
        display: none;\
      }\
      .toggle_radio label{\
        font: 90%/1.618 "Source Sans Pro";\
        color: rgba(255,255,255,.9);\
        z-index: 0;\
        display: block;\
        width: 30px;\
        height: 20px;\
        margin: 3px 3px;\
        -webkit-border-radius: 50px;\
        -moz-border-radius: 50px;\
        border-radius: 50px;\
        cursor: pointer;\
        z-index: 1;\
        /*background: rgba(0,0,0,.1);*/\
        text-align: center;\
      }\
      .toggle_option_slider{\
        width: 30px;\
        height: 20px;\
        position: absolute;\
        top: 3px;\
        -webkit-border-radius: 15px;\
        -moz-border-radius: 15px;\
        border-radius: 15px;\
        -webkit-transition: all .4s ease;\
        -moz-transition: all .4s ease;\
        -o-transition: all .4s ease;\
        -ms-transition: all .4s ease;\
        transition: all .4s ease;\
      }\
      #AnonymousToggleOff:checked ~ .toggle_option_slider{\
        background: rgba(255,255,255,.3);\
        left: 3px;\
      }\
      #AnonymousToggleLight:checked ~ .toggle_option_slider{\
        background: rgba(255,255,255,.3);\
        left: 38px;\
      }\
      #AnonymousToggleTight:checked ~ .toggle_option_slider{\
        background: rgba(255,255,255,.3);\
        left: 75px;\
    ');

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

            this.timeStamp = undefined
        }


        print() {
            console.log('url        : ', this.url           )
            console.log('name       : ', this.name          )
            console.log('avatar     : ', this.avatar        )
            console.log('isOrg      : ', this.isOrg         )
            console.log('isVerified : ', this.isVerified    )
            console.log('ask        : ', this.ask           )
            console.log('answer     : ', this.answer        )
            console.log('following  : ', this.following     )
            console.log('follower   : ', this.follower      )
            console.log('post       : ', this.post          )
            console.log('agree      : ', this.agree         )
            console.log('score      : ', this.score         )
            console.log('scoreMarker: ', this.scoreMarker   )
            console.log('timeStamp  : ', this.timeStamp     )
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
            if (arrayAgree) {
                this.agree = parseInt(arrayAgree.join(''))
            } else {
                this.agree = 0
            }
            // this.agree = parseInt($($(pageHTML).find('.Zi--Like').closest('.css-12ofpn8').find('.css-vurnku').contents().get(0)).text().match(/\d+/g).join(''))


            this.evaluateAuthor()

            this.timeStamp = Date.now()

            this.store()
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
            } else if (this.agree <= 0.5 * this.answer) {
                score = score - 1
            }

            if (this.answer >= 2. * this.ask) {
                score = score + 1
                // console.log('answer up')
            } else if (this.answer <= 0.5 * this.ask) {
                score = score - 3
            } else if (this.answer <= 0.7 * this.ask) {
                score = score - 2
            } else if (this.answer <= 1. * this.ask) {
                score = score - 1
            }

            if (this.follower < 10) {
                score = score - 1
                // console.log('follower up')
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

        toJSON() {
            return {
                'url'        : this.url        , 
                'name'       : this.name       , 
                'avatar'     : this.avatar     , 
                'isOrg'      : this.isOrg      , 
                'isVerified' : this.isVerified , 
                'ask'        : this.ask        , 
                'answer'     : this.answer     , 
                'following'  : this.following  , 
                'follower'   : this.follower   , 
                'post'       : this.post       , 
                'agree'      : this.agree      , 
                'score'      : this.score      , 
                'scoreMarker': this.scoreMarker, 
                'timeStamp'  : this.timeStamp  
            }
        }

        fromJSON(json) {
            
            this.url        =  json['url'         ]  
            this.name       =  json['name'        ]  
            this.avatar     =  json['avatar'      ]  
            this.isOrg      =  json['isOrg'       ]  
            this.isVerified =  json['isVerified'  ]  
            this.ask        =  json['ask'         ]  
            this.answer     =  json['answer'      ]  
            this.following  =  json['following'   ]  
            this.follower   =  json['follower'    ]  
            this.post       =  json['post'        ]  
            this.agree      =  json['agree'       ]  
            this.score      =  json['score'       ]  
            this.scoreMarker=  json['scoreMarker' ]  
            this.timeStamp  =  json['timeStamp'   ]             
        }

        store() {
            let allData = JSON.parse(localStorage.getItem('zhihu-Anonymous') || '{}')

            if (allData['author'] == undefined || allData['author'][this.url] == undefined) {
                allData['author'][this.url] = this.toJSON()
                localStorage.setItem('zhihu-Anonymous', JSON.stringify(allData))
            } else {
                if ( (this.timeStamp - allData[this.url]['timeStamp']) > 24 * 60 * 60 * 1000) {
                    allData['author'][this.url] = this.toJSON()
                    // console.log(this.toJSON())
                    // localStorage.setItem('zhihu-Anonymous', JSON.stringify(allData))
                }
            }
        }

        get() {
            let allData = JSON.parse(localStorage.getItem('zhihu-Anonymous') || '{}')

            // console.log(allData)

            if (allData['author'] == undefined) {
                return false
            } else {
                if (allData['author'][this.url]){
                    this.fromJSON( allData['author'][this.url])

                    return true
                }else{
                    return false
                }
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

            let author = new Author(authorUrl)

            if(author.get()){
                // console.log('author exist ', author.name)
                resolve(author)
            }else{

                httpGetAsync(authorUrl, (responseText) => {
    
                    let repHTML = $.parseHTML(responseText)
    
                    author.updateAuthorFromPage(repHTML)
    
                    resolve(author)
    
                })
            }

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

        $('div[AnonymousToggleCount]').text('🏃')

        let num_section = $('.HotList-list section').length

        let arrayHide = new Array(num_section)

        $('.HotList-list section').each((index, section) => {
            arrayHide[index] = new Promise(resolveHide => {
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
                                    $(section).find('[AnonymousNote]').append('<span class="HotItem-action" AnonymousNote done title="匿名提问"><a class="Profile-lightItem" valueAuthor score="0" title="powered by C4r" href="https://zhuanlan.zhihu.com/p/269994286">👻 匿名 </a></span>')

                                    $(section).find('[AnonymousNote]').removeAttr('checking')
                                    $(section).find('[AnonymousNote]').attr('done', '')
                                } else {
                                    $(section).find('.HotItem-metrics').append('<span class="HotItem-action" AnonymousNote done title="匿名提问"><a class="Profile-lightItem" valueAuthor  score="0"   title="powered by C4r" href="https://zhuanlan.zhihu.com/p/269994286">👻 匿名 </a></span>')
                                }

                                if ($('[AnonymousToggle]').length > 0 && ($('#AnonymousToggleTight').prop('checked') || $('#AnonymousToggleLight').prop('checked'))) {
                                    $(section).hide()
                                    resolveHide(true)
                                } else {
                                    resolveHide(false)
                                }

                            } else {
                                // console.log('找到题主 : ', authorInfo)
                                if ($(section).find('[AnonymousNote]').length > 0) {
                                    $(section).find('[AnonymousNote]').empty()
                                    $(section).find('[AnonymousNote]').append(' 👤 ' + authorInfo.a + ' <a class="Profile-lightItem" valueAuthor >🔍</a>')
                                    $(section).find('[AnonymousNote]').removeAttr('checking')
                                    $(section).find('[AnonymousNote]').attr('done', '')
                                } else {
                                    $(section).find('.HotItem-metrics').append('<span class="HotItem-action" AnonymousNote done title="题主"> 👤 ' + authorInfo.a + ' <a class="Profile-lightItem" valueAuthor>🔍</a> </span>')
                                }

                                getAuthorInfoDetail(authorInfo.url).then(author => {
                                    if ($(section).find('[AnonymousNote] [valueAuthor]').length > 0) {
                                        $(section).find('[AnonymousNote] [valueAuthor]').remove()
                                    }

                                    $(section).find('[AnonymousNote]').append('<a class="Profile-lightItem" valueAuthor score="' + author.score.toString() + '" title="score : ' + author.score.toString() + ' by C4r" href="https://zhuanlan.zhihu.com/p/269994286">' + author.scoreMarker + '</a>')

                                    if ($('[AnonymousToggle]').length > 0 && $('#AnonymousToggleTight').prop('checked') && author.score < 4) {

                                        $(section).hide()
                                        resolveHide(true)
                                    } else {
                                        resolveHide(false)
                                    }


                                })
                            }
                        })
                    } else {
                        resolveHide(undefined)
                    }

                } else {
                    resolveHide(undefined)
                }
            })

        })

        Promise.all(arrayHide).then((values) => {

            // console.log(num_section, ' hide ', values)
            let countHide = values.filter(isHide => isHide).length

            if (countHide > 0) {
                $('div[AnonymousToggleCount]').text('-' + countHide.toString())
                setTimeout(() => {
                    $('div[AnonymousToggleCount]').text('')
                }, 1000);
            } else {
                $('div[AnonymousToggleCount]').text('')
            }


        });

    }

    function callbackHotList(mutationsList) {
        if ($('.HotList-list').length > 0) {
            // console.log('refresh author info...')
            let count = 0
            for (let mutation of mutationsList) {
                if ($(mutation.target).find('[AnonymousNote]').length == 0
                    && $(mutation.target).find('.HotItem-content a').attr('href').includes('question')) {
                    count = count + 1
                }
            }
            if (count > 0) {
                loadHotlist()
            }
        }
    }

    $(document).on('click', '[AnonymousToggle]', () => {

        let countHide = 0
        let countShow = 0
        if ($('#AnonymousToggleLight').prop('checked')) {

            GM.setValue("zhihu-AnonymousToggle", 1)

            $('.HotList-list section').each((index, section) => {
                if ($(section).find('[AnonymousNote]').length > 0) {
                    if ($(section).find('[valueAuthor]') && parseInt($(section).find('[valueAuthor]').attr('score')) == 0) {
                        $(section).hide()
                        countHide = countHide + 1
                    } else {
                        $(section).show()
                        countShow = countShow + 1
                    }
                }
            })

            $('div[AnonymousToggleCount]').text('-' + countHide.toString())
            setTimeout(() => {
                $('div[AnonymousToggleCount]').text('')
            }, 1000);


        } else if ($('#AnonymousToggleTight').prop('checked')) {
            GM.setValue("zhihu-AnonymousToggle", 2)

            $('.HotList-list section').each((index, section) => {
                if ($(section).find('[AnonymousNote]').length > 0) {
                    if ($(section).find('[valueAuthor]') && parseInt($(section).find('[valueAuthor]').attr('score')) < 4) {
                        $(section).hide()
                        countHide = countHide + 1
                    }
                }
            })


            $('div[AnonymousToggleCount]').text('-' + countHide.toString())
            setTimeout(() => {
                $('div[AnonymousToggleCount]').text('')
            }, 1000);

        } else {
            // if($('#AnonymousToggleOff').prop('checked')){
            GM.setValue("zhihu-AnonymousToggle", 0)
            $('.HotList-list section').each((index, section) => {
                if ($(section).find('[AnonymousNote]').length > 0) {
                    if ($(section).find('[valueAuthor]') && $(section).is(":hidden")) {
                        $(section).show()
                        countShow = countShow + 1
                    }
                }
            })

            $('div[AnonymousToggleCount]').text('+' + countShow.toString())
            setTimeout(() => {
                $('div[AnonymousToggleCount]').text('')
            }, 1000);

        }
    })
    let c4rHTML = '<svg version="1.0" xmlns="http://www.w3.org/2000/svg"\
    width="12.000000pt" height="12.000000pt" viewBox="0 0 500.000000 500.000000"\
    preserveAspectRatio="xMidYMid meet">\
   <g transform="translate(0.000000,500.000000) scale(0.100000,-0.100000)"\
   fill="#000000" stroke="none">\
   <path d="M3125 4985 c-337 -63 -703 -242 -1077 -527 -570 -434 -1157 -1137\
   -1467 -1757 -100 -198 -183 -442 -216 -630 -19 -109 -19 -315 0 -404 44 -207\
   196 -374 412 -451 141 -50 221 -61 438 -61 286 1 470 33 850 147 293 88 301\
   92 447 245 68 70 142 147 166 171 33 33 43 49 40 70 l-3 27 -250 9 c-185 6\
   -265 5 -310 -3 -33 -7 -170 -48 -304 -93 -270 -88 -376 -114 -520 -128 -100\
   -9 -241 0 -326 21 -53 13 -119 67 -145 120 -112 219 73 755 462 1338 581 870\
   1323 1498 1887 1596 102 18 148 19 271 3 110 -13 137 -9 183 32 63 55 70 155\
   17 223 -39 49 -88 60 -290 63 -133 2 -208 -1 -265 -11z"/>\
   <path d="M2874 2941 c-37 -16 -64 -60 -64 -106 0 -31 14 -68 54 -146 115 -221\
   186 -497 216 -836 11 -119 10 -123 -13 -170 -84 -166 -208 -603 -263 -922 -34\
   -197 -43 -447 -20 -546 33 -138 109 -215 213 -215 50 0 57 3 103 46 110 103\
   190 338 264 775 45 263 66 465 66 634 0 154 5 168 103 315 164 247 316 385\
   472 426 105 29 276 11 414 -43 36 -14 89 -28 117 -30 46 -4 53 -2 82 27 28 28\
   32 38 32 87 0 55 -1 56 -61 114 -86 83 -188 147 -288 183 -74 26 -100 30 -191\
   30 -124 0 -198 -17 -316 -74 -109 -53 -229 -143 -341 -257 l-92 -93 -11 42\
   c-33 128 -98 294 -176 451 -68 135 -145 266 -173 291 -23 21 -95 30 -127 17z"/>\
   </g>\
   </svg>'


    // fresh data
    /**
     * zhihu-Anonymous :{
     *  lastFreshTimeStamp : sec
     *  author :{
     *  url : author class
     *  ...
     *  }
     *  question :{
     *  url : { timeStamp: sec; author : url}
     *  }
     * }
     */
    let allData = JSON.parse(localStorage.getItem('zhihu-Anonymous') || '{}')

    if (allData['lastFreshTimeStamp'] == undefined) {
        allData['lastFreshTimeStamp'] = Date.now()
        allData['author'] = {}
        allData['question'] = {}

        localStorage.setItem('zhihu-Anonymous', JSON.stringify(allData))
    } else {
        let nowTimeStamp = Date.now()

        if (nowTimeStamp - allData['lastFreshTimeStamp'] > 7 * 24 * 60 * 60 * 1000) {
            let authorList = {}
            for (let authorValue of Object.values(allData['author'])) {
                if (nowTimeStamp - authorValue['timeStamp'] < 24 * 60 * 60 * 1000) {
                    authorList[authorValue['url']] = authorValue
                }
            }

            let questionList = {}
            for (let [qKey, qValue] of Object.entries(allData['question'])) {

                if (nowTimeStamp - qValue['timeStamp'] < 24 * 60 * 60 * 1000) {
                    questionList[qKey] = qValue
                }
            }

            allData['author'] = authorList
            allData['question'] = questionList
            allData['lastFreshTimeStamp'] = nowTimeStamp

            localStorage.setItem('zhihu-Anonymous', JSON.stringify(allData))
        }
    }

    $(document).ready(() => {

        if (isHome()) {

            GM.getValue("zhihu-AnonymousToggle", 0).then((anonymousToggle) => {
                if ($('[AnonymousToggle]').length > 0) {
                    switch (anonymousToggle) {
                        case 0:
                            $('#AnonymousToggleOff').prop('checked', true);
                            break;
                        case 1:
                            $('#AnonymousToggleLight').prop('checked', true);
                            break;
                        case 2:
                            $('#AnonymousToggleTight').prop('checked', true);
                            break;
                        default:
                            break;
                    }

                } else {
                    $('.AppHeader-userInfo').prepend(
                        '<div class="wrapper" AnonymousToggle><div AnonymousToggleCount class="Popover" style="color: #497dd0;">🏃</div>\
                          <div class="Popover toggle_radio">\
                            <input type="radio" class="toggle_option" id="AnonymousToggleOff" name="toggle_option"   '+ (anonymousToggle == 0 ? 'checked' : '') + '>\
                            <input type="radio" class="toggle_option" id="AnonymousToggleLight" name="toggle_option" '+ (anonymousToggle == 1 ? 'checked' : '') + '>\
                            <input type="radio" class="toggle_option" id="AnonymousToggleTight" name="toggle_option" '+ (anonymousToggle == 2 ? 'checked' : '') + '>\
                            <label for="AnonymousToggleOff" title="关闭问题过滤" ><p>'+ c4rHTML + '</p></label>\
                            <label for="AnonymousToggleLight" title="隐藏匿名问题" ><p>👻</p></label>\
                            <label for="AnonymousToggleTight" title="隐藏匿名和低质问题"><p>🔥</p></label>\
                            <div class="toggle_option_slider">\
                            </div>\
                          </div>')
                }
            }).catch((error) => {
                // console.log('AnonymousToggle error ',error )
            })

            // 热榜
            if ($('.HotList-list').length > 0) {
                loadHotlist()
            }

            let observerHotList = new MutationObserver(callbackHotList)
            observerHotList.observe($('#TopstoryContent').get(0),
                {
                    subtree: true, childList: false, characterData: false, attributes: true, attributeFilter: ['data-za-detail-view-path-module'],
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
                        addNoteQuestionPage('👤 ' + authorInfo.a + ' <a class="Profile-lightItem" valueAuthor >🔍</a>', '<a href=' + logURL + '>问题日志</a>')
                        // let oText = $('.PageHeader h1.QuestionHeader-title').text()
                        // $('.PageHeader h1.QuestionHeader-title').text('👤 ' + oText)

                        getAuthorInfoDetail(authorInfo.url).then(author => {
                            addNoteQuestionPage(
                                '👤 ' + authorInfo.a +
                                '<a class="Profile-lightItem" valueAuthor title="score : ' + author.score.toString() + ' by C4r" href="https://zhuanlan.zhihu.com/p/269994286">' + author.scoreMarker + '</a>',
                                '<a href=' + logURL + '>问题日志</a>')
                            let oText = $('.PageHeader h1.QuestionHeader-title').text()
                            $('.PageHeader h1.QuestionHeader-title').text(author.scoreMarker + oText)
                        })
                    }
                })
            } else {
                $('.QuestionAuthor').append('<a href=' + logURL + '>问题日志</a>')

                $('.QuestionAuthor div.AuthorInfo-content').append(' <a class="Profile-lightItem" valueAuthor >🔍</a>')

                getAuthorUrl(logURL).then(authorInfo => {
                    getAuthorInfoDetail(authorInfo.url).then(author => {

                        if ($('.QuestionAuthor div.AuthorInfo-content [valueAuthor]').length > 0) {
                            $('.QuestionAuthor div.AuthorInfo-content [valueAuthor]').remove()
                        }

                        $('.QuestionAuthor div.AuthorInfo-content').append('<a class="Profile-lightItem" valueAuthor title="score : ' + author.score.toString() + ' by C4r" href="https://zhuanlan.zhihu.com/p/269994286">' + author.scoreMarker + '</a>')

                        let oText = $('.PageHeader h1.QuestionHeader-title').text()
                        $('.PageHeader h1.QuestionHeader-title').text(author.scoreMarker + oText)
                    })
                })
            }

        } else if (isAuthorPage()) {

            $('.Profile-lightList').prepend(
                '<a class="Profile-lightItem" valueAuthor title="powered by C4r" href="https://zhuanlan.zhihu.com/p/269994286"><span class="Profile-lightItemName">题主估分</span><span class="Profile-lightItemValue">🖩</span></a>')

            let author = new Author(window.location.href)

            if(! author.get()){
                // console.log('not found author')
                author.updateAuthorFromPage(document)
            }else{
                // console.log('author exist ')
            }

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