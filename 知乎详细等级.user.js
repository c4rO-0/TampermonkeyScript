// ==UserScript==
// @name         知乎详细等级
// @namespace    http://tampermonkey.net/
// @version      0.3
// @license      MPL-2.0
// @description  精确显示知乎等级(精确到小数点后两位)
// @author       C4r
// @match        https://www.zhihu.com/creator*
// @grant        none
// @require      https://code.jquery.com/jquery-latest.js
// @require      https://momentjs.com/downloads/moment.min.js
// @require      https://cdn.jsdelivr.net/npm/chart.js@2.9.3
// ==/UserScript==

(function () {
    'use strict';

    let storageName = 'C4rZhihuLevel'


    function dataToChartData(data) {
        // console.log('zhihu : ', data)
        let timeSort = Object.keys(data).sort()

        let xyArray = []

        for (let time of timeSort) {
            // xyArray.push({ x: Math.round((time - minTime) / timeStep), y: (data[time]) })

            xyArray.push({ x: (new Date(parseInt(time))), y: (data[time]) })
        }

        return {
            'xyArray': xyArray
        }
    }

    function showLevel(){

        if($('.CreatorHomeLevelInfo-levelTitle[levelDetail]').length > 0 || $('.CreatorHomeLevelInfo-levelTitle').length == 0){
            return
        }

        let strLevelPercent = $('.CreatorHomeLevelBar-progress').attr('style').slice(("width:").length, -2).trim();
        // let str = $('.CreatorHomeLevelInfo-levelTitle').text()
        $('.CreatorHomeLevelInfo-levelTitleHint').before('.' + strLevelPercent)

        // console.log('zhihu level')
        let strLevel = $('img.CreatorHomeLevelInfo-LevelImage').attr('alt').split(' ')[1] + '.' + strLevelPercent

        let cLevel = parseFloat(strLevel)
        // console.log('zhihu level current  ', cLevel)

        // add tag
        $('.CreatorHomeLevelInfo-levelTitle').attr('levelDetail', '')

        // -------------
        // cal log file
        // ------------
        let dataStr = localStorage.getItem(storageName)
        // console.log('zhihu level dataStr  ', dataStr)
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



        $('<canvas id="levelDetailChart"></canvas>').insertAfter('.CreatorHomeLevelInfo')
        var ctx = document.getElementById("levelDetailChart");


        let chartData = dataToChartData(data)
        // console.log('c4r zhihu level chartData :', chartData)

        var myChart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'Points',
                    data: chartData['xyArray'],
                    backgroundColor: 'rgba(123, 83, 252, 0.8)',
                    borderColor: 'rgba(33, 232, 234, 1)',
                    borderWidth: 1,
                    fill: false,
                    showLine: true,
                }],
            },
            options: {
                title: {
                  display: true,
                  text: '等级历史',
                },
                legend: {
                    display: false
                },
                scales: {
                    xAxes: [{
                        type: 'time',
                        time: {
                            unit: 'week',
                            displayFormats: {
                                week: 'YY.M.D'
                            }
                        }

                    }]
                }
            }
        });


    }


    function callbackLevel(){
        // console.log('found Level bar')
        showLevel()
    }

    showLevel()
    
    $(document).ready(() => {

        let observerLevel = new MutationObserver(callbackLevel)

        observerLevel.observe($('body').get(0),
        {
            subtree: true, childList: true, characterData: false, attributes: true, 
            attributeFilter :['.CreatorHomeLevelInfo-levelTitle:not([levelDetail]'],
            attributeOldValue: false, characterDataOldValue: false
        })

        // debug
        // let debugData = {
        //     1580511600000: 3.00,
        //     1577833200000: 2.10,
        //     1585692000000: 3.24
        // }
        // localStorage.setItem(storageName, JSON.stringify(debugData))

        showLevel()
    })


})();