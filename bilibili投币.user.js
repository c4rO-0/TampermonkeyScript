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

    function isBangumi(){
        return $('div.bangumi-coin-wrap').length > 0
    }

    /**
     * 返回投币状态
     */
    function isCoinTaken() {

        if(isBangumi()){
            return $('i.bangumi-coin-d').is(':visible')
        }else{
            if (isOldVersion()) {
                return $('i.icon-move.c-icon-moved').is(':visible')
            } else {
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
    function genButtonCoin() {
        console.log('status : ', isCoinTaken())
        if (isCoinTaken()) {
            // 已投币
            return '<button id="coin-gen" style="font-size:20px;color:blue;" status="taken">已投</button>'
        } else {
            return '<button id="coin-gen" style="font-size:20px;color:red;" status="untaken">投币</button>'
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


    // ===========================================================================================
    let callbackVideo = function (mutationList, observer) {
        // console.log(mutationList)
        mutationList.forEach((mutation) => {
            if ($(mutation.target).hasClass('bilibili-player-video')) {
                // console.log('take-coin : ', mutation, mutation.removedNodes.length)
                // console.log('take-coin : 视频变更...')
                watching()
                observer.disconnect()
                console.log('take-coin : continue observing...')
                observerVideo.observe($('.bilibili-player-video-wrap').get(0),
                    {
                        subtree: true, childList: true, characterData: false, attributes: true,
                        attributeFilter: ["src"], attributeOldValue: false, characterDataOldValue: false
                    })


            }
        })

    }
    let observerVideo = new MutationObserver(callbackVideo)


    console.log('take-coin : ready ...')
    document.onfullscreenchange = function (event) {
        console.log("FULL SCREEN CHANGE")

        if (isVideoInFullscreen()) {

            watching()
            console.log('take-coin : observing...')
            observerVideo.observe($('.bilibili-player-video-wrap').get(0),
                {
                    subtree: true, childList: true, characterData: false, attributes: true,
                    attributeFilter: ["src"], attributeOldValue: false, characterDataOldValue: false
                })
        } else {
            // 移除
            $('#coin-gen').remove()
            console.log(isVideoInFullscreen(), $('#coin-gen').length)
            console.log(document.fullscreenElement)
        }
    }



    function watching() {
        // 添加按钮
        if (isVideoInFullscreen()) {
            console.log("take-coin : add button")
            $('#coin-gen').remove()
            $('#bilibiliPlayer').append(genButtonCoin())

            $(document).on('click', '#coin-gen[status="untaken"]', function (event) {
                console.log("take-coin : 投币")
                if (isOldVersion()) {
                    $('.coin-box').click()
                } else {
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

    }


})();