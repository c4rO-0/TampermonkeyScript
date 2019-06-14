// ==UserScript==
// @name         bilibili 自动播放
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  最开始的三个开关autoPlay表示点进视频2秒后自动开始播放，backspacePlay表示点进视频后可用空格键控制播放暂停，listPlay表示视频结束后跳过5秒等待直接下一part
// @author       You
// @match        https://www.bilibili.com/bangumi/*
// @match        https://www.bilibili.com/video/*
// @match        https://www.bilibili.com/watchlater/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...
    let autoPlay = true
    let backspacePlay = true
    let listPlay = true

    function clickPlayer(){
        document.getElementsByTagName('video')[0].click();
    }
    if(backspacePlay){
        document.addEventListener("keydown", function handler(e) {
            e.preventDefault();
            if((e || window.event).keyCode === 32){
                clickPlayer();
            }
            e.currentTarget.removeEventListener(e.type, handler);
        });
    }
    if(autoPlay){
        setTimeout(clickPlayer, 2000);
    }

    //console.log('UI', anchor)
    function playNow(list, obs){
        // console.log('UI', list)
        list.forEach((mutation, index)=>{
            if(mutation.target.matches('div.bilibili-player-video-toast-bottom')&&
               mutation.addedNodes.length!==0&&
               mutation.addedNodes[0].querySelector('.bilibili-player-video-toast-item-jump').textContent=='立即播放'){
                // console.log('UI',mutation)
                mutation.addedNodes[0].querySelector('.bilibili-player-video-toast-item-jump').click()
            }
        })
    }
    let observerAnchor = new MutationObserver(playNow)
    if(listPlay){
        if ($('.player').length > 0) {
           // console.log('UI start')
            let anchor = document.getElementById('bofqi')
           observerAnchor.observe(anchor, {childList:true, subtree:true})
        } else {
            // 在列表页面
            // 通过检测是否含有.player元素判断
            let callbackGoToWatch = function (mutationList, observer) {
                let anchor = document.getElementById('bofqi')
                if ($('.player').length > 0 && anchor) {
                    console.log('UI start')

                    observerAnchor.observe(anchor, {childList:true, subtree:true})
                    observer.disconnect()
                }
            }
            let observerGoToWatch = new MutationObserver(callbackGoToWatch)

            let strWaitLoadPlayer = ''
            if ($('.app-wrap').length > 0) {
                strWaitLoadPlayer = '.app-wrap'
            } else if ($('#app').length > 0) {
                strWaitLoadPlayer = '#app'
            }
            observerGoToWatch.observe($(strWaitLoadPlayer).get(0),
                {
                    subtree: true, childList: true, characterData: false, attributes: true,
                    attributeFilter: ["src"], attributeOldValue: false, characterDataOldValue: false
                })
        }



    }
})();