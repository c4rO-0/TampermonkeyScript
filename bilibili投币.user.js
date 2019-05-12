// ==UserScript==
// @name         bilibili投币
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.bilibili.com/watchlater/
// @match        https://www.bilibili.com/video/*
// @grant        none
// @require      https://code.jquery.com/jquery-latest.js
// ==/UserScript==

(function () {
    'use strict';

    // let buttonCoin = '<button id="coin-gen" style="font-size:20px;color:red;">test</button>'
    /**
     * 判断新老版本
     */
    function isOldVersion() {
        return $('i.icon-move.c-icon-moved').length > 0
    }

    /**
     * 返回投币状态
     */
    function isCoinTaken() {

        if (isOldVersion()) {
            return $('i.icon-move.c-icon-moved').is(':visible')
        } else {
            return $('span.coin.on').length == 1
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
        if(status == 'taken'){
            $('#coin-gen').attr('status', 'taken')
            $('#coin-gen').text('已投')
        }else if(status =='taking'){
            $('#coin-gen').attr('status', 'taking')
            $('#coin-gen').text('处理中')

        }else if(status =='untaken'){
            $('#coin-gen').attr('status', 'untaken')
            $('#coin-gen').text('投币')
        }else{
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
    $(document).ready(function () {

        console.log('take-coin : ready ...')
        document.onfullscreenchange = function (event) {
            console.log("FULL SCREEN CHANGE")

            if (isVideoInFullscreen()) {
                console.log("take-coin : add button")
                $('#bilibiliPlayer').append(genButtonCoin())
            } else {
                // 移除
                $('#coin-gen').remove()
                console.log(isVideoInFullscreen(), $('#coin-gen').length)
                console.log(document.fullscreenElement)
            }


        }

        $(document).on('click', '#coin-gen[status="untaken"]', function (event) {
            console.log("take-coin : 投币")
            if (isOldVersion()) {
                $('.coin-box').click()
            } else {
                $('.coin').click()
            }
            changeCoinTaken('taking')
            setTimeout(() => {
                console.log('take-coin : click coin...')
                $('.coin-operated-m .coin-bottom span.bi-btn').click()
                setTimeout(() => {
                    console.log('check : ', isCoinTaken())
                    if (isCoinTaken()) {
                        changeCoinTaken('taken')
                    }else{
                        changeCoinTaken('unknown')
                    }
                }, 2000)
            }, 2000);

        })
    })


})();