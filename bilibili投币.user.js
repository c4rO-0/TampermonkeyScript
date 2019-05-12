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

    // let buttonCoin = '<button id="coin-gen" style="font-size:20px;color:red;">test</button>'
    function isOldVersion(){
        return $('i.icon-move.c-icon-moved').length > 0
    }

    function isCoinTaken(){

        if(isOldVersion()){
            return $('i.icon-move.c-icon-moved').is(':visible')
        }else{
            return $('span.coin.on').length  == 1
        }
        
        
    }

    function genButtonCoin() {
        console.log('status : ', isCoinTaken())
        if(isCoinTaken()){
            // 已投币
            return '<button id="coin-gen" style="font-size:20px;color:blue;" status="taken">已投</button>'
        }else{
            return '<button id="coin-gen" style="font-size:20px;color:red;" status="untaken">投币</button>'
        }
        
    }

    function changeCoinTaken(){
        $('#coin-gen').attr('status','taken')
        $('#coin-gen').text('已投')        
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
            // $('#coin-gen').remove()
            console.log(isVideoInFullscreen(), $('#coin-gen').length)
            console.log(document.fullscreenElement)
        }


    }

    $(document).on('click', '#coin-gen', function (event) {
        console.log("投币")
        if(isOldVersion){
            $('.coin-box').click()
        }else{
            $('.coin').click()
        }
        setTimeout(() => {
            console.log('click coin...')
            $('.coin-operated-m .coin-bottom span.bi-btn').click()
            setTimeout(() => {
                console.log('check : ', isCoinTaken())
                if(isCoinTaken()){
                    changeCoinTaken()
                }
            },2000)
        }, 2000);

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