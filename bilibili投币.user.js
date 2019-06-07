// ==UserScript==
// @name         bilibili一键投币
// @namespace    www.papercomment.tech
// @version      0.4
// @description  在视频右上角添加快捷按钮帮助用户在全屏和非全屏下一键投币. 投币不需要退出全屏, 过程没有弹出遮挡提示,不需要暂停视频. 方便支持自己喜欢的作者, 投币获得经验5级帐号不再遥不可及. 
// @author       c4r
// @match        https://www.bilibili.com/watchlater/*
// @match        https://www.bilibili.com/video/*
// @match        https://www.bilibili.com/bangumi/play/*
// @require      https://code.jquery.com/jquery-latest.js
// @grant        GM_addStyle
// @license      MPL-2.0
// ==/UserScript==

(function () {
    'use strict';

    /**
     *  玩法：修改第二层div.c4r的类，可改的类名包括（.initial .success .error .processing .surprise .hide .fade），其中.inital和.success需要保证有且仅有一个存在。
     */
    GM_addStyle(`
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
  height:50%;
  width:50%;
  top:-7%;
  right:-7%;
  border-radius:100%;
}
.success {
  background-color: #ffffff;
  height:50%;
  width:50%;
  top:-7%;
  right:-7%;
  border-radius:100%;
}
.error {
  background-color: #fd676f;
}
.surprise, #c4r-takecoin:hover .c4r {
  height:100%;
  width:100%;
  top:0;
  right:0;
  border-radius:100%;
}
.c4r {
  transition: all 0.3s ease;
}
.c4rHide{
  opacity: 0;
}
.fade {
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
.bcoin {
  fill: #1890ff;
}
.c4r.initial .c4r-logo,
.c4r.success .bcoin{
  display:;
}
.c4r.initial .bcoin,
.c4r.success .c4r-logo{
  display: none;
}
`)


    // ===========================================================================================
    // 全局变量
    // -------------------------------------------------------------------------------------------
    // let sureButton = [
    //     '.coin-operated-m .coin-bottom span.bi-btn', // 新, 老版本
    //     '.coin-sure', // watching list
    //     '.coin-bottom span.bi-btn', // 未订阅
    //     '.coin-bottom span.coin-btn' // 旧,新番剧
    // ]

    // let coinBox = [
    //     '.coin-box', // 老版本, watching list
    //     '.coin', //新版本
    //     '.bangumi-coin-wrap' //旧版番剧
    //     '.coin-info' // 新版番剧
    // ]
    let logoShowStatus = []
    // let islogoShowTime = false
    let isMouseInLogo = false

    // ===========================================================================================
    // 没有改动类函数...
    // -------------------------------------------------------------------------------------------

    /**
     * 是否为老版本一般视频
     */
    function isOldVersion() {
        return $('i.icon-move.c-icon-moved').length > 0
    }

    /**
     * 是否为番剧(老版本)
     */
    function isBangumiOld() {
        return $('div.bangumi-coin-wrap').length > 0
    }

    function isBangumiNew() {
        return $('div.coin-info').length > 0
    }

    /**
     * 是否为稍后再看
     */
    function isWatchList() {
        return $('.bilibili-player-watchlater-nav-header').length > 0
    }

    /**
     * 是否为新版本一般视频
     */
    function isNewVersion() {
        return $('.coin:not(.u)').length > 0
    }
    /**
     * 返回投币状态
     */
    function isCoinTaken() {

        if (isBangumiOld()) {
            return $('i.bangumi-coin-d').is(':visible')
        } else if (isBangumiNew()) {
            return $('div.coin-info.active').length > 0
        } else if (isOldVersion()) {
            return $('i.icon-move.c-icon-moved').is(':visible')
        } else {
            // new version , watch list
            return $('span.coin.on').length == 1
        }

    }
    // /**
    //  * 是否关注up
    //  * bug : 新版, 联合创造返回错误结果
    //  */
    // function isFollowing() {
    //     if (isOldVersion() || isWatchList()) {
    //         return $('div.btn.followed').length > 0
    //     } else if (isBangumiOld()) {
    //         return $('.func-btns.followed').length > 0
    //     } else if (isNewVersion()) {
    //         return $('.b-gz.following').length > 0
    //     } else {
    //         console.log("take-coin : error : ", "unknown version")
    //         return undefined
    //     }
    // }

    function islogoForeShow() {
        if (isCoinTaken() && logoShowStatus.indexOf("actTakingCoin") == -1) {
            // console.log('forec : taken')
            return false
        } else {
            // console.log('forec : logoShowStatus ', logoShowStatus.length)
            return logoShowStatus.length > 0
        }
    }

    /**
     * 判断视频是否全屏状态
     */
    function isVideoInFullscreen() {
        if (document.fullscreenElement && document.fullscreenElement.id == 'bilibiliPlayer') {
            return true;
        }
        return false;
    }

    /**
     * 插入投币按钮的html代码
     * 包含 :
     * - id(string) : coin-gen
     * - status(string) : taken, taking, untaken, undefined
     * - text : 已投, 处理中, 投币, 错误
     */
    function genButton() {
        console.log('status : ', isCoinTaken())

        let strClass = ''
        let strStatus = ''
        let strText = ''

        if (isOldVersion()) {

        } else if (isBangumiOld()) {

        } else if (isWatchList()) {

        } else {

        }

        if (isCoinTaken()) {
            // 已投币
            strClass = 'success'
        } else {
            strClass = 'initial'
        }


        return '<div id="c4r-takecoin" style="width: 6.5%;padding-top: 6.5%;position: absolute;overflow: hidden;top: 0px;right: 0px;cursor: pointer;z-index: 100">\
        <div id="coin-gen" class="c4r '+ strClass + '" style="position: absolute;">\
        <svg class="c4r-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 162.65 162.65"><path d="M102.74,20.66C67.1,13.31,7,103.51,31.89,108.3c13.7,2.65,24.31-4.73,33.83-6.17l13,.31a1.1,1.1,0,0,1,1.43.57,1.08,1.08,0,0,1-.57,1.43c-11,10.93-6.16,8.84-19.75,13-30.17,9.27-57.47,3.07-43.47-33.52C27.2,55.58,71.12,5,105.59,12.2a4.46,4.46,0,1,1-2.85,8.46Z" style="fill:#414042;fill-rule:evenodd"/><path d="M88.73,71.39a74.35,74.35,0,0,1,9.86,22.25c9.45-11.26,23-18.66,35.69-5.72a3.28,3.28,0,0,1-4.22,5c-12.77-4.54-18.35-1.41-26.57,10.46a41.16,41.16,0,0,0-2.9,5.13c.22,8.56-.94,17.53-2.93,27.55-.71,3.53-4.87,24.87-13.45,16.15-6.79-6.9,2.87-39.31,6.21-46,.19-.39.4-.78.6-1.18C90.49,94,88.23,83.34,83.59,75.51a3.28,3.28,0,0,1,5.14-4.07Zm-3.29,73.12a2.36,2.36,0,0,0-.62.85C85.29,144.85,85.3,144.89,85.44,144.51Z" style="fill:#414042;fill-rule:evenodd"/></svg>\
        <svg class="bcoin" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28"><path d="M14.89 8.664h3.276c.541 0 .979-.4.979-.892s-.438-.892-.979-.892H9.681c-.541 0-.979.4-.979.892s.438.892.979.892h3.425v1.637a5.64 5.64 0 0 0-5.355 5.616v1.19a.892.892 0 1 0 1.784.001v-1.19a3.855 3.855 0 0 1 3.57-3.831v8.329a.892.892 0 0 0 1.784 0v-8.329a3.855 3.855 0 0 1 3.57 3.831v1.19a.892.892 0 0 0 1.784 0v-1.19a5.64 5.64 0 0 0-5.355-5.616V8.664zM14 26C7.373 26 2 20.627 2 14S7.373 2 14 2s12 5.373 12 12a12.002 12.002 0 0 1-12 12z"/></svg>\
        </div>\
        </div>'
    }
    /**
     * 返回投币按钮JQ Selector
     * @returns {string} JQ Selector
     */
    function getCoinBoxSelector() {
        if (isOldVersion()) {
            return '.coin-box'
        } else if (isBangumiOld()) {
            return '.bangumi-coin-wrap'
        }else if(isBangumiNew()){
            return 'div.coin-info'
        } else if (isWatchList()) {
            return '.coin-box'
        } else if (isNewVersion()) {
            return '.coin'
        } else {
            console.log("take-coin : error : ", "unknown version")
            return undefined
        }
    }

    /**
     * 返回确认投币的JQ Selector
     * @returns {string} JQ Selector
     */
    function getSureButtonSelector() {
        // console.log('version : ', isFollowing(), isOldVersion(), isBangumiOld(), isWatchList(),isNewVersion())
        if ($('.coin-bottom span.bi-btn').length > 0) { // 未订阅
            return '.coin-bottom span.bi-btn'
        } else {
            if (isOldVersion()) {
                return '.coin-operated-m .coin-bottom span.bi-btn'
            } else if (isBangumiOld() || isBangumiNew()) {
                return '.coin-bottom span.coin-btn'
            } else if (isWatchList()) {
                return '.coin-sure'
            } else if (isNewVersion()) {
                return '.coin-operated-m .coin-bottom span.bi-btn'
            } else {
                console.log("take-coin : error : ", "unknown version")
                return undefined
            }
        }

    }

    /**
     * 隐藏"投币确实"的selector
     */
    function getHideSureBackgroundSelector() {
        if (isWatchList()) {
            return '.coin-mask, .coin-wrap'
        } else if (isOldVersion() || isNewVersion()) {
            return '.bili-dialog-m'
        } else if (isBangumiOld()) {
            return '.dialog-mask'
        } else if(isBangumiNew()){
            return '.coin-dialog-mask'
        }
    }




    // ===========================================================================================
    // 功能函数
    // -------------------------------------------------------------------------------------------
    /**
     * 强制隐藏logo
     */
    function logoHide() {
        $('#coin-gen').addClass('c4rHide')
    }

    /**
     * 根据情况判断隐藏图标
     */
    function autoLogoHide() {
        if (!islogoForeShow() && !isMouseInLogo) {
            logoHide()
        }
    }

    /**
     * logo出现
     */
    function logoShow() {
        $('#coin-gen').removeClass('c4rHide')
    }

    /**
     * 在投币动作结束后, 改变投币按钮状态
     * @param {String} status taken, taking, untaken, undefined
     * 对应 -> 已投, 处理中, 投币, 错误
     */
    function changeCoinTaken(status) {
        if (status == 'taken') {
            $('#coin-gen').attr('class', 'c4r success surprise')
            setTimeout(() => {
                if (logoShowStatus.indexOf("actTakingCoin") != -1) {
                    delete logoShowStatus[logoShowStatus.indexOf("actTakingCoin")]
                }
                autoLogoHide()
                $('#coin-gen').removeClass('surprise')
            }, 1000);


        } else if (status == 'taking') {
            $('#coin-gen').attr('class', 'c4r initial surprise processing')
            // $('#coin-gen').attr('class', 'c4r success surprise')

        } else if (status == 'untaken') {
            $('#coin-gen').attr('class', 'c4r initial')

        } else {
            $('#coin-gen').attr('class', 'c4r initial error')
            if (logoShowStatus.indexOf("actCoinError") == -1) {
                logoShowStatus.push("actCoinError")
            }
        }

    }

    /**
     * 检测进度条
     */
    function watchVideo() {

        let strStartRemind = 'timeStartRemind'
        let strKeepRemind = 'timeKeepRemind'


        $('video').on("timeupdate", () => {

            let timePoint1_s = 3. / 4. * $('video').get(0).duration
            let timePoint1_e = 3. / 4. * $('video').get(0).duration + 3
            // console.log("video time : ", $('video').get(0).currentTime)

            if ($('video').get(0).currentTime > timePoint1_s
                && $('video').get(0).currentTime < timePoint1_e) {
                // 闪烁

                if (logoShowStatus.indexOf(strStartRemind) == -1) {
                    logoShowStatus.push(strStartRemind)
                }


                if ($("#coin-gen").hasClass("success") || $("#coin-gen").hasClass("error")) {

                } else {

                    $("#coin-gen").addClass('surprise fade')
                }

            } else if ($('video').get(0).currentTime > timePoint1_e) {

                if (logoShowStatus.indexOf(strStartRemind) != -1) {
                    delete logoShowStatus[logoShowStatus.indexOf(strStartRemind)]
                }


                if (logoShowStatus.indexOf(strKeepRemind) == -1) {
                    logoShowStatus.push(strKeepRemind)
                }

                if ($("#coin-gen").hasClass("success") || $("#coin-gen").hasClass("error")) {

                } else {

                    $("#coin-gen").removeClass('fade').addClass('surprise')
                }
            }
            else {

                // $("#coin-gen").removeClass('surprise')
            }

            if (islogoForeShow()) {
                logoShow()
            }
        });
    }

    /**
     * 视频fullscreen时候要做的事情
     */
    function processFullScreen() {

        if (isVideoInFullscreen()) { // 视频为全屏

            if (isOldVersion() || isWatchList() || isBangumiOld() || isBangumiNew()) {
                console.log("Bcoin : start watching hide bar")
                observerHide.observe($('.bilibili-player-video-control').get(0),
                    {
                        subtree: false, childList: false, characterData: false, attributes: true,
                        attributeFilter: ["style"], attributeOldValue: true, characterDataOldValue: false
                    })
            } else {
                console.log("Bcoin : new version")
                observerHide.observe($('#bilibiliPlayer > div.bilibili-player-area').get(0),
                    {
                        subtree: false, childList: false, characterData: false, attributes: true,
                        attributeFilter: ["class"], attributeOldValue: true, characterDataOldValue: false
                    })
            }

        } else { // 视频退出全屏

            observerHide.disconnect()
            // $('#coin-gen').show()
            logoShow()
        }

        // 加载watching list
        // if (isVideoInFullscreen()) {
        //     $("#bcoin-watch-list").append($(".bilibili-player-wraplist").html())
        // } else {
        //     $("#bcoin-watch-list").empty()
        // }
    }

    /**
     * 实际运行部分
     */
    function watching() {
        // 添加按钮

        console.log("take-coin : add button")
        $('#c4r-takecoin').remove()

        logoShowStatus = []
        if (isOldVersion() ||  isWatchList() || isBangumiOld()) {
            console.log("oldversion")
            if ($('.bilibili-player-video-wrap').length == 0) {
                let callbackPlayer = function (mutationList, observer) {
                    // console.log("coin change : ", mutationList)
                    mutationList.forEach((mutation) => {
                        // if($(mutation.target).is('.van-icon-videodetails_throw')){
                        if ($('.bilibili-player-video-wrap').length > 0 && $('#coin-gen').length == 0) {
                            // $('#c4r-takecoin').remove()
                            $('.bilibili-player-video-wrap').append(genButton())
                            observer.disconnect()
                            console.log('disconnect coin observe')
                        }
                        // }
                    })

                }
                let observerPlayer = new MutationObserver(callbackPlayer)
                observerPlayer.observe($('#bilibiliPlayer').get(0),
                    {
                        subtree: true, childList: true, characterData: false, attributes: true,
                        attributeOldValue: false, characterDataOldValue: false
                    })
            } else {
                $('#c4r-takecoin').remove()
                $('.bilibili-player-video-wrap').append(genButton())
            }

        } else if(isNewVersion()){
            console.log("new version")
            $('#c4r-takecoin').remove()
            $('#bilibiliPlayer').append(genButton())
            if (!$('.coin').hasClass('on')) {
                observerNewVersionCoin.observe($('.coin').get(0),
                {
                    subtree: true, childList: true, characterData: false, attributes: true,
                    attributeFilter: ["class"], attributeOldValue: false, characterDataOldValue: false
                })
            }

        }else if(isBangumiNew()){
            console.log("Bangumi New version")
            $('#c4r-takecoin').remove()
            $('#bilibiliPlayer').append(genButton())
            if ($('.coin-info span').text().trim() == '--' ) {
                observerBangumiNewCoin.observe($('.coin-info').get(0),
                    {
                        subtree: true, childList: true, characterData: true, attributes: false,
                        attributeOldValue: false, characterDataOldValue: false
                    })
            }
        }else{
            console.log("unknown version")
        }


        processFullScreen()

        watchVideo()

    }

    // ===========================================================================================
    // observation
    // -------------------------------------------------------------------------------------------
    /**
     * 检查是否视频周边控制器隐藏状态是否变化
     */
    let callbackHide = function (mutationList, observer) {
        // console.log(mutationList)
        mutationList.forEach((mutation) => {
            // console.log(mutation.oldValue, $(".bilibili-player-video-control").attr('style'))
            if (isOldVersion() || isWatchList() || isBangumiOld() || isBangumiNew()) {
                if ($(".bilibili-player-video-control").attr('style') == 'opacity: 0;' ||
                    $(".bilibili-player-video-control").attr('style') == 'opacity: 1;') {
                    if ($(".bilibili-player-video-control").attr('style') == 'opacity: 0;') {
                        // console.log("Bcoin : hide")
                        // autoLogoHide()
                    } else {
                        // console.log("Bcoin : show")
                        // $('#coin-gen').show()
                        // logoShow()
                    }
                }
            } else {
                // 新版
                if ($("#bilibiliPlayer > div.bilibili-player-area").hasClass('video-control-show')) {

                    // $('#coin-gen').show()
                    // logoShow()
                } else {
                    // autoLogoHide()

                }

            }
        })

    }
    let observerHide = new MutationObserver(callbackHide)

    //-------------------------------------------------------------------------------------------
    /**
     * 新版coin图标会晚一点加载出来, 用来等待加载coin
     */
    let callbackNewVersionCoin = function (mutationList, observer) {
        // console.log("coin change : ", mutationList)
        mutationList.forEach((mutation) => {
            if($(mutation.target).is('span.coin')){
            // console.log($.trim($('.coin').text()))
            // if ($('.coin').hasClass('on')) {
                $('#c4r-takecoin').remove()
                $('#bilibiliPlayer').append(genButton())
                // observer.disconnect()
                // console.log('disconnect coin observe')
            }
            // }
        })

    }
    let observerNewVersionCoin = new MutationObserver(callbackNewVersionCoin)

    /**
     * 新版banggumi coin图标会晚一点加载出来, 用来等待加载coin
     */
    let callbackBangumiNewCoin = function (mutationList, observer) {
        // console.log("coin change : ", mutationList)
        mutationList.forEach((mutation) => {
            // if($(mutation.target).is('.van-icon-videodetails_throw')){
            // console.log($.trim($('.coin').text()))
            if ($('.coin-info span').text().trim() != '--' ) {
                $('#c4r-takecoin').remove()
                $('#bilibiliPlayer').append(genButton())
                observer.disconnect()
                // console.log('disconnect coin observe')
            }
            // }
        })

    }
    let observerBangumiNewCoin = new MutationObserver(callbackBangumiNewCoin)

    //-------------------------------------------------------------------------------------------
    /**
     * 检测video变化, 开始添加按钮
     */
    let callbackVideo = function (mutationList, observer) {
        // console.log(mutationList)
        mutationList.forEach((mutation) => {

            // 旧版, 以及发生视频变化
            if ($(mutation.target).hasClass('bilibili-player-video')) {
                console.log('take-coin : 视频变更 ', mutation)
                // console.log('take-coin : 视频变更...')

                // 添加按钮
                // if ($('#coin-gen').length == 0) {
                // watching()
                // }

                observerVideo.disconnect()
                console.log('take-coin : continue observing...')
                observerVideo.observe($('.player').get(0),
                    {
                        subtree: true, childList: true, characterData: false, attributes: true,
                        attributeFilter: ["src"], attributeOldValue: false, characterDataOldValue: false
                    })
                watching()
            }
        })

    }
    let observerVideo = new MutationObserver(callbackVideo)

    //-------------------------------------------------------------------------------------------
    /**
     * 等待投币确认按钮弹出
     */
    let callbackCoinBox = function (mutationList, observer) {

        let button = getSureButtonSelector()
        let isClicked = false
        let isDisconnect = false

        let hideSelector = getHideSureBackgroundSelector()
        // if (isWatchList()) {
        //     hideSelector = '.coin-mask, .coin-wrap'
        // } else if (isOldVersion() || isNewVersion()) {
        //     hideSelector = '.bili-dialog-m'
        // } else if (isBangumiOld()) {
        //     hideSelector = '.dialog-mask'
        // }
        // console.log(button, $(button).length, hideSelector, "callbackCoinBox : ", mutationList)
        mutationList.forEach((mutation) => {
            if ((!isClicked) && mutation.addedNodes.length > 0 && $(button).length > 0) {

                // console.log("take-coin :", "click")
                $(hideSelector).css('opacity', '0')
                $(button).get(0).click()
                isClicked = true

            }

            if ((!isDisconnect) && mutation.removedNodes.length > 0) {
                // console.log("take-coin :", "remove surebutton")
                setTimeout(() => {
                    console.log('check : ', isCoinTaken())
                    if (isCoinTaken()) {
                        changeCoinTaken('taken')

                    } else {
                        changeCoinTaken('unknown')
                    }

                }, 1500)
                observer.disconnect()

                isDisconnect = true

            }
        })
    }
    let observerCoinBox = new MutationObserver(callbackCoinBox)

    // ===========================================================================================
    // 全局listener
    // -------------------------------------------------------------------------------------------
    /**
     * 全屏变化
     */
    document.onfullscreenchange = function (event) {
        console.log("FULL SCREEN CHANGE")
        processFullScreen()
    }

    //-------------------------------------------------------------------------------------------
    // 检测按钮被按
    // 为防止按钮被删, $(document).on 必须放在这里
    $(document).on('click', function (event) {

        // console.log("click : ", event)
        if ($(event.target).closest('#coin-gen.initial').length > 0) {
            console.log("take-coin : 投币")
            // if (isOldVersion()) {
            //     // console.log("old version")
            //     $('.coin-box').click()
            // } else {
            //     // console.log("other version")
            //     // new version || watchlist || bangumiOld
            //     $('.coin').click()
            // }

            let CoinBoxObserverSelector = ''
            if (isWatchList()) {
                CoinBoxObserverSelector = 'div[coinnum]'
            } else if (isOldVersion() || isNewVersion()) {
                CoinBoxObserverSelector = '#app > div'
            } else if (isBangumiOld() || isBangumiNew()) {
                CoinBoxObserverSelector = '#app'
            }
            observerCoinBox.observe($(CoinBoxObserverSelector).get(0),
                {
                    subtree: true, childList: true, characterData: false, attributes: false,
                    // attributeFilter: ["src"],
                    attributeOldValue: false, characterDataOldValue: false
                })

            let coinButton = getCoinBoxSelector()
            console.log(coinButton, $(coinButton).length)
            $(coinButton).get(0).click()

            console.log("changeCoinTaken...")
            changeCoinTaken('taking')
            if (logoShowStatus.indexOf("actTakingCoin") == -1) {
                logoShowStatus.push("actTakingCoin")
            }
        }

        if ($(event.target).closest('#coin-gen.success').length > 0) {
            $('#coin-gen').addClass('processing')
            setTimeout(() => {
                $('#coin-gen').removeClass('processing')
            }, 2000);
        }
    })

    $(document).on('mouseover', function (event) {
        if ($(event.target).closest('#coin-gen').length > 0) {
            // console.log('take-coin :', 'mousenter')
            isMouseInLogo = true
            // logoShow()
        }
    })

    $(document).on('mouseout', function (event) {
        if ($(event.target).closest('#coin-gen').length > 0) {
            // console.log('take-coin :', 'leave')
            isMouseInLogo = false
            autoLogoHide()
        }
    })

    let mousemoveTimeoutID = 0
    $(document).on('mousemove', function (event) {
        // console.log('take-coin :', 'mousemove out')
        if ($('#coin-gen').length > 0) {
            // console.log('take-coin :', 'mousemove')
            logoShow()

            if (mousemoveTimeoutID) {
                clearTimeout(mousemoveTimeoutID)
            }
            mousemoveTimeoutID = setTimeout(() => {
                // console.log('take-coin :', 'Hide')
                autoLogoHide()
            }, 1500);
        }
    })


    // ===========================================================================================
    // ready
    // -------------------------------------------------------------------------------------------
    $(document).ready(function () {
        console.log('take-coin : ready ...')


        if($('.player').length > 0){
            // 添加按钮
            watching()

            // 检测按钮消失, 重新加载
            console.log('take-coin : observing...', $('.player').length)
            observerVideo.observe($('.player').get(0),
                {
                    subtree: true, childList: true, characterData: false, attributes: true,
                    attributeFilter: ["src"], attributeOldValue: false, characterDataOldValue: false
                })
        }else{
            // 在列表页面
            // 通过检测是否含有.player元素判断
            let callbackGoToWatch = function (mutationList, observer) {
                if ($('.player').length > 0) {
                    // 添加按钮
                    watching()

                    // 检测按钮消失, 重新加载
                    console.log('take-coin : observing...', $('.player').length)
                    observerVideo.observe($('.player').get(0),
                        {
                            subtree: true, childList: true, characterData: false, attributes: true,
                            attributeFilter: ["src"], attributeOldValue: false, characterDataOldValue: false
                        })
                    observer.disconnect()
                }
            }
            let observerGoToWatch = new MutationObserver(callbackGoToWatch)

            let strWaitLoadPlayer = ''
            if($('.app-wrap').length > 0 ){
                strWaitLoadPlayer = '.app-wrap'
            }else if($('#app').length > 0){
                strWaitLoadPlayer = '#app'
            }
            observerGoToWatch.observe($(strWaitLoadPlayer).get(0),
                {
                    subtree: true, childList: true, characterData: false, attributes: true,
                    attributeFilter: ["src"], attributeOldValue: false, characterDataOldValue: false
                })
        }

    })


})();