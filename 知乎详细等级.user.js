// ==UserScript==
// @name         知乎详细等级
// @namespace    http://tampermonkey.net/
// @version      0.1
// @license      MPL-2.0
// @description  精确显示知乎等级(精确到小数点后两位)
// @author       C4r
// @match        https://www.zhihu.com/creator
// @grant        none
// @require      https://code.jquery.com/jquery-latest.js
// // @require      https://cdn.jsdelivr.net/npm/chart.js@2.8.0
// ==/UserScript==

(function () {
    'use strict';

    // function dataToLabel(data){
    //     let timeSort = Object.keys(data).sort()

    //     let label = []

    //     for (time in timeSort) {
    //         let date = new DataCue(time)
    //         label.push(date.)

    //     }
    // }

    $(document).ready(() => {
        let storageName = 'C4rZhihuLevel'

        // debug
        // let debugData = {
        //     1586449108624: 3.20,
        //     1586449107624: 3.10,
        //     1586449109624: 3.24
        // }
        // localStorage.setItem(storageName, JSON.stringify(debugData))


        let strLevelPercent = $('.CreatorHomeLevelBar-progress').attr('style').slice(("width:").length, -2).trim();
        // let str = $('.CreatorHomeLevelInfo-levelTitle').text()
        $('.CreatorHomeLevelInfo-levelTitleHint').before('.' + strLevelPercent)

        console.log('zhihu level')
        let strLevel = $('img.CreatorHomeLevelInfo-LevelImage').attr('alt').split(' ')[1] + '.' + strLevelPercent
        let cLevel = parseFloat(strLevel)
        console.log('zhihu level current  ', cLevel)


        // -------------
        // cal log file
        // ------------
        let dataStr = localStorage.getItem(storageName)
        console.log('zhihu level dataStr  ', dataStr)
        let cDate = new Date()

        let data = {}
        if (dataStr !== null && dataStr !== undefined && dataStr.trim() !== '') {
            data = JSON.parse(dataStr)
            // console.log('zhihu level data  ', data)
            let timeSort = Object.keys(data).sort()
            let lastTime = timeSort[timeSort.length - 1]
            let lastLevel = data[lastTime]
            // console.log('zhihu level timeSort ', timeSort)
            // console.log('zhihu level lastTime ', lastTime)
            // console.log('zhihu level lastLevel ', lastLevel)
            if (lastLevel == cLevel) {
                // level not changed
                // console.log('c4r zhihu level not change ', lastLevel, ' ', cLevel)
            } else if (lastLevel > cLevel) {
                // level drop
                // console.error('c4r zhihu level drop from ', lastLevel, ' to ', cLevel)

            } else {
                // level rise
                // console.log('c4r zhihu level rise from ', lastLevel, ' to ', cLevel)

                data[cDate.getTime()] = cLevel

                localStorage.setItem(storageName, JSON.stringify(data))

                // $('.CreatorHomeLevelInfo-levelTitleHint').before(' (上次更新 : '+ lastLevel + ' ' +  (new Date()).toLocaleDateString()+  ')')
            }

            
        } else {
            // initial log file 
            
            data[cDate.getTime()] = cLevel

            localStorage.setItem(storageName, JSON.stringify(data))
        }



        // $('<canvas id="myChart"></canvas>').insertAfter('.CreatorHomeLevelInfo')

        // var ctx = document.getElementById('myChart').getContext('2d');
        // var chart = new Chart(ctx, {
        //     // The type of chart we want to create
        //     type: 'line',
        
        //     // The data for our dataset
        //     data: {
        //         labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
        //         datasets: [{
        //             label: 'My First dataset',
        //             backgroundColor: 'rgb(255, 99, 132)',
        //             borderColor: 'rgb(255, 99, 132)',
        //             data: [0, 10, 5, 2, 20, 30, 45]
        //         }]
        //     },
        
        //     // Configuration options go here
        //     options: {}
        // });
    })


})();