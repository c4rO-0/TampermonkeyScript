// ==UserScript==
// @name         bilibili 自动播放
// @namespace    www.papercomment.tech
// @version      1.2
// @description  共有4个功能。自动播放，键盘控制，跳过5秒，滚动居中。可由开头的4个变量控制功能的开关
//               autoPlay        表示点进视频1秒后自动开始播放，
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

    ////////////////-以下是神秘代码-///////////////////
    let timerVideo
    let previousURL = ''
    let videoAnchor

    function playListener(e){
        //console.warn('canplay')
        //console.warn(e.target)
        setTimeout(()=>{e.target.play()}, 1000)
        e.target.removeEventListener(e.type, playListener)
    }

    function play(target){
        //console.warn('Play', target.readyState)
        if(target.readyState > 2){
            setTimeout(()=>{target.play()}, 1000)
        }else{
            target.addEventListener('canplay', playListener)
        }
    }

    let observePlayNow = new MutationObserver((list, obs)=>{
        //console.warn('c4r', list)
        for(let mutation of list){
            if(mutation.target.matches('div.bilibili-player-video-toast-bottom')&&
               mutation.addedNodes.length!==0&&
               mutation.addedNodes[0].querySelector('.bilibili-player-video-toast-item-jump').textContent=='立即播放'){
                //console.warn('c4r', '点击“立即播放”')
                mutation.addedNodes[0].querySelector('.bilibili-player-video-toast-item-jump').click()
                break
            }
        }
    })

    let observeHead = new MutationObserver((list, obs)=>{
        if(previousURL != window.location.href){
            //console.warn('walker: URL has changed', 'from: ' + previousURL + ' to: ' + window.location.href)
            previousURL = window.location.href

            clearInterval(timerVideo)//防止ajax跳转遗留timer
            timerVideo = setInterval(()=>{
                if(videoAnchor = document.getElementsByTagName('video')[0]){
                    //console.warn('got <video>', videoAnchor)
                    let bofqiAnchor = document.getElementById('bofqi') 
                    if(autoPlay){
                        play(videoAnchor)
                    }
                    if(keyboardControl){
                        if(document.getElementById('bilibiliPlayer').querySelector('div.bilibili-player-video-wrap') != null){
                            document.getElementById('bilibiliPlayer').querySelector('div.bilibili-player-video-wrap').click()
                        }
                    }
                    if(center){
                        bofqiAnchor.scrollIntoView({behavior: 'smooth', block: 'center'})
                    }
                    if(listPlay){
                        if(bofqiAnchor.querySelector('div.bilibili-player-video-toast-bottom') != null){
                            observePlayNow.observe(bofqiAnchor.querySelector('div.bilibili-player-video-toast-bottom'), {childList:true, subtree:true})
                        }
                    }
                    clearInterval(timerVideo)
                }
//                 else{
//                     console.warn('finding <video>')
//                 }
            }, 200)
        }
    })

    let headAnchor = document.getElementsByTagName('head')[0]
    observeHead.observe(headAnchor, {childList: true})

})();