// ==UserScript==
// @name         Free your hand - Pornhub
// @namespace    
// @version      1.4.1
// @license      MPL-2.0
// @description  easily fast forward video to the high time, and rotate video.
// @author       c4r, foolool
// @match        https://*.pornhub.com/view_video.php?viewkey=*
// @match        https://*.pornhubpremium.com/view_video.php?viewkey=*
// @match        www.pornhubselect.com/*
// @require      https://code.jquery.com/jquery-latest.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    /**
     * Custom : the shortcut
     * you can specific your code via : https://keycode.info/ 
     * default : 
     * - next : n(78), >(190)
     * - previous : b(66), 188(<)
     * - antic clockwise rotate : h(72), [(219) 
     * - clockwise rotate : j(74) , ](219)
     */

    let default_array_next_key = [78, 190]
    let default_array_pre_key = [66, 188]
    let default_array_anticlock = [72, 219]
    let default_array_clock = [74, 221]


    /**
     * program values
     */
    let array_next_key = []
    let array_pre_key = []
    let array_anticlock = []
    let array_clock = []

    /*--- waitForKeyElements():  A utility function, for Greasemonkey scripts,
        that detects and handles AJAXed content.
        auther : BrockA
        homepage : https://gist.github.com/BrockA/2625891#file-waitforkeyelements-js
        Usage example:

            waitForKeyElements (
                "div.comments"
                , commentCallbackFunction
            );

            //--- Page-specific function to do what we want when the node is found.
            function commentCallbackFunction (jNode) {
                jNode.text ("This comment changed by waitForKeyElements().");
            }

        IMPORTANT: This function requires your script to have loaded jQuery.
    */
    function waitForKeyElements(
        selectorTxt,    /* Required: The jQuery selector string that
                        specifies the desired element(s).
                    */
        actionFunction, /* Required: The code to run when elements are
                        found. It is passed a jNode to the matched
                        element.
                    */
        bWaitOnce,      /* Optional: If false, will continue to scan for
                        new elements even after the first match is
                        found.
                    */
        iframeSelector  /* Optional: If set, identifies the iframe to
                        search.
                    */
    ) {
        var targetNodes, btargetsFound;

        if (typeof iframeSelector == "undefined")
            targetNodes = $(selectorTxt);
        else
            targetNodes = $(iframeSelector).contents()
                .find(selectorTxt);

        if (targetNodes && targetNodes.length > 0) {
            btargetsFound = true;
            /*--- Found target node(s).  Go through each and act if they
                are new.
            */
            targetNodes.each(function () {
                var jThis = $(this);
                var alreadyFound = jThis.data('alreadyFound') || false;

                if (!alreadyFound) {
                    //--- Call the payload function.
                    var cancelFound = actionFunction(jThis);
                    if (cancelFound)
                        btargetsFound = false;
                    else
                        jThis.data('alreadyFound', true);
                }
            });
        }
        else {
            btargetsFound = false;
        }


        //--- Get the timer-control variable for this selector.
        var controlObj = waitForKeyElements.controlObj || {};
        var controlKey = selectorTxt.replace(/[^\w]/g, "_");
        var timeControl = controlObj[controlKey];

        //--- Now set or clear the timer as appropriate.
        if (btargetsFound && bWaitOnce && timeControl) {
            //--- The only condition where we need to clear the timer.
            clearInterval(timeControl);
            delete controlObj[controlKey]
        }
        else {
            //--- Set a timer, if needed.
            if (!timeControl) {
                timeControl = setInterval(function () {
                    waitForKeyElements(selectorTxt,
                        actionFunction,
                        bWaitOnce,
                        iframeSelector
                    );
                },
                    300
                );
                controlObj[controlKey] = timeControl;
            }
        }
        waitForKeyElements.controlObj = controlObj;
    }

    function activeTab() {

        $('.tab-menu-item.tooltipTrig').removeClass('active')
        $('.tab-menu-item[data-tab="free-your-hand"]').addClass('active')
        $('.video-action-tab').removeClass('active')
        $('.video-action-tab.free-your-hand').addClass('active')

    }

    function shortcutItemHTML(name, label, keyShortcut) {

        let v = '<div class="video-info-row">\
        <span '+ name + '>\
            <a>'+ label + ' </a> \
            <input free-your-hand name="'+ name + '" type="text" size="1" maxlength="1" placeholder="' + keyShortcut + '"></input>\
        </span>'

        return v

    }

    function onListen() {

        $(document).on('click', '#id-free-your-hand-tab-menu', () => {
            activeTab()
        })

        $(document).on('keydown', 'input[free-your-hand]', (event) => {

            let e = document.activeElement

            if ($(e).is('input[free-your-hand]')) {

                var key = event.keyCode;
                // fresh input
                // only code is saved here. value is set by keypress.
                e.code = key
            }

        })

        $(document).on('keypress', 'input[free-your-hand]', (event) => {

            let e = document.activeElement

            if ($(e).is('input[free-your-hand]')) {

                var key = event.keyCode;

                let value = String.fromCharCode(key)
                console.log('keypress', e.name, event.which, key)

                // fresh input
                // only value is saved here. value is set by keydown.
                e.value = value

            }

        })

        $(document).on('click', '#id-free-your-hand-shortcut-save', () => {
            // save settings , and reload

            let data = getLocalData()
            if (data === undefined) {
                data = defaultData()
            }

            $('input[free-your-hand]').each((index, element) => {
                data.shortcut[element.name] = {
                    label: element.value, code: element.code
                }
            })
            saveLocalData(data)

            $('#id-free-your-hand-shortcut-save').text('done!')
            setTimeout(() => {
                $('#id-free-your-hand-shortcut-save').text('save shortcut')
            }, 300);

            setShortcutArrayFromLocalStorage()

            $('video').focus()

        })

        $(document).on('click', '#id-free-your-hand-shortcut-reset', () => {

            $('input[free-your-hand]').each((index, element) => {
                element.placeholder= ''
                element.value = ''
                element.code = ''
            })


            let data = getLocalData()
            if (data === undefined) {
                data = defaultData()
            }

            data["shortcut"] = {
                next: {},
                previous: {},
                clockwise: {},
                anticlockwise: {}
            }

            saveLocalData(data)

            $('#id-free-your-hand-shortcut-reset').text('done!')
            setTimeout(() => {
                $('#id-free-your-hand-shortcut-reset').text('reset shortcut')
            }, 300);

            setShortcutArrayFromLocalStorage()

            $('video').focus()
        })

    }

    function defaultData() {
        return {
            shortcut: {
                next: {},
                previous: {},
                clockwise: {},
                anticlockwise: {}
            }
        }
    }

    function saveLocalData(data) {
        localStorage.setItem('free-your-hand', JSON.stringify(data))
    }

    function getLocalData() {
        let rawData = localStorage.getItem('free-your-hand')

        if (rawData == undefined || rawData == '') {
            return undefined
        } else {
            return JSON.parse(rawData)
        }
    }

    function setShortcutArrayFromLocalStorage() {
        let data = getLocalData()
        // console.log(data.shortcut.next.code)
        if (data && data.shortcut.next["code"]) {
            array_next_key = [data.shortcut.next.code]
        } else {
            array_next_key = default_array_next_key
        }

        if (data && data.shortcut.previous["code"]) {
            array_pre_key = [data.shortcut.previous.code]
        } else {
            array_pre_key = default_array_pre_key
        }

        if (data && data.shortcut.clockwise["code"]) {
            array_clock = [data.shortcut.clockwise.code]
        } else {
            array_clock = default_array_clock
        }

        if (data && data.shortcut.anticlockwise["code"]) {
            array_anticlock = [data.shortcut.anticlockwise.code]
        } else {
            array_anticlock = default_array_anticlock
        }

    }

    function insertMenu() {

        if ($('.free-your-hand').length > 0) {
            return
        }

        let menuHTML =
            '<div class="tab-menu-wrapper-cell free-your-hand">\
    <div id="id-free-your-hand-tab-menu" class="tab-menu-item" data-tab="free-your-hand" onclick="" data-title="free-your-hand">\
        <i class="main-sprite-dark-2"></i>\
        <span>Hand</span>\
    </div>\
</div>'
        let contentHTML =
            '<div class="video-action-tab free-your-hand">\
    <div class="title">Free your hand</div>\
    <div class="reset"></div>\
    <div class="float-left">\
        <div id="id-free-your-hand-shortcut">\
            <button id="id-free-your-hand-shortcut-save" >save shortcut</button>\
            <button id="id-free-your-hand-shortcut-reset" >reset shortcut</button>\
        </div>\
    </div>\
    <div class="float-right">\
        <div id="id-free-your-hand-support">\
        </div>\
    </div>\
    <div class="reset"></div>\
</div>'

        // // turn off click listener
        // offListen()
        // delete free-your-hand element

        $('.free-your-hand').remove()

        // append free-your-hand element to tab-menu
        $('.tab-menu-wrapper-row').append(menuHTML)

        // append free-your-hand element to content
        $('.video-actions-container > .video-actions-tabs').append(contentHTML)

        // read local storage
        let fyhStorage = getLocalData()
        let strN = '', strP = '', strC = '', strAC = ''
        if (fyhStorage) {
            if (fyhStorage.shortcut.next.label) {
                strN = fyhStorage.shortcut.next.label
            }
            if (fyhStorage.shortcut.previous.label) {
                strP = fyhStorage.shortcut.previous.label
            }
            if (fyhStorage.shortcut.clockwise.label) {
                strC = fyhStorage.shortcut.clockwise.label
            }
            if (fyhStorage.shortcut.anticlockwise.label) {
                strAC = fyhStorage.shortcut.anticlockwise.label
            }

        }

        // add specific shortcut : next
        $('#id-free-your-hand-shortcut').append(
            shortcutItemHTML('next', 'Next high-point', strN)
        )

        // add specific shortcut : previous
        $('#id-free-your-hand-shortcut').append(
            shortcutItemHTML('previous', 'Previous high-point', strP)
        )

        // add specific shortcut : clockwise
        $('#id-free-your-hand-shortcut').append(
            shortcutItemHTML('clockwise', 'Next high-point', strC)
        )

        // add specific shortcut : anticlockwise
        $('#id-free-your-hand-shortcut').append(
            shortcutItemHTML('anticlockwise', 'Next high-point', strAC)
        )

        // // add click listener
        // onListen()

    }

    // Returns rotation in degrees when obtaining transform-styles using javascript
    // author : adamcbrewer
    // https://gist.github.com/adamcbrewer/4202226
    function getRotationDegrees(obj) {
        var matrix = obj.css("-webkit-transform") ||
            obj.css("-moz-transform") ||
            obj.css("-ms-transform") ||
            obj.css("-o-transform") ||
            obj.css("transform");
        if (matrix !== 'none') {
            var values = matrix.split('(')[1].split(')')[0].split(',');
            var a = values[0];
            var b = values[1];
            var angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));
        } else { var angle = 0; }
        return angle;
    }

    /**
     * merge two sorted array 
     * @param {*} left 
     * @param {*} right 
     */
    function merge(left, right) {
        var result = [];
        while (left.length && right.length) {
            var item = left[0] >= right[0] ? left.shift() : right.shift();
            result.push(item);
        }
        return result.concat(left.length ? left : right);
    }

    /**
     * merge sort method
     * @param {*} array 
     */
    function mergeSort(array) {
        var length = array.length;
        if (length < 2) {
            return array;
        }
        var m = (length >> 1),
            left = array.slice(0, m),
            right = array.slice(m); // split into two sub-array
        return merge(mergeSort(left), mergeSort(right)); // recurrence
    }

    /**
     * easiest Mean Average method
     * @param {array} array_y y value with spread with equal interval
     * @returns array with same length of array_y
     */
    function filter_av(array_y) {
        let av_n = Math.floor(array_y.length / 100.);
        if (av_n < 5) {
            av_n = 5;
        }
        if (av_n % 2 == 0) {
            av_n = av_n + 1;
        }
        let array_r = new Array(array_y.length);
        for (let i = 0; i < array_y.length; i++) {
            if (i < (av_n - 1) / 2) {
                array_r[i] = array_y[i];
            } else if (array_y.length - i <= (av_n - 1) / 2) {
                array_r[i] = array_y[i];
            } else {
                array_r[i] = 0;
                for (let j = 0; j < av_n; j++) {
                    array_r[i] = array_r[i] + array_y[i + j - (av_n - 1) / 2];
                }
                array_r[i] = array_r[i] / av_n;
            }
        }
        return array_r;
    }

    /**
     * find the maximum peak in array_y
     * @param {*} array_y 
     */
    function find_peak(array_y) {

        let array_sort = array_y;
        mergeSort(array_sort);
        let average = array_sort[Math.floor(array_sort.length * 0.7)];

        let peek = new Array();
        if (array_y[1] < array_y[0] && array_y[0] > average) {
            peek.push(0);
        }

        for (let i = 1; i < array_y.length - 1; i++) {
            if (array_y[i - 1] < array_y[i] && array_y[i + 1] <= array_y[i] && array_y[i] > average) {
                // console.log(peek.length, i,peek[peek.length-1], array_y[i]);
                // if(peek.length == 0 || (i - peek[peek.length-1] > array_y.length/40) || (array_y[i] > array_y[peek[peek.length-1]]) ){
                peek.push(i);
                // }

            }
        }

        if (array_y[array_y.length - 2] < array_y[array_y.length - 1] && array_y[array_y.length - 1] > average) {
            peek.push(array_y.length - 1);
        }

        // remove excess
        let peek_del = new Array();
        for (let i = 0; i < peek.length; i++) {
            let toSave = true
            for (let j = 0; j < peek.length; j++) {
                // The shortest red dot spacing is 40 equal parts for the video duration, the highest in the 40 sec.
                if (toSave && i != j && Math.abs(peek[j] - peek[i]) < array_y.length / 40 && array_y[peek[i]] <= array_y[peek[j]]) {
                    toSave = false
                }
            }
            if (toSave) {
                peek_del.push(peek[i])

            }
        }

        return peek_del;
    }

    /**
     * attach the marker to the progress bar in the page
     * @param {array} array_y 
     * @param {float} duration 
     */
    function mark(array_y, duration) {

        let objBar = $("div.mhp1138_progressOverflow");
        // console.log(objBar);
        let markP1 = "<div data-tag=\"HighTime\" class=\"mhp1138_actionTag\" style=\"left: ";
        let markP3 = "%; width: 0.178995%;\"></div>";

        for (let i = 0; i < array_y.length; i++) {
            // console.log(i);
            $(objBar).append(markP1 + (array_y[i] / duration * 100.).toString() + markP3);
        }

        $(objBar).find("div.mhp1138_actionTag").each((index, element) => {
            if ($(element).attr("data-tag") == "HighTime") {

                $(element).css("background-color", "red");

            }
        });
    }

    function getMarkPosition(duration, only_white = false) {

        let array_peek_index = []

        if(only_white){
            $('.mhp1138_actionTag[data-tag!="HighTime"]').each((index, element)=>{
                array_peek_index.push($(element).attr('style').split('%')[0].slice(('left:').length).trim()/100.*duration)
            })          
        }else{
            $('.mhp1138_actionTag').each((index, element)=>{
                array_peek_index.push($(element).attr('style').split('%')[0].slice(('left:').length).trim()/100.*duration)
            })
        }

        if(array_peek_index.length > 1){
            return (mergeSort(array_peek_index)).reverse()
        }

        return array_peek_index

        
    }

    function isMarked() {
        return $('[data-tag="HighTime"]').length > 0
    }

    function loadedPolygon() {

        return $("polygon").length > 0 && $("polygon").attr("points").split(" ").length > 0
    }


    /**
     * if video is found in page, this function will be called.
     * this functions contains :
     * - get all the view data
     * - analyse the progress bar
     * - get the highpoint 
     * - add marker to page
     */
    function actionVideo() {

        if (isMarked()) {
            return
        }

        if (!loadedPolygon()) {
            return
        }

        /**<============Get view data============>
         * the raw view data will be stored in `array_point` as a two dimensional matrix
         * array_point : [[x1,y2],[x2,y2],..]
         * x : 0 to 1000
         * y : 0 - 100
         */
        let str_point = $("polygon").attr("points");
        let str_array_point = str_point.split(" ");
        let len_point = parseFloat(str_array_point[str_array_point.length - 2].split(",")[0]);
        //console.log("video :" + len_point);
        let array_point = new Array();
        for (i = 0; i < str_array_point.length - 1; i++) {
            let point = str_array_point[i].split(",");
            let x = parseFloat(point[0]);
            let y = -parseFloat(point[1]) + 100.;
            // console.log(x,y);
            array_point.push([x, y]);
        }

        /**<============interpolation============>
         * interpolate the raw data at every second, and store in
         * array_x : second. range : 0 to the duration (closest even integer)
         * array_y : interpolated data from array_point. range : 0-100
         */
        let nodevideo = $("video:has(source[src])").get(0);
        let len_point_sec = Math.floor(nodevideo.duration);

        if (len_point_sec % 2 == 0) {
            len_point_sec = len_point_sec + 1;
        }

        let dis = len_point / (len_point_sec - 1);

        let array_y = new Array();
        let array_x = new Array();
        for (i = 0; i < len_point_sec; i++) {
            let x = dis * (i);
            let y = 0.;
            let xInRange = false;
            for (let j = 0; j < array_point.length; j++) {
                if ((array_point[j])[0] > x) {
                    y = ((array_point[j])[1] - (array_point[j - 1])[1]) / ((array_point[j])[0] - (array_point[j - 1])[0]) * (x - (array_point[j - 1])[0]) + (array_point[j - 1])[1];
                    break;
                }
            }
            array_y.push(y);
            array_x.push(x);
        }

        // <============smooth y data============>
        let array_smooth_y = filter_av(array_y);

        // <============Get the peak corresponding index============>
        let array_peek_index = find_peak(array_smooth_y);

        //  <============get the corresponding time============>
        for (let i = 0; i < array_peek_index.length; i++) {
            array_peek_index[i] = array_peek_index[i] * dis / len_point * nodevideo.duration;
        }

        // <============get "jump to" points, white points set by author ============>
        let array_white_peek_index = getMarkPosition(nodevideo.duration, true)
        // console.log("array_white_peek_index", array_white_peek_index)

        // <============delete peeks, which cover the white one (less than 40 sec) ============>
        array_white_peek_index.forEach(position_white => {
            array_peek_index = array_peek_index.filter((peek)=>{
                return Math.abs(peek - position_white) > 40
            })
        });
        

        // <============add markers on the process bar============>
        mark(array_peek_index, nodevideo.duration);
        console.log('your hands are free now !!!')
        // console.log('peek index : ', array_peek_index)

    }


    // <============Start Here============>
    $(document).ready(function () {

        console.log("loading your hand assistant...");

        setShortcutArrayFromLocalStorage()

        onListen()

        // waiting video appeared
        waitForKeyElements("video:has(source[src])", function () {

            if (isNaN($("video:has(source[src])").get(0).duration)) {
                // console.log("wait load")
                // console.log($("video:has(source[src])"))
                // console.log($("video:has(source[src])").get(0).duration)
                $("video:has(source[src])").on('loadedmetadata', function () {
                    actionVideo()
                    // insertMenu()
                })
            } else {
                // console.log("load directly")
                // console.log($("video:has(source[src])").get(0))
                // console.log($("video:has(source[src])").get(0).duration)
                actionVideo()
                // insertMenu()
            }

        }, false)

    });



    // <============listen keyboard============>
    $(document).keydown(function (event) {

        if ($(document.activeElement).is('input[free-your-hand]')) {
            return
        }

        // console.log('press:', event.keyCode)

        let nodevideo = $("video:has(source[src])").get(0);
        // console.log(array_peek_index)

        let array_peek_index = getMarkPosition(nodevideo.duration)
        // console.log(array_peek_index)

        if (array_next_key.includes(event.keyCode)) { // next point (N)

            for (let i = 0; i < array_peek_index.length; i++) {

                if (array_peek_index[i] > nodevideo.currentTime) {
                    nodevideo.currentTime = array_peek_index[i];
                    break;
                }
            }

            event.stopImmediatePropagation();

        } else if (array_pre_key.includes(event.keyCode)) { // previous point (B)

            let setDuration = null
            let currentTime = nodevideo.currentTime
            for (let i = array_peek_index.length - 1; i >= 0; i--) {
                // console.log('i : ', i ,array_peek_index[i] , currentTime, array_peek_index[i] < currentTime )
                if (array_peek_index[i] < currentTime) {

                    if (i == 0) {

                        if ((currentTime - array_peek_index[i]) < (array_peek_index[i + 1] - array_peek_index[i]) / 3.) {
                            setDuration = 0;
                            break;
                        } else {
                            setDuration = array_peek_index[i];
                            break;
                        }

                    } else if (i == array_peek_index.length - 1) {
                        if ((currentTime - array_peek_index[i]) < (nodevideo.duration - array_peek_index[i]) / 3.) {
                            setDuration = array_peek_index[i - 1];
                            break;
                        } else {
                            setDuration = array_peek_index[i];
                            break;
                        }
                    } else {
                        if ((currentTime - array_peek_index[i]) < (array_peek_index[i + 1] - array_peek_index[i]) / 3.) {
                            setDuration = array_peek_index[i - 1];
                            break;
                        } else {
                            setDuration = array_peek_index[i];
                            break;
                        }
                    }
                }
            }
            // console.log('set duration : ', setDuration)
            if(setDuration){
                nodevideo.currentTime = setDuration
            }
            
            event.stopImmediatePropagation();

        } else if (event.keyCode >= 48 && event.keyCode <= 57) { // number key

            // console.log("press ", (event.keyCode - 48))
            nodevideo.currentTime = (event.keyCode - 48) * nodevideo.duration / 10.
            event.stopImmediatePropagation();

        } else if (event.keyCode >= 96 && event.keyCode <= 105) { // numpad number key

            // console.log("press ", (event.keyCode - 96))
            nodevideo.currentTime = (event.keyCode - 96) * nodevideo.duration / 10.
            event.stopImmediatePropagation();

        } else if (array_anticlock.includes(event.keyCode)) { // Rotate anticlockwise (H)
            // console.log("press H")
            var angle = getRotationDegrees($(nodevideo)) - 90;
            // console.log(angle);
            if (Math.abs(angle) === 90 || angle === 270) {
                $(nodevideo).css("transform", "rotate(" + angle + "deg)" + " scale(calc(16/9))")
            }
            else {
                $(nodevideo).css("transform", "rotate(" + angle + "deg)" + " scale(1)")
            }
            event.stopImmediatePropagation();

        } else if (array_clock.includes(event.keyCode)) { // Rotate clockwise (J)
            // console.log("press J")
            var angle = getRotationDegrees($(nodevideo)) + 90;
            // console.log(angle);
            if (Math.abs(angle) === 90 || angle === 270) {
                $(nodevideo).css("transform", "rotate(" + angle + "deg)" + " scale(calc(16/9))")
            }
            else {
                $(nodevideo).css("transform", "rotate(" + angle + "deg)" + " scale(1)")
            }
            event.stopImmediatePropagation();
        }

    });    

})();