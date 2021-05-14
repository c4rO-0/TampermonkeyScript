// ==UserScript==
// @name         huobi-子账户历史资产
// @namespace    http://tampermonkey.net/
// @version      0.3.0
// @license      MPL-2.0
// @description  记录并绘制子账户历史资产
// @author       C4r
// @match        https://account.huobi.com/zh-cn/subaccount/management/
// @match        */MonkeyPage*
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @grant        GM_getResourceURL
// @require      https://cdn.jsdelivr.net/npm/jquery@3.5.0/dist/jquery.min.js
// @require      https://cdn.jsdelivr.net/npm/moment@2.24.0/min/moment.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.9.4/Chart.min.js
// // @resource     w3CSS https://www.w3schools.com/w3css/4/w3.css
// @resource     w3CSS https://7npmedia.w3cschool.cn/w3.css
// ==/UserScript==

(function () {
    'use strict';

    GM_addStyle('\
.flex-container {\
    width: 95%;\
    margin: 0 auto;   \
    display: flex;\
    flex-direction: column;\
}\
.flex-container .full-row {\
    width: 100%;\
}\
.flex-container .row {\
    width: 100%;\
    display: flex;\
}\
.flex-container .column {\
    width: 50%;\
}');
    $("head").append("<style>" + GM_getResourceText("w3CSS") + "</style>");

    let storageName = 'C4rHuobiSubAsset'

    function httpGetAsync(theUrl, callback) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
                callback(xmlHttp.responseText);
        }
        xmlHttp.open("GET", theUrl, true); 
        xmlHttp.send(null);
    }

    function isMonkeySetting(){
        return window.location.href.indexOf('MonkeyPage') != -1
    }

    function isSameDay(d1, d2) {
        return d1.getFullYear() === d2.getFullYear() &&
          d1.getMonth() === d2.getMonth() &&
          d1.getDate() === d2.getDate();
    }

    function isSameDayInt(d1, d2) {

        return isSameDay((new Date(parseInt(d1))), (new Date(parseInt(d2))))
    
    }


    function dataToChartData(data) {
        
        let isAverage = false
        let isMax = true
        let isMin = false

        let timeSort = Object.keys(data).sort()

        let xArray = []

        let y1Array = []

        let y2Array = []

        let index = 0 
        let days = 0

        let y1 = 0.
        let y2 = 0.

        while (index < timeSort.length) {

            if(days == 0){
                if(index == (timeSort.length-1) ){
                    let time = timeSort[index]
                    xArray.push(new Date(parseInt(time)))
                    y1Array.push((data[time]['asset']))
                    y2Array.push((data[time]['convAsset']))

                    days = 0
                    y1 = 0.
                    y2 = 0.

                    index = index + 1
                }else{
                    let isInOneDay = isSameDayInt(timeSort[index], timeSort[index+1])
                    if(isInOneDay){
                        days = days + 1
                        let time = timeSort[index]

                        if(isAverage){
                            y1 = y1 + (data[time]['asset'])
                            y2 = y2 + (data[time]['convAsset'])
                        }else if(isMax){
                            y1 = Math.max(y1 , (data[time]['asset'])) 
                            y2 = Math.max(y2 , (data[time]['convAsset']))
                        }else if(isMin){
                            y1 = Math.min(y1 , (data[time]['asset'])) 
                            y2 = Math.min(y2 , (data[time]['convAsset']))
                        }

                        index = index + 1

                        // console.log('is in one day. ', new Date(parseInt(timeSort[index])), new Date(parseInt(timeSort[index+1])) )
                    }else{
                        let time = timeSort[index]
                        xArray.push(new Date(parseInt(time)))
                        y1Array.push((data[time]['asset']))
                        y2Array.push((data[time]['convAsset']))
                        
                        days = 0
                        y1 = 0.
                        y2 = 0.

                        index = index + 1

                    }
                }

            }else{
                if(index == (timeSort.length-1) ){
                    days = days + 1
                    let time = timeSort[index]
                    xArray.push(new Date(parseInt(time)))

                    if(isAverage){
                        y1 = y1 + (data[time]['asset'])
                        y2 = y2 + (data[time]['convAsset'])
                        y1Array.push(y1/(days))
                        y2Array.push(y2/(days))
                    }else if(isMax){
                        y1 = Math.max(y1 , (data[time]['asset'])) 
                        y2 = Math.max(y2 , (data[time]['convAsset']))

                        y1Array.push(y1)
                        y2Array.push(y2)
                    }else if(isMin){
                        y1 = Math.min(y1 , (data[time]['asset'])) 
                        y2 = Math.min(y2 , (data[time]['convAsset']))

                        y1Array.push(y1)
                        y2Array.push(y2)
                    }


                    days = 0
                    y1 = 0.
                    y2 = 0.

                    index = index + 1
                }else{
                    let isInOneDay = isSameDayInt(timeSort[index], timeSort[index+1])
                    if(isInOneDay){
                        days = days + 1
                        let time = timeSort[index]
                        if(isAverage){
                            y1 = y1 + (data[time]['asset'])
                            y2 = y2 + (data[time]['convAsset'])
                        }else if(isMax){
                            y1 = Math.max(y1 , (data[time]['asset'])) 
                            y2 = Math.max(y2 , (data[time]['convAsset']))
                        }else if(isMin){
                            y1 = Math.min(y1 , (data[time]['asset'])) 
                            y2 = Math.min(y2 , (data[time]['convAsset']))
                        }

                        index = index + 1
                    }else{
                        days = days + 1
                        let time = timeSort[index]
                        xArray.push(new Date(parseInt(time)))
                        if(isAverage){
                            y1 = y1 + (data[time]['asset'])
                            y2 = y2 + (data[time]['convAsset'])
                            y1Array.push(y1/(days))
                            y2Array.push(y2/(days))
                        }else if(isMax){
                            y1 = Math.max(y1 , (data[time]['asset'])) 
                            y2 = Math.max(y2 , (data[time]['convAsset']))
    
                            y1Array.push(y1)
                            y2Array.push(y2)
                        }else if(isMin){
                            y1 = Math.min(y1 , (data[time]['asset'])) 
                            y2 = Math.min(y2 , (data[time]['convAsset']))
    
                            y1Array.push(y1)
                            y2Array.push(y2)
                        }
                        
                        days = 0
                        y1 = 0.
                        y2 = 0.

                        index = index + 1

                    }
                }                
            }
            
        }

        // for (let time of timeSort) {
        //     // xyArray.push({ x: Math.round((time - minTime) / timeStep), y: (data[time]) })

            
        //     xArray.push(new Date(parseInt(time)))
        //     y1Array.push((data[time]['asset']))
        //     y2Array.push((data[time]['convAsset']))
        // }

        return {
            'xArray': xArray,
            'y1Array':y1Array,
            'y2Array':y2Array
        }
    }

    /**
     * return level by reading page
     */
    function getAssetHTML() {


        if($('div.assets').length > 0 && $('.icon-loading').is(":hidden")){
            let valAsset =  parseFloat($.trim($('div.assets span:not(.convert)').text()).split('\n')[0])

            let valConvAsset = parseFloat($.trim($('div.assets span.convert').text()).split('\n')[0].substring(1))

            // console.log($('#tab-transfer'))
            // console.log($('div.assets span:not(.convert)').text(), {'asset':valAsset, 'convAsset':valConvAsset})
            if(valAsset == 0. || valConvAsset == 0.){
                return undefined
            }else{
                return {'asset':valAsset, 'convAsset':valConvAsset}
            }
            
        }else{
            return undefined
        }

        

    }


    function getData(storageName, bin_id=undefined) {

        return new Promise((resolve,reject)=>{
            let dataStr = localStorage.getItem(storageName)

            let data = {}
            if (dataStr !== null && dataStr !== undefined && dataStr.trim() !== '') {
                data = JSON.parse(dataStr)
            }
    
            let bin_id_local = undefined
            if(data['id'] && data['id']  !== undefined && data['id'].trim() !== ''){
                bin_id_local = data['id']
            }
    
            
            if(bin_id || bin_id_local){ 

                let req = new XMLHttpRequest();

                req.onreadystatechange = () => {
                  if (req.readyState == XMLHttpRequest.DONE) {
                    console.log('req : ', req.responseText);
                    
                    let dataReq = JSON.parse(req.responseText)
                    if(dataReq['data']){
                        console.log("get data success: ")
                    }else{
                        console.log("get data failed: ")
                    }
                    
                    if(dataReq['data']){
                        let dataCloud = dataReq
                        if(dataCloud['data'] && dataCloud['data']  !== undefined ){
                            data['data'] = {...data['data'], ...dataCloud['data']}
                            console.log('combine cloud:', data)
                        }else{
                            console.log('cloud is empty.', dataCloud['data'] , dataCloud['data']  !== undefined )
                        }
                    }
                    data['id'] = (bin_id == undefined ? bin_id_local : bin_id)
                    // console.log('resolve data:', data)
                    resolve(data)
                  }
                };
                
                req.open("GET", "https://api.jsonbin.io/b/"+(bin_id == undefined ? bin_id_local : bin_id)+'/latest', true);
                // req.setRequestHeader("secret-key", (bin_id == undefined ? bin_id_local : bin_id));
                req.send();

                // $.ajaxSetup({
                //     headers:{
                //        'secret-key': (bin_id == undefined ? bin_id_local : bin_id) 
                //     }
                // });
                // $.getJSON( "https://api.jsonbin.io/b/"+storageName, function( dataReq ) {

                //     console.log("get data : ", dataReq)
                //     if(dataReq['data'] && dataReq['data']  !== undefined && dataReq['data'].trim() !== ''){
                //         data['data'] = {...data['data'], ...dataReq['data']}
                //         resolve(data)
                //     }
                // });
            }else{
                resolve(data)
            }
        })
 
    }

    function storeData(storageName, data, bin_id=undefined){

        return new Promise((resolve,reject)=>{
            localStorage.setItem(storageName, JSON.stringify(data))

            // console.log('stroe :', data)

            let bin_id_local = undefined
            if(data['id'] && data['id']  != undefined && data['id']  != {} && data['id'].trim() != ''){
                bin_id_local = data['id']
            }
            if(bin_id || bin_id_local){
                let req = new XMLHttpRequest();

                req.onreadystatechange = () => {
                  if (req.readyState == XMLHttpRequest.DONE) {
                    console.log(req.responseText);
                    resolve()
                  }
                };
                
                req.open("PUT", "https://api.jsonbin.io/b/"+(bin_id == undefined ? bin_id_local : bin_id), true);
                req.setRequestHeader("Content-Type", "application/json");
                // req.setRequestHeader("secret-key", bin_id);
                req.send(JSON.stringify(data));
            }
        })

    }


    /**
     * 
     * @param {*} cAsset {'asset':valAsset, 'convAsset':valConvAsset}
     * @returns data { date:{'asset':valAsset, 'convAsset':valConvAsset}}
     */
    function updateData(cAsset, onlySync=false) {

        return new Promise((resolve, reject)=>{
            let cDate = new Date()


            let bin_id = undefined
            if($('#sync-id') && $('#sync-id').val() && $('#sync-id').val().trim() != ''){
                bin_id = $('#sync-id').val().trim()
            }
    
            getData(storageName, bin_id).then(data =>{
                
                let isStore = true
                console.log('gotten ', data, data['data'])
                if(onlySync){

                }else{
                    if(data['data'] && Object.keys(data['data']).length > 0 ){
                        let timeSort = Object.keys(data['data']).sort()
                        let lastTime = timeSort[timeSort.length - 1]
                        let lastAsset = data['data'][lastTime]
            
                        if (Math.abs(lastAsset['convAsset'] - cAsset['convAsset']) > 100 ) {
            
                            data['data'][cDate.getTime()] = cAsset
    
                        }else if(cDate.getTime() - lastTime > 1000*60*60*24){
                            data['data'][cDate.getTime()] = cAsset
            
                        }else{
                            data['data'][cDate.getTime()] = cAsset
                            isStore = false
                        }
                    }else{
                        // initial log file 
                        console.log('initial')
                        data['data'] = {}
                        data['id'] = undefined
                        data['data'][cDate.getTime()] = cAsset
                    }
                }


                if(isStore){
                    console.log('start store')
                    storeData(storageName, data, isMonkeySetting() ? undefined : bin_id ).then(()=>{
                        if(data['id'] && data['id']  != undefined && data['id']  != {} && data['id'].trim() != ''){
                            $('#sync-button').text('同步完成')
                            setTimeout(() => {
                                $('#sync-button').text('同步')
                            }, 2000);
                        }
                    })
                }else{
                    console.log('no need store')
                }

                resolve(data)

            })
    
    
        })

    }


    /**
     * 画图
     * @param {*} ctx element in Page
     * @param {*} data data 
     * @returns myChart
     */
    function plotAssetDetail(ctx, data) {

        let chartData = dataToChartData(data)
        /**
         * data is stored in 3 arrays with same length:
         * looks like:
         * chartData['xArray'] : [ d1, d2, d3, ...]
         * chartData['y1Array']: [ y1, y2, y3, ...]
         * chartData['y2Array']: [ z1, z2, z3, ...]
         * ----
         * x axis is time, which type is Date() i.e. d1 = new Date()
         * y1 is BTC amount , type is float : i.e. y1 = 0.11
         * y2 is RMB amount , type is float : i.e. z1 = 1000.
         */

        /**
         * The following code is for drawing figure using chart.js
         * The figure is inserted into the element 'ctx'
         */
        var myChart = new Chart(ctx, {
            type: 'line',
            data: {
              labels: chartData['xArray'],
              datasets: [{
                label: 'BTC',
                yAxisID: 'A',
                data: chartData['y1Array'],
                backgroundColor: 'rgba(123, 83, 252, 0.8)',
                borderColor: 'rgba(33, 232, 234, 1)',
                borderWidth: 1,
                fill: false,
                showLine: true,
              }, {
                label: 'CNY',
                yAxisID: 'B',
                data: chartData['y2Array'],
                backgroundColor: 'red',
                borderColor: 'red',
                borderWidth: 1,
                fill: false,
                showLine: true
              }]
            },
            options: {
                responsive:true,
                maintainAspectRatio: false,
                title: {
                    display: false,
                    text: '子账户资产',
                },
                legend: {
                    display: false
                },
                scales: {
                    xAxes: [{
                        type: 'time',
                        time: {
                            unit: 'day',
                            displayFormats: {
                                week: 'YY.M.D'
                            }
                        }
                    }],
                    yAxes: [{
                        id: 'A',
                        type: 'linear',
                        position: 'left',
                        ticks: {
                            beginAtZero: true
                            },
                        scaleLabel: {
                            display: true,
                            labelString : 'BTC',
                            fontColor: 'blue'
                        },
                        ticks: {
                            suggestedMax: Math.max(...chartData['y1Array'])*1.2,
                            suggestedMin: Math.min(...chartData['y1Array'])*0.9,
                            fontColor: 'blue',
                            autoSkip: true
                        }
                    },{
                        id: 'B',
                        type: 'linear',
                        position: 'right',
                        ticks: {
                            beginAtZero: true
                            },
                        scaleLabel: {
                            display: true,
                            labelString : 'CYN',
                            fontColor: 'red'
                        },
                        ticks: {
                            suggestedMax: Math.max(...chartData['y2Array'])*1.1,
                            suggestedMin: Math.min(...chartData['y2Array'])*0.9,
                            fontColor: 'red',
                            autoSkip: true
                        },
                        gridLines: {
                            drawOnChartArea: false,
                          },
                    }]
                }
            }
        });

        return myChart
    }


    function isAssetDetailShown() {
        return $('.subaccount-assets[assetDetail]').length > 0
    }

    function addAssetDetailTag() {
        // add tag
        $('.subaccount-assets').attr('assetDetail', '')
    }

    function isSubAssetPage(){
        return $('.subaccount-assets').length > 0 
    }


    function showAsset() {

        if (isAssetDetailShown() || !isSubAssetPage()) {
            return
        }

        let cAsset = getAssetHTML()
        if (cAsset == undefined && (!isMonkeySetting()) ) return
        let onlySync = false
        if(isMonkeySetting()){
            onlySync = true
        }else{
            onlySync = false
        }

        addAssetDetailTag()

        updateData(cAsset, onlySync).then(data =>{

            $('\
            <div class="flex-container" >\
                <div class="row">\
                    <div class="column" style="width:80%"><canvas id="assetDetailChart"></canvas></div>\
                    <div class="column" style="width:20%">\
                        <div class="flex-container" id="sync">\
                            <label class="full-row" for="key"><a href="https://jsonbin.io/api-keys" target="_blank">JSONBIN.io bin id:</a></label>\
                            <textarea class="full-row" type="text" id="sync-id" name="key"></textarea>\
                            <div class="full-row">\
                            <button type="button" class="w3-btn w3-white w3-border w3-border-green w3-round-xlarge" id="sync-button">\
                                同步\
                            </button>\
                        </div>\
                        </div>\
                    </div>\
                </div>\
            </div>').insertAfter('.subaccount-assets')

            if( data['id'] && data['id']  != undefined && data['id']  != {} && data['id'].trim() != ''){
                $('#sync-id').val(data['id'])
            }

            let ctx = document.getElementById("assetDetailChart");
    
            plotAssetDetail(ctx, data['data'])
        })
    }


    function freshAsset(){
        if(isAssetDetailShown()){

            $('sync-button').text('同步中...')

            let cAsset = getAssetHTML()
            if (cAsset == undefined) return
    
            updateData(cAsset).then(data =>{
    
                if( data['id'] && data['id']  != undefined && data['id']  != {} && data['id'].trim() != ''){
                    $('#sync-id').val(data['id'])
                }
    
                let ctx = document.getElementById("assetDetailChart");
        
                plotAssetDetail(ctx, data['data'])

                $('sync-button').text('同步')
            })
        }else{
            showAsset()
        }
    }

    function callbackAsset() {
        // console.log('found Level bar')
        if(getAssetHTML()){
            setTimeout(() => {
                showAsset()
            }, 3000);
        }

    }


    function insertMonkeyMenu(){

        if ($('.subaccount-assets').length > 0) {
            return
        }

        let contentHTML =
'<div class="container">\
    <h1 class="title">huobi asset</h1>\
    <div class="container">\
        <div class="subaccount-assets">\
        </div>\
    </div>\
</div>'

        $('body').append(contentHTML)

    }


    // ===============================================
    // if (isSubAssetPage()) {
    // showAsset()
    $(document).ready(() => {

        if(isMonkeySetting()){
            insertMonkeyMenu()
            showAsset()
        }else{
            let observerLevel = new MutationObserver(callbackAsset)

            observerLevel.observe($('body').get(0),
                {
                    subtree: true, childList: true, characterData: true, attributes: true,
                    attributeFilter: ['.subaccount-assets'],
                    attributeOldValue: false, characterDataOldValue: false
                })
        }
        
    })
    // }

    $(document).on('click', '#sync-button', ()=>{

        let cAsset = getAssetHTML()
        if (cAsset == undefined && (! isMonkeySetting())) return

        updateData(cAsset, true)
    })

})();