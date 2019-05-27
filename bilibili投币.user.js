// ==UserScript==
// @name         bilibili投币
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.bilibili.com/watchlater/*
// @match        https://www.bilibili.com/video/*
// @match        https://www.bilibili.com/bangumi/play/*
// @require      https://code.jquery.com/jquery-latest.js
// @grant        GM_addStyle
// ==/UserScript==

(function () {
    'use strict';

    //玩法：修改第二层div.c4r的类，可改的类名包括（.initial .success .error .processing .surprise .hide），其中.inital和.success需要保证有且仅有一个存在。
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
  height:20px;
  width:20px;
  top:-4px;
  right:-24px;
  border-radius:10px;
}
.success {
  background-color: #ffffff;
  height:20px;
  width:20px;
  top:-4px;
  right:-24px;
  border-radius:10px;
}
.error {
  background-color: #fd676f;
}
.surprise, .c4r:hover {
  animation:big 0.5s ease 1 forwards;
}
.c4r {
  transition: opacity 0.25s ease;
}
.hide{
  opacity: 0;
}
@keyframes big{
  to{
    transform: scale(2) translate(-7px,7px);
  }
}
.bcoin {
  fill: #1890ff;
}
.c4r.initial .c4r-logo,
.c4r.success .coin{
  display:;
}
.c4r.initial .coin,
.c4r.success .c4r-logo{
  display: none;
}
`)

    // let sureButton = [
    //     '.coin-operated-m .coin-bottom span.bi-btn', // 新, 老版本 
    //     '.coin-sure', // watching list
    //     '.coin-bottom span.bi-btn', // 未订阅
    //     '.coin-bottom span.coin-btn' // 番剧
    // ]

    // let coinBox = [
    //     '.coin-box', // 老版本, watching list
    //     '.coin', //新版本
    //     '.bangumi-coin-wrap' //番剧
    // ]

    /**
     * 返回投币按钮JQ Selector
     * @returns {string} JQ Selector
     */
    function getCoinBoxSelector() {
        if (isOldVersion()) {
            return '.coin-box'
        } else if (isBangumi()) {
            return '.bangumi-coin-wrap'
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
        // console.log('version : ', isFollowing(), isOldVersion(), isBangumi(), isWatchList(),isNewVersion())
        if ($('.coin-bottom span.bi-btn').length > 0) { // 未订阅
            return '.coin-bottom span.bi-btn'
        } else {
            if (isOldVersion()) {
                return '.coin-operated-m .coin-bottom span.bi-btn'
            } else if (isBangumi()) {
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
     * 是否为老版本一般视频
     */
    function isOldVersion() {
        return $('i.icon-move.c-icon-moved').length > 0
    }

    /**
     * 是否为番剧(不区分新老版本)
     */
    function isBangumi() {
        return $('div.bangumi-coin-wrap').length > 0
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

        if (isBangumi()) {
            return $('i.bangumi-coin-d').is(':visible')
        } else {
            if (isOldVersion()) {
                return $('i.icon-move.c-icon-moved').is(':visible')
            } else {
                // new version , watch list, bangumi
                return $('span.coin.on').length == 1
            }
        }

    }
    /**
     * 是否关注up
     * bug : 新版, 联合创造返回错误结果
     */
    function isFollowing() {
        if (isOldVersion() || isWatchList()) {
            return $('div.btn.followed').length > 0
        } else if (isBangumi()) {
            return $('.func-btns.followed').length > 0
        } else if (isNewVersion()) {
            return $('.b-gz.following').length > 0
        } else {
            console.log("take-coin : error : ", "unknown version")
            return undefined
        }
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

        } else if (isBangumi()) {

        } else if (isWatchList()) {

        } else {

        }

        if (isCoinTaken()) {
            // 已投币
            strClass = 'success'
        } else {
            strClass = 'initial'
        }


        return '<div id="c4r-oxgs73w7rh" style="height: 40px;width: 40px;position: absolute;overflow: hidden;top: 0px;right: 0px;cursor: pointer;z-index: 999">\
        <div id="coin-gen" class="c4r '+ strClass + '" style="position: relative;">\
        <svg class="c4r-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 162.65 162.65"><path d="M102.74,20.66C67.1,13.31,7,103.51,31.89,108.3c13.7,2.65,24.31-4.73,33.83-6.17l13,.31a1.1,1.1,0,0,1,1.43.57,1.08,1.08,0,0,1-.57,1.43c-11,10.93-6.16,8.84-19.75,13-30.17,9.27-57.47,3.07-43.47-33.52C27.2,55.58,71.12,5,105.59,12.2a4.46,4.46,0,1,1-2.85,8.46Z" style="fill:#414042;fill-rule:evenodd"/><path d="M88.73,71.39a74.35,74.35,0,0,1,9.86,22.25c9.45-11.26,23-18.66,35.69-5.72a3.28,3.28,0,0,1-4.22,5c-12.77-4.54-18.35-1.41-26.57,10.46a41.16,41.16,0,0,0-2.9,5.13c.22,8.56-.94,17.53-2.93,27.55-.71,3.53-4.87,24.87-13.45,16.15-6.79-6.9,2.87-39.31,6.21-46,.19-.39.4-.78.6-1.18C90.49,94,88.23,83.34,83.59,75.51a3.28,3.28,0,0,1,5.14-4.07Zm-3.29,73.12a2.36,2.36,0,0,0-.62.85C85.29,144.85,85.3,144.89,85.44,144.51Z" style="fill:#414042;fill-rule:evenodd"/></svg>\
        <svg class="bcoin" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28"><path d="M14.89 8.664h3.276c.541 0 .979-.4.979-.892s-.438-.892-.979-.892H9.681c-.541 0-.979.4-.979.892s.438.892.979.892h3.425v1.637a5.64 5.64 0 0 0-5.355 5.616v1.19a.892.892 0 1 0 1.784.001v-1.19a3.855 3.855 0 0 1 3.57-3.831v8.329a.892.892 0 0 0 1.784 0v-8.329a3.855 3.855 0 0 1 3.57 3.831v1.19a.892.892 0 0 0 1.784 0v-1.19a5.64 5.64 0 0 0-5.355-5.616V8.664zM14 26C7.373 26 2 20.627 2 14S7.373 2 14 2s12 5.373 12 12a12.002 12.002 0 0 1-12 12z"/></svg>\
        </div>\
        </div>'


    }

    function logoHide() {
        $('#coin-gen').addClass('hide')
    }

    function logoShow() {
        $('#coin-gen').removeClass('hide')
    }

    /**
     * 在投币动作结束后, 改变投币按钮状态
     * @param {String} status taken, taking, untaken, undefined 
     * 对应 -> 已投, 处理中, 投币, 错误
     */
    function changeCoinTaken(status) {
        if (status == 'taken') {
            $('#coin-gen').attr('class', 'c4r success')

        } else if (status == 'taking') {
            $('#coin-gen').attr('class', 'c4r success processing')

        } else if (status == 'untaken') {
            $('#coin-gen').attr('class', 'c4r initial')

        } else {
            $('#coin-gen').attr('class', 'c4r initial error')

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


    // 检查是否隐藏
    let callbackHide = function (mutationList, observer) {
        // console.log(mutationList)
        mutationList.forEach((mutation) => {
            // console.log(mutation.oldValue, $(".bilibili-player-video-control").attr('style'))
            if (isOldVersion() || isWatchList() || isBangumi()) {
                if ($(".bilibili-player-video-control").attr('style') == 'opacity: 0;' ||
                    $(".bilibili-player-video-control").attr('style') == 'opacity: 1;') {
                    if ($(".bilibili-player-video-control").attr('style') == 'opacity: 0;') {
                        // console.log("Bcoin : hide")
                        // $('#coin-gen').hide()
                        // logoHide()
                    } else {
                        // $('#coin-gen').show()
                        // logoShow()
                    }
                }
            } else {
                // 新版
                if ($("#bilibiliPlayer > div.bilibili-player-area").hasClass('video-control-show')) {
                    // console.log("Bcoin : hide")
                    // $('#coin-gen').show()
                    // logoShow()
                } else {
                    // $('#coin-gen').hide()
                    // logoHide()
                }

            }
        })

    }
    let observerHide = new MutationObserver(callbackHide)

    /**
     * 视频fullscreen时候要做的事情
     */
    function processFullScreen() {

        if (isVideoInFullscreen()) { // 视频为全屏

            if (isOldVersion() || isWatchList() || isBangumi()) {
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
            // logoShow()
        }

        // 加载watching list
        // if (isVideoInFullscreen()) {
        //     $("#bcoin-watch-list").append($(".bilibili-player-wraplist").html())
        // } else {
        //     $("#bcoin-watch-list").empty()
        // }
    }

    // ===========================================================================================
    // 运行主体函数
    // -------------------------------------------------------------------------------------------    
    // 新版用来等待加载coin
    let callbackCoin = function (mutationList, observer) {
        // console.log("coin change : ", mutationList)
        mutationList.forEach((mutation) => {
            // if($(mutation.target).is('.van-icon-videodetails_throw')){
            // console.log($.trim($('.coin').text()))
            if ($('.coin').hasClass('on')) {
                $('#c4r-oxgs73w7rh').remove()
                $('#bilibiliPlayer').append(genButton())
                observer.disconnect()
                // console.log('disconnect coin observe')         
            }
            // }
        })

    }
    let observerCoin = new MutationObserver(callbackCoin)
    /**
     * 实际运行部分
     */
    function watching() {
        // 添加按钮

        console.log("take-coin : add button")
        $('#c4r-oxgs73w7rh').remove()

        if (!isNewVersion()) {
            console.log("oldversion")
            if ($('.bilibili-player-video-wrap').length == 0) {
                let callbackPlayer = function (mutationList, observer) {
                    // console.log("coin change : ", mutationList)
                    mutationList.forEach((mutation) => {
                        // if($(mutation.target).is('.van-icon-videodetails_throw')){
                        if ($('.bilibili-player-video-wrap').length > 0 && $('#coin-gen').length == 0) {
                            // $('#c4r-oxgs73w7rh').remove()
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
                $('#c4r-oxgs73w7rh').remove()
                $('.bilibili-player-video-wrap').append(genButton())
            }

        } else {
            console.log("new version")
            $('#c4r-oxgs73w7rh').remove()
            $('#bilibiliPlayer').append(genButton())
            observerCoin.observe($('.coin').get(0),
                {
                    subtree: true, childList: true, characterData: false, attributes: true,
                    attributeFilter: ["class"], attributeOldValue: false, characterDataOldValue: false
                })
        }


        processFullScreen()

        watchVideo()


    }

    // ===========================================================================================
    // 检测和开始添加按钮
    // -------------------------------------------------------------------------------------------
    let callbackVideo = function (mutationList, observer) {
        // console.log(mutationList)
        mutationList.forEach((mutation) => {

            // 旧版, 以及发生视频变化
            if ($(mutation.target).hasClass('bilibili-player-video')) {
                console.log('take-coin : ', mutation)
                // console.log('take-coin : 视频变更...')

                // 添加按钮
                // if ($('#coin-gen').length == 0) {
                watching()
                // }


                observer.disconnect()
                console.log('take-coin : continue observing...')
                observerVideo.observe($('.player').get(0),
                    {
                        subtree: true, childList: true, characterData: false, attributes: true,
                        attributeFilter: ["src"], attributeOldValue: false, characterDataOldValue: false
                    })
            }
        })

    }
    let observerVideo = new MutationObserver(callbackVideo)

    $(document).ready(function () {
        console.log('take-coin : ready ...')
        if ($('.watch-later-list').length > 0) {
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
            observerGoToWatch.observe($('.app-wrap').get(0),
                {
                    subtree: true, childList: true, characterData: false, attributes: true,
                    attributeFilter: ["src"], attributeOldValue: false, characterDataOldValue: false
                })

        } else {
            // 添加按钮
            watching()

            // 检测按钮消失, 重新加载
            console.log('take-coin : observing...', $('.player').length)
            observerVideo.observe($('.player').get(0),
                {
                    subtree: true, childList: true, characterData: false, attributes: true,
                    attributeFilter: ["src"], attributeOldValue: false, characterDataOldValue: false
                })
        }

    })

    // ===========================================================================================
    // 检测到全屏变化
    // -------------------------------------------------------------------------------------------
    document.onfullscreenchange = function (event) {
        console.log("FULL SCREEN CHANGE")
        processFullScreen()
    }

    // 检测按钮被按
    // 为防止按钮被删, $(document).on 必须放在这里
    $(document).on('click', function (event) {

        // console.log("click : ", event)
        if ($(event.target).closest('#coin-gen.initial').length) {
            console.log("take-coin : 投币")
            if (isOldVersion()) {
                // console.log("old version")
                $('.coin-box').click()
            } else {
                // console.log("other version")
                // new version || watchlist || bangumi
                $('.coin').click()
            }

            // 等待投币确认按钮弹出
            let callbackCoinBox = function (mutationList, observer) {

                let button = getSureButtonSelector()
                let isClicked = false
                let isDisconnect = false

                let hideSelector = ''
                if (isWatchList()) {
                    hideSelector = '.coin-mask, .coin-wrap'
                } else if (isOldVersion() || isNewVersion()) {
                    hideSelector = '.bili-dialog-m'
                } else if (isBangumi()) {
                    hideSelector = '.dialog-mask'
                }
                console.log(button, $(button).length, hideSelector, "callbackCoinBox : ", mutationList)
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
                        }, 1000)
                        observer.disconnect()

                        isDisconnect = true

                    }
                })
            }

            let observerCoinBox = new MutationObserver(callbackCoinBox)

            let CoinBoxObserverSelector = ''
            if (isWatchList()) {
                CoinBoxObserverSelector = 'div[coinnum]'
            } else if (isOldVersion() || isNewVersion()) {
                CoinBoxObserverSelector = '#app > div'
            } else if (isBangumi()) {
                CoinBoxObserverSelector = '#app'
            }
            observerCoinBox.observe($(CoinBoxObserverSelector).get(0),
                {
                    subtree: true, childList: true, characterData: false, attributes: false,
                    // attributeFilter: ["src"], 
                    attributeOldValue: false, characterDataOldValue: false
                })

            let coinButton = getCoinBoxSelector()
            $(coinButton).get(0).click()

            console.log("changeCoinTaken...")
            changeCoinTaken('taking')

            // setTimeout(() => {
            //     console.log('take-coin : click coin...')

            //     let button = getSureButtonSelector()
            //     $(button).get(0).click()

            //     setTimeout(() => {
            //         console.log('check : ', isCoinTaken())
            //         if (isCoinTaken()) {
            //             changeCoinTaken('taken')
            //         } else {
            //             changeCoinTaken('unknown')
            //         }
            //     }, 2000)
            // }, 2000);
        }


    })

    function watchVideo() {
        $('video').on("timeupdate", () => {
            // console.log("video time : ", $('video').get(0).currentTime)
            if ($('video').get(0).currentTime / $('video').get(0).duration > 3. / 4.) {
                $("#coin-gen").addClass('surprise')
            } else {
                $("#coin-gen").removeClass('surprise')
            }
        });
    }



})();