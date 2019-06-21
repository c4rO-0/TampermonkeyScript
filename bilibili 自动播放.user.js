// ==UserScript==
// @name         bilibili 自动播放
// @namespace    www.papercomment.tech
// @version      0.8
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
        if (target.paused){
            target.play()
        }
        else{
            target.pause()
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
        document.getElementById('bilibiliPlayer').querySelector('div.bilibili-player-video-wrap').click()
        obs.disconnect()
    })

    let previousURL = ''
    let refreshCounter = 0
    let traceAnchor, bofqiAnchor, tracePlayer, bilibiliPlayerAnchor

    let observeHead = new MutationObserver((list, obs)=>{
        if(previousURL != window.location.href){
            //console.warn('URL has changed:', 'from: ' + previousURL + ' to: ' + window.location.href)
            previousURL = window.location.href

            traceAnchor = setInterval(()=>{
                // console.warn('UI', 'tik tok')
                if(bofqiAnchor = document.getElementById('bofqi')){
                    clearInterval(traceAnchor)
                    // console.warn('UI', anchor)
                    if(listPlay){
                        observePlayNow.observe(bofqiAnchor, {childList:true, subtree:true})
                    }
                    //console.warn('will it auto paly?', !refreshCounter)
                    if(autoPlay&&!refreshCounter){
                        setTimeout(playPause, 2000);
                        refreshCounter++
                    }
                    if(center){
                        bofqiAnchor.scrollIntoView({behavior: 'smooth', block: 'center'})
                    }
                }
            }, 200)

            tracePlayer = setInterval(()=>{
                if(bilibiliPlayerAnchor = document.getElementById('bilibiliPlayer')){
                    clearInterval(tracePlayer)
                    if(keyboardControl){
                        observePlayer.observe(bilibiliPlayerAnchor, {childList: true, subtree: true})
                    }
                }
            }, 200)
        }
    })

    let headAnchor = document.getElementsByTagName('head')[0]

    observeHead.observe(headAnchor, {childList: true})



})();