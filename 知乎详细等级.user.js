// ==UserScript==
// @name         知乎详细等级
// @namespace    http://tampermonkey.net/
// @version      0.4.2
// @license      MPL-2.0
// @description  精确显示知乎等级(精确到小数点后两位)
// @author       C4r
// @match        https://www.zhihu.com/*
// @grant        none
// @require      https://cdn.jsdelivr.net/npm/jquery@3.5.0/dist/jquery.min.js
// @require      https://cdn.jsdelivr.net/npm/moment@2.24.0/min/moment.min.js
// @require      https://cdn.jsdelivr.net/npm/chart.js@2.9.3/dist/Chart.min.js
// ==/UserScript==

(function () {
    'use strict';

    let storageName = 'C4rZhihuLevel'

    function httpGetAsync(theUrl, callback) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
                callback(xmlHttp.responseText);
        }
        xmlHttp.open("GET", theUrl, true); // true for asynchronous 
        xmlHttp.send(null);
    }


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


    function getLevelRequest() {
        return new Promise((resolve, reject) => {

            httpGetAsync('https://www.zhihu.com/creator/account/growth-level', (responseText) => {

                console.log('get response')
                // console.log(responseText)
                let levelInfoStartIndex = responseText.indexOf('"account":{"growthLevel"')

                if (levelInfoStartIndex >= 0) {
                    let levelInfoEndIndex = responseText.indexOf('}}', levelInfoStartIndex) + 2

                    let levelInfoStr = '{' + responseText.slice(levelInfoStartIndex, levelInfoEndIndex) + '}'

                    let levelInfo = JSON.parse(levelInfoStr)

                    let cLevel = parseFloat(levelInfo.account.growthLevel.level + '.' + levelInfo.account.growthLevel.ratio)

                    resolve(cLevel)
                } else {
                    console.error('zhihu level detail not gotten')
                    reject('zhihu level detail not gotten')
                }

            })
        })
    }

    /**
     * return level by reading page
     */
    function getLevelHTML() {

        if ($('.CreatorHomeLevelInfo-levelTitle').length == 0) {
            return undefined
        } else {
            let strLevelPercent = $('.CreatorHomeLevelBar-progress').attr('style').slice(("width:").length, -2).trim();
            // let str = $('.CreatorHomeLevelInfo-levelTitle').text()
            $('.CreatorHomeLevelInfo-levelTitleHint').before('.' + strLevelPercent)

            // console.log('zhihu level')
            let strLevel = $('img.CreatorHomeLevelInfo-LevelImage').attr('alt').split(' ')[1] + '.' + strLevelPercent

            let cLevel = parseFloat(strLevel)

            return cLevel
        }

    }

    function updateData(cLevel) {

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
                data[cDate.getTime()] = cLevel
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

        return data
    }


    function getData() {
        let dataStr = localStorage.getItem(storageName)

        let data = {}
        if (dataStr !== null && dataStr !== undefined && dataStr.trim() !== '') {
            data = JSON.parse(dataStr)
        }

        return data
    }


    function isLevelDetailShown() {
        return $('.CreatorHomeLevelInfo-levelTitle[levelDetail]').length > 0
    }

    function addLevelDetailTag() {
        // add tag
        $('.CreatorHomeLevelInfo-levelTitle').attr('levelDetail', '')
    }

    /**
     * 画图
     * @param {*} ctx element in Page
     * @param {*} data data 
     * @returns myChart
     */
    function plotLevelDetail(ctx, data) {

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

        return myChart
    }

    function isUrlCreator() {
        return window.location.href.includes('www.zhihu.com/creator')
    }

    function isCreatorHomePage() {
        return !($('.CreatorHomeLevelInfo-levelTitle').length == 0)
    }

    function isUrlHome() {
        let href = window.location.href
        if (href == 'https://www.zhihu.com/'
            || href == 'https://www.zhihu.com/question/waiting'
            || href == 'https://www.zhihu.com/explore'
            || href == 'https://www.zhihu.com/follow'
            || href == 'https://www.zhihu.com/hot') {

            return true
        } else {
            return false
        }

    }

    function showLevel() {

        if (isLevelDetailShown() || !isCreatorHomePage()) {
            return
        }

        let cLevel = getLevelHTML()
        if (cLevel == undefined) return

        addLevelDetailTag()

        let data = updateData(cLevel)

        $('<canvas id="levelDetailChart"></canvas>').insertAfter('.CreatorHomeLevelInfo')
        let ctx = document.getElementById("levelDetailChart");

        plotLevelDetail(ctx, data)

    }


    function callbackLevel() {
        // console.log('found Level bar')
        showLevel()
    }

    // ===============================================
    if (isUrlCreator) {
        showLevel()
        $(document).ready(() => {

            let observerLevel = new MutationObserver(callbackLevel)

            observerLevel.observe($('body').get(0),
                {
                    subtree: true, childList: true, characterData: false, attributes: true,
                    attributeFilter: ['.CreatorHomeLevelInfo-levelTitle:not([levelDetail]'],
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
    }

    if (isUrlHome()) {

        // console.log('is Home page')

        getLevelRequest().then((cLevel) => {

            let data = updateData(cLevel)
            // console.log('cLevel : ', cLevel)
            $(document).ready(() => {

                if($('.CreatorEntrance').length > 0){
                    if ($('.CreatorEntrance-indexPageTitle span').length > 0) {
                        $('.CreatorEntrance-indexPageTitle span').text('Lv ' + cLevel)
    
                        $('<canvas id="levelDetailChart"></canvas>').insertAfter('.ProfileSideCreator-analytics')
                        let ctx = document.getElementById("levelDetailChart");
    
                        plotLevelDetail(ctx, data)
                    }
                }else{
                    console.log('zhihuLevel : not found Entrance, add MutationObserver')
                    let observerEntrance = new MutationObserver((mutationList, observer)=>{

                        if($('.CreatorEntrance').length > 0){
                            console.log('zhihuLevel : Entrance appears, disconnect MutationObserver')
                            if ($('.CreatorEntrance-indexPageTitle span').length > 0) {
                                $('.CreatorEntrance-indexPageTitle span').text('Lv ' + cLevel)
            
                                $('<canvas id="levelDetailChart"></canvas>').insertAfter('.ProfileSideCreator-analytics')
                                let ctx = document.getElementById("levelDetailChart");
            
                                plotLevelDetail(ctx, data)
                            }
                            observer.disconnect()
                        }
                    })

                    observerEntrance.observe($('body').get(0),
                        {
                            subtree: true, childList: true, characterData: false, attributes: true,
                            attributeFilter: ['.CreatorEntrance'],
                            attributeOldValue: false, characterDataOldValue: false
                        })
                }
                


            })
        })
    }

})();