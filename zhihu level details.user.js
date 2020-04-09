// ==UserScript==
// @name         zhihu level details
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  show the percentage of the creator level
// @author       You
// @match        https://www.zhihu.com/creator
// @grant        none
// @require      https://code.jquery.com/jquery-latest.js
// ==/UserScript==

(function() {
    'use strict';

    $(document).ready(()=>{
        let strLevelPercent = $('.CreatorHomeLevelBar-progress').attr('style').slice(("width:").length,-2).trim();
        // let str = $('.CreatorHomeLevelInfo-levelTitle').text()
        $('.CreatorHomeLevelInfo-levelTitleHint').before('.'+ strLevelPercent)

        // let strLevel = $('img.CreatorHomeLevelInfo-LevelImage').attr('alt').split(' ')[1] + '.' + strLevelPercent

        // let dataJson = localStorage.getItem('C4rZhihuLevel')
        // if(dataJson){
        //     dataJson = JSON.parse(dataJson)
        //     if( lastData.third.level == strLevel){

        //     }
            
        // }
    })


})();