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
// @require      https://cdn.jsdelivr.net/npm/chart.js@2.9.3
// ==/UserScript==

(function () {
    'use strict';

    function dataToChartData(data) {
        // console.log('zhihu : ', data)
        let timeSort = Object.keys(data).sort()
        let minTime = timeSort[0]
        let maxTime = (timeSort[timeSort.length - 1])

        let minY = 1000000
        let maxY = -1

        let timeStep = 60 * 60 * 24 * 7

        let xyArray = []

        for (let time of timeSort) {
            if (data[time] <= minY) {
                minY = data[time]
            }

            if (data[time] >= maxY) {
                maxY = data[time]
            }
            // xyArray.push({ x: Math.round((time - minTime) / timeStep), y: (data[time]) })

            xyArray.push({ x: (new Date(parseInt(time))), y: (data[time]) })
        }

        return {
            'xyArray': xyArray,
            'minX': 0,
            'maxX': Math.round((maxTime - minTime) / timeStep),
            'minY': minY,
            'maxY': maxY

        }
    }

    $(document).ready(() => {
        let storageName = 'C4rZhihuLevel'

        // debug
        let debugData = {
            1580511600000: 3.00,
            1577833200000: 2.10,
            1585692000000: 3.24
        }
        localStorage.setItem(storageName, JSON.stringify(debugData))


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



        $('<canvas id="myChart"></canvas>').insertAfter('.CreatorHomeLevelInfo')
        var ctx = document.getElementById("myChart");


        let chartData = dataToChartData(data)
        console.log('c4r zhihu level chartData :', chartData)
        var myChart = new Chart(ctx, {
            type: 'line',
            
            data: {
                datasets: [{
                    label: 'Points',
                    labels: ["January", "February", "March", "April", "May", "June", "July"],
                    data: chartData['xyArray'],
                    backgroundColor: 'rgba(123, 83, 252, 0.8)',
                    borderColor: 'rgba(33, 232, 234, 1)',
                    borderWidth: 1,
                    fill: false,
                    showLine: false,
                }],
            },
            options: {
                // title: {
                //   display: false,
                //   text: 'Chart.js - Fixed X and Y Axis',
                // },
                scales: {
                    // xAxes: [{
                    //     type: 'linear',
                    //     position: 'bottom',
                    //     ticks: {
                    //         min: chartData['minX'],
                    //         max: chartData['maxX'],
                    //         stepSize: 1,
                    //         fixedStepSize: 1,
                    //     }
                    // }],
                    // xAxes: [{
                    //     type: 'time',
                    //     time: {
                    //         unit: 'month'
                    //     }
                    // }],
                      yAxes: [{
                        ticks: {
                          min: 0,
                          max: 10,
                          stepSize: 1,
                          fixedStepSize: 1,
                        }
                      }]
                }
            }
        });
    })


})();