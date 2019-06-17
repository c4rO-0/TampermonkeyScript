// ==UserScript==
// @name         bilibili 自动播放
// @namespace    www.papercomment.tech
// @version      0.3
// @description  最开始的三个开关autoPlay表示点进视频2秒后自动开始播放，backspacePlay表示点进视频后可用空格键控制播放暂停，listPlay表示视频结束后跳过5秒等待直接下一part
// @author       c4r
// @match        https://www.bilibili.com/bangumi/*
// @match        https://www.bilibili.com/video/*
// @match        https://www.bilibili.com/watchlater/*
// @grant        none
// @license      MPL-2.0
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...
    let autoPlay = true
    let backspacePlay = true
    let listPlay = true

    function clickPlayer(){
        // console.log('bauto : click')
        document.getElementsByTagName('video')[0].click();
    }
    if(backspacePlay){
        document.addEventListener("keydown", function handler(e) {
            if((e || window.event).keyCode === 32){
                e.preventDefault();
                clickPlayer();
            }
            e.currentTarget.removeEventListener(e.type, handler);
        });
    }
    // if(autoPlay){
    //     setTimeout(clickPlayer, 2000);
    // }
    function playNow(list, obs){
        //console.log('UI', list)
        list.forEach((mutation, index)=>{
            if(mutation.target.matches('div.bilibili-player-video-toast-bottom')&&
               mutation.addedNodes.length!==0&&
               mutation.addedNodes[0].querySelector('.bilibili-player-video-toast-item-jump').textContent=='立即播放'){
                //console.log('UI',mutation)
                mutation.addedNodes[0].querySelector('.bilibili-player-video-toast-item-jump').click()
            }
        })
    }
    let observer = new MutationObserver(playNow)
    let traceAnchor, anchor
    function timer(){
        // console.warn('UI', 'tik tok')
        if(anchor = document.getElementById('bofqi')){
            clearInterval(traceAnchor)
            // console.warn('UI', anchor)
            observer.observe(anchor, {childList:true, subtree:true})
            if(autoPlay){
                setTimeout(clickPlayer, 2000);
            }
        }
    }
    if(listPlay){
        traceAnchor = setInterval(timer, 200)
    }
})();