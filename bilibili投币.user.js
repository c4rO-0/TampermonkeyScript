// ==UserScript==
// @name         bilibili投币
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.bilibili.com/watchlater/
// @match        https://www.bilibili.com/video/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // let buttonCoin = '<button id="corn-gen" style="font-size:20px;color:red;">test</button>'

    function isCoinTaken(){
        return $('i.icon-move.c-icon-moved').is(':visible')
    }

    function genButtonCoin() {
        if(isCoinTaken()){
            // 已投币
            return '<button id="corn-gen" style="font-size:20px;color:blue;" status="taken">已投</button>'
        }else{
            return '<button id="corn-gen" style="font-size:20px;color:red;" status="untaken">投币</button>'
        }
        
    }

    function changeCoinTaken(){
        $('#corn-gen').attr('status','taken')
        $('#corn-gen').text('已投')        
    }

    function isVideoInFullscreen() {
        if (document.fullscreenElement && document.fullscreenElement.id == 'bilibiliPlayer') {
            return true;
        }
        return false;
    }

    document.onfullscreenchange = function (event) {
        console.log("FULL SCREEN CHANGE")

        if (isVideoInFullscreen()) {
            console.log("add button")
            $('#bilibiliPlayer').append(genButtonCoin())
        } else {
            // 移除
            $('#corn-gen').remove()
            console.log(isVideoInFullscreen(), $('#corn-gen').length)
            console.log(document.fullscreenElement)
        }


    }

    $(document).on('click', '#corn-gen[status="untaken"]', function (event) {
        console.log("投币")
        $('.coin-box').click()
        setTimeout(() => {
            $('.coin-operated-m .coin-bottom span.bi-btn').click()
            setTimeout(() => {
                if($('i.icon-move.c-icon-moved').is(':visible')){
                    changeCoinTaken()
                }
            },1000)
        }, 1000);

    })
    // if (document.getElementById("myVideo")) {
    //     console.log("found player...")
    //     // let isNewVersion = true
    //     // let videoID = undefined
    //     // let alreadyCorn = false
    //     // videoTimeUpdate = function () {

    //     //     let rate = 3. / 4.
    //     //     let elVideo = $("#video").get[0]
    //     //     let currentTime = elVideo.currentTime
    //     //     let duration = elVideo.duration
    //     //     if (currentTime / duration > rate && !alreadyCorn) {

    //     //         if (isNewVerson) {


    //     //         }else{
    //     //             // 投币


    //     //         }
    //     //     }

    //     // }
    //     // $("#video").bind('timeupdate', videoTimeUpdate);



    //     };


})();