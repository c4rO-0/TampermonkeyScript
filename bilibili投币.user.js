// ==UserScript==
// @name         bilibili投币
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.bilibili.com/watchlater/
// @match        https://www.bilibili.com/video/*
// @match        https://www.bilibili.com/bangumi/play/*
// @grant        none
// @require      https://code.jquery.com/jquery-latest.js
// ==/UserScript==

(function () {
    'use strict';

    let sureButton = [
        '.coin-operated-m .coin-bottom span.bi-btn', // 新, 老版本 
        '.coin-sure', // watching list
        '.coin-bottom span.bi-btn', // 未订阅
        '.coin-bottom span.coin-btn' // 番剧
    ]

    let coinBox = [
        '.coin-box', // 老版本
        '.coin', //新版本
        '.bangumi-coin-wrap' //番剧
    ]


    /**
     * 判断新老版本
     */
    function isOldVersion() {
        return $('i.icon-move.c-icon-moved').length > 0
    }

    function isBangumi() {
        return $('div.bangumi-coin-wrap').length > 0
    }

    function isWatchList() {
        return $('.bilibili-player-watchlater-nav-header').length > 0
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
     * 插入投币按钮的html代码
     * 包含 : 
     * - id(string) : coin-gen
     * - status(string) : taken, taking, untaken, undefined
     * - text : 已投, 处理中, 投币, 错误
     */
    function genButton() {
        console.log('status : ', isCoinTaken())
        if (isCoinTaken()) {
            // 已投币
            return '<div>\
            <button id="coin-gen" style="font-size:20px;color:blue;" status="taken">已投</button>\
            <div id="bcoin-watch-list"></div>\
            </div>'
        } else {
            return '<div>\
            <button id="coin-gen" style="font-size:20px;color:red;" status="untaken">投币</button>\
            <div id="bcoin-watch-list"></div>\
            </div>'
        }

    }

    /**
     * 在投币动作结束后, 改变投币按钮状态
     * @param {String} status taken, taking, untaken, undefined 
     * 对应 -> 已投, 处理中, 投币, 错误
     */
    function changeCoinTaken(status) {
        if (status == 'taken') {
            $('#coin-gen').attr('status', 'taken')
            $('#coin-gen').text('已投')
        } else if (status == 'taking') {
            $('#coin-gen').attr('status', 'taking')
            $('#coin-gen').text('处理中')

        } else if (status == 'untaken') {
            $('#coin-gen').attr('status', 'untaken')
            $('#coin-gen').text('投币')
        } else {
            $('#coin-gen').attr('status', 'undefined')
            $('#coin-gen').text('错误')
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
                        $('#coin-gen').hide()
                    } else {
                        $('#coin-gen').show()
                    }
                }
            } else {

                if ($("#bilibiliPlayer > div.bilibili-player-area").hasClass('video-control-show')) {
                    // console.log("Bcoin : hide")
                    $('#coin-gen').show()
                } else {
                    $('#coin-gen').hide()
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
            $('#coin-gen').show()
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
    /**
     * 实际运行部分
     */
    function watching() {
        // 添加按钮

        console.log("take-coin : add button")
        $('#coin-gen').remove()
        if(isOldVersion() || isWatchList() || isBangumi()){
            $('#bilibiliPlayer').append(genButton())
        }else{
            console.log($('#bilibiliPlayer .bilibili-player-video-top').length)
            $('#bilibiliPlayer .bilibili-player-video-top').append(genButton())
        }
        

        processFullScreen()

        // 检测按钮被按
        // 为防止按钮被删, $(document).on 必须放在这里
        $(document).on('click', '#coin-gen[status="untaken"]', function (event) {
            console.log("take-coin : 投币")
            if (isOldVersion()) {
                $('.coin-box').click()
            } else {
                // new version || watchlist || bangumi
                $('.coin').click()
            }
            coinBox.forEach((coinButton) => {
                // console.log(button, $(button).length)
                if ($(coinButton).length > 0) {
                    $(coinButton).get(0).click()
                }
            })

            changeCoinTaken('taking')
            setTimeout(() => {
                console.log('take-coin : click coin...')

                sureButton.forEach((button) => {
                    // console.log(button, $(button).length)
                    if ($(button).length > 0) {
                        $(button).get(0).click()
                    }
                })

                setTimeout(() => {
                    console.log('check : ', isCoinTaken())
                    if (isCoinTaken()) {
                        changeCoinTaken('taken')
                    } else {
                        changeCoinTaken('unknown')
                    }
                }, 2000)
            }, 2000);

        })

    }

    // ===========================================================================================
    // 检测和开始添加按钮
    // -------------------------------------------------------------------------------------------
    let callbackVideo = function (mutationList, observer) {
        // console.log(mutationList)
        mutationList.forEach((mutation) => {

            // 旧版, 以及发生视频变化
            if ($(mutation.target).hasClass('bilibili-player-video')) {
                // console.log('take-coin : ', mutation, mutation.removedNodes.length)
                // console.log('take-coin : 视频变更...')

                // 添加按钮
                if ($('#coin-gen').length == 0) {
                    watching()
                }


                observer.disconnect()
                console.log('take-coin : continue observing...')
                observerVideo.observe($('.player').get(0),
                    {
                        subtree: true, childList: true, characterData: false, attributes: true,
                        attributeFilter: ["src"], attributeOldValue: false, characterDataOldValue: false
                    })
            }

            //新版插入位置
            if( $(mutation.target).is('#bilibiliPlayer .bilibili-player-video-wrap')){
                // 添加按钮
                if ($('#coin-gen').length == 0) {
                    watching()
                }                
            }
        })

    }
    let observerVideo = new MutationObserver(callbackVideo)

    $(document).ready(function () {
        console.log('take-coin : ready ...')
        // 添加按钮
        watching()

        // 检测按钮消失, 重新加载
        console.log('take-coin : observing...', $('.player').length)
        observerVideo.observe($('.player').get(0),
            {
                subtree: true, childList: true, characterData: false, attributes: true,
                attributeFilter: ["src"], attributeOldValue: false, characterDataOldValue: false
            })
    })

    // ===========================================================================================
    // 检测到全屏变化
    // -------------------------------------------------------------------------------------------
    document.onfullscreenchange = function (event) {
        console.log("FULL SCREEN CHANGE")
        processFullScreen()
    }


})();