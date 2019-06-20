// ==UserScript==
// @name         小窗口视频（bili，mgtv，youtube）
// @version      0.9.0
// @license      MPL-2.0
// @namespace    
// @description  小窗口视频（bili，mgtv）。网页右下角会出现一个小按钮，点击之后视频会通过小窗口播放。基于chrome浏览器的画中画（Picture in Picture）。
// @author       c4r
// @require      https://code.jquery.com/jquery-latest.js
// @match        https://www.bilibili.com/video/*
// @match        https://www.bilibili.com/bangumi/*
// @match        https://live.bilibili.com/*
// @match        https://www.mgtv.com/b/*
// @match        https://www.mgtv.com/l/*
// @match        https://www.bilibili.com/watchlater/*
// @match        https://www.youtube.com/*
// @run-at       context-menu
// @grant        GM_addStyle
// ==/UserScript==

(function () {
    'use strict';

    GM_addStyle(`
    #c4r-oxgs73w7rh {
        transform-origin: 100% 100%;
        transition: transform 0.3s ease;
    }
    #c4r-oxgs73w7rh:hover {
        transform-origin: 100% 100%;
        transform: scale(2);
    }
    `)
    let videoUrl = undefined;
    let timeID = 0

    let loadmetaRespon = function (timeID) {

        if (document.pictureInPictureElement
            && (!document.pictureInPictureElement.src
                || document.pictureInPictureElement.src != $('video').attr('src'))) {

            if (timeID) {
                clearTimeout(timeID)
            }
            console.log("picInpic : loadedmetadata")
            // document.exitPictureInPicture()
            document.getElementsByTagName('video')[0].requestPictureInPicture().catch(error => {
                // 视频无法进入画中画模式
                console.log('picInpic error : ', error, document.pictureInPictureElement)
                // loadedmetadata有的时候触发的太快....等5秒的timeout影响观感
                timeID = setTimeout(() => {

                    if (document.pictureInPictureElement
                        && (!document.pictureInPictureElement.src
                            || document.pictureInPictureElement.src != $('video').attr('src'))) {
                        // 最后一次尝试进入画中画
                        console.log("picInpic : setTimeout : pictureInPictureElement ：LAST")
                        // document.exitPictureInPicture()
                        $('video').get(0).requestPictureInPicture()
                        // document.getElementsByTagName('video')[0].removeEventListener("loadedmetadata", loadmetaRespon(timeID))
                    }

                }, 2000);
            });
            // document.getElementsByTagName('video')[0].removeEventListener("loadeddata", loadmetaRespon(timeID))
        }
    }

    /**
     * 
     */
    let callbackVideo = function (mutationList, observer) {
        // console.log("coin change : ", mutationList)

        // 保证video已经有url
        if (document.pictureInPictureElement && $('video').length > 0 && $('video').attr('src') && $('video').attr('src').length > 0) {

            // 抓到url之后就不再处理了
            if (videoUrl != $('video').attr('src')) {

                // 视频地址发生变更
                videoUrl = $('video').attr('src')
                console.log("picInpic : video address changed ", $('video').attr('src'))
                // 如果pictureInPictureElement的src与当前video的src不一致
                if (!document.pictureInPictureElement.src
                    || document.pictureInPictureElement.src != $('video').attr('src')) {
                    // console.log("picInpic : video address changed ", $('video').attr('src'))
                    // 在画中画里
                    // console.log("picInpic : pictureInPictureElement ", document.pictureInPictureElement)

                    // 防止loadedmetadata没有被触发
                    timeID = setTimeout(() => {

                        if (document.pictureInPictureElement
                            && (!document.pictureInPictureElement.src
                                || document.pictureInPictureElement.src != $('video').attr('src'))) {
                            // 首次尝试进入画中画
                            console.log("picInpic : setTimeout : pictureInPictureElement ")
                            // document.exitPictureInPicture()
                            $('video').get(0).requestPictureInPicture()
                            // document.getElementsByTagName('video')[0].removeEventListener("loadedmetadata", loadmetaRespon(timeID))
                        }

                    }, 5000);
                }

                // document.getElementsByTagName('video')[0].removeEventListener("loadeddata", loadmetaRespon(timeID))
                document.getElementsByTagName('video')[0].addEventListener("canplay", loadmetaRespon(timeID), { once: true })


                // $('video').on("timeupdate", () => {
                //     if (document.pictureInPictureElement 
                //         && document.pictureInPictureElement.src != document.getElementsByTagName('video')[0].src) {
                //         document.getElementsByTagName('video')[0].requestPictureInPicture().catch(error => {
                //             // 视频无法进入画中画模式
                //             console.log('picInpic error : ', error, document.pictureInPictureElement)
                //         });
                //     }
                // })


            }
        }

    }
    let observerVideo = new MutationObserver(callbackVideo)



    if(document.pictureInPictureEnabled){

        document.body.insertAdjacentHTML('beforeend', '<div id="c4r-oxgs73w7rh" style="height: 20px;width: 20px;position: fixed;overflow: hidden;bottom: 0px;right: 0px;cursor: pointer;z-index: 999">\
        <div style="height: 20px;width: 20px;border-radius: 10px;position: relative;bottom: -4px;right: -4px;background-color: #cacaca;">\
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.85 142.73" style="height: 14px;width: 14px;bottom: 4px;right: 4px;position: absolute;"><defs><style>.cls-1{fill:#414042;fill-rule:evenodd;}</style></defs><g id="Layer_2" data-name="Layer 2"><g id="Layer_1-2" data-name="Layer 1"><path class="cls-1" d="M90.15,9.15C54.51,1.8-5.62,92,19.3,96.79,33,99.44,43.61,92.06,53.13,90.62l13,.31a1.08,1.08,0,1,1,.86,2c-11,10.93-6.16,8.84-19.75,13C17.07,115.2-10.23,109,3.77,72.41,14.61,44.07,58.53-6.48,93,.69a4.46,4.46,0,0,1-2.85,8.46Z"></path><path class="cls-1" d="M76.14,59.88A74.48,74.48,0,0,1,86,82.13c9.45-11.26,23-18.66,35.69-5.72a3.28,3.28,0,0,1-4.22,5C104.7,76.87,99.12,80,90.9,91.87A40.53,40.53,0,0,0,88,97c.22,8.56-.94,17.53-2.93,27.55-.71,3.53-4.87,24.87-13.45,16.15-6.79-6.9,2.87-39.31,6.21-46,.19-.39.4-.78.6-1.18C77.9,82.45,75.64,71.83,71,64a3.28,3.28,0,0,1,5.14-4.07ZM72.85,133a2.25,2.25,0,0,0-.62.85C72.7,133.34,72.71,133.38,72.85,133Z"></path></g></g></svg>\
        </div>\
        </div>')        
        document.getElementById('c4r-oxgs73w7rh').addEventListener("click", () => {

            //        if (!document.pictureInPictureElement) {
            document.getElementsByTagName('video')[0].requestPictureInPicture().then(() => {
                videoUrl = $('video').attr('src')
                observerVideo.disconnect()
                observerVideo.observe($('body').get(0),
                    {
                        subtree: true, childList: true, characterData: true, attributes: true,
                        attributeOldValue: false, characterDataOldValue: false
                    })
            }).catch(error => {
                // 视频无法进入画中画模式
            });
            //        } else {
            //            document.exitPictureInPicture()
            //                .catch(error => {
            //                // 视频无法退出画中画模式
            //           });
            //        }
    
        })
    }else{
        document.body.insertAdjacentHTML('beforeend', '<div id="c4r-oxgs73w7rh" style="height: 20px;width: 20px;position: fixed;overflow: hidden;bottom: 0px;right: 0px;cursor: pointer;z-index: 999">\
        <div style="height: 20px;width: 20px;border-radius: 10px;position: relative;bottom: -4px;right: -4px;background-color: #fd676f;">\
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.85 142.73" style="height: 14px;width: 14px;bottom: 4px;right: 4px;position: absolute;"><defs><style>.cls-1{fill:#414042;fill-rule:evenodd;}</style></defs><g id="Layer_2" data-name="Layer 2"><g id="Layer_1-2" data-name="Layer 1"><path class="cls-1" d="M90.15,9.15C54.51,1.8-5.62,92,19.3,96.79,33,99.44,43.61,92.06,53.13,90.62l13,.31a1.08,1.08,0,1,1,.86,2c-11,10.93-6.16,8.84-19.75,13C17.07,115.2-10.23,109,3.77,72.41,14.61,44.07,58.53-6.48,93,.69a4.46,4.46,0,0,1-2.85,8.46Z"></path><path class="cls-1" d="M76.14,59.88A74.48,74.48,0,0,1,86,82.13c9.45-11.26,23-18.66,35.69-5.72a3.28,3.28,0,0,1-4.22,5C104.7,76.87,99.12,80,90.9,91.87A40.53,40.53,0,0,0,88,97c.22,8.56-.94,17.53-2.93,27.55-.71,3.53-4.87,24.87-13.45,16.15-6.79-6.9,2.87-39.31,6.21-46,.19-.39.4-.78.6-1.18C77.9,82.45,75.64,71.83,71,64a3.28,3.28,0,0,1,5.14-4.07ZM72.85,133a2.25,2.25,0,0,0-.62.85C72.7,133.34,72.71,133.38,72.85,133Z"></path></g></g></svg>\
        </div>\
        </div>')  
    }


})();