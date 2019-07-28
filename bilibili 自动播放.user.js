// ==UserScript==
// @name         bilibili 自动播放
// @namespace    www.papercomment.tech
// @version      0.10
// @description  共有4个功能。自动播放，键盘控制，跳过5秒，滚动居中。可由开头的4个变量控制功能的开关
//               autoPlay        表示点进视频2秒后自动开始播放，
//               keyboardControl 表示点进视频后可用键盘控制视频（空格，↑，↓，←，→），
//               listPlay        表示视频结束后跳过5秒等待直接下一part，
//               center          表示自动滚动到播放器居中显示
// @author       c4r
// @match        https://www.bilibili.com/bangumi/*
// @match        https://www.bilibili.com/video/*
// @match        https://www.bilibili.com/watchlater/*
// @grant        none
// @license      MPL-2.0
// ==/UserScript==

(function() {
    'use strict';

    // 这是4个开关
    let autoPlay = true
    let keyboardControl = true
    let listPlay = true
    let center = true

    function playPause(){
        //console.warn('UI', 'Play & Pause')
        let target = document.getElementsByTagName('video')[0]
        if (target.paused && target.readyState===4){
            target.play()
        }else if(target.paused){
            target.addEventListener('canplay', function() {
                //console.warn('walker:','your net speed is low')
                target.play();
            })
        }
    }


    let observePlayNow = new MutationObserver((list, obs)=>{
        list.forEach((mutation, index)=>{
            if(mutation.target.matches('div.bilibili-player-video-toast-bottom')&&
               mutation.addedNodes.length!==0&&
               mutation.addedNodes[0].querySelector('.bilibili-player-video-toast-item-jump').textContent=='立即播放'){
                //console.warn('UI', '点击“立即播放”')
                mutation.addedNodes[0].querySelector('.bilibili-player-video-toast-item-jump').click()
            }
        })
    })

    let observePlayer = new MutationObserver((list, obs)=>{
        //console.warn('walker:', list)
        let node
        for(node of list){
            //console.warn('waler', node)
            //'div.bilibili-player-video' for old version while 'div.bilibili-player-video-wrap' for new version
            if(node.target.matches('div.bilibili-player-video-wrap')||node.target.matches('div.bilibili-player-video')){
                document.getElementById('bilibiliPlayer').querySelector('div.bilibili-player-video-wrap').click()
                obs.disconnect()
                break
            }
        }
    })

    let previousURL = ''
    let refreshCounter = 0 //obsoleted
    let bofqiAnchor, bilibiliPlayerAnchor

    function runOnce(){
        if(listPlay){
            observePlayNow.observe(bofqiAnchor, {childList:true, subtree:true})
        }
        //console.warn('will it auto paly?', !refreshCounter)
        if(autoPlay){
        //if(autoPlay&&!refreshCounter){
            setTimeout(playPause, 2000);
            refreshCounter++
        }
        if(center){
            //console.warn('scrolling...', !refreshCounter)
            bofqiAnchor.scrollIntoView({behavior: 'smooth', block: 'center'})
        }
    }

    function runContinuously(){
        if(keyboardControl){
            observePlayer.observe(bilibiliPlayerAnchor, {childList: true, subtree: true})
        }
    }

    function runOnceTimeoutCallback(){
        if(bofqiAnchor = document.getElementById('bofqi')){
            runOnce()
        }else{
            //console.warn('bili自动播放', 'setTimeout runOnce')
            setTimeout(runOnceTimeoutCallback, 200)
        }
    }

    function runContTimeoutCallback(){
        if(bilibiliPlayerAnchor = document.getElementById('bilibiliPlayer')){
            runContinuously()
        }else{
            //console.warn('bili自动播放', 'setTimeout runContinuously')
            setTimeout(runContTimeoutCallback, 200)
        }
    }

    let observeHead = new MutationObserver((list, obs)=>{
        if(previousURL != window.location.href){
            //console.warn('walker: URL has changed', 'from: ' + previousURL + ' to: ' + window.location.href)
            previousURL = window.location.href

            runOnceTimeoutCallback()
            runContTimeoutCallback()
        }
    })

    let headAnchor = document.getElementsByTagName('head')[0]

    observeHead.observe(headAnchor, {childList: true})



})();