// ==UserScript==
// @name         Free your hand - Pornhub
// @namespace    
// @version      1.5.4
// @license      MPL-2.0
// @description  easily fast forward video, rotate video, and set playback speed of the video.
// @author       c4r, foolool
// @match        https://*.pornhub.com/view_video.php?viewkey=*
// @match        https://*.pornhubpremium.com/view_video.php?viewkey=*
// @match        www.pornhubselect.com/*
// @require      https://code.jquery.com/jquery-latest.js
// @require      https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js
// @resource      https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css
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
     * - speed up : i(73)
     * - speed down : u(85)
     * - speed list : 0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 4.0
     */

    let default_array_next_key = [78, 190]
    let default_array_pre_key = [66, 188]
    let default_array_anticlock = [72, 219]
    let default_array_clock = [74, 221]
    let default_array_speed_up = [73]
    let default_array_speed_down = [85]
    let default_array_speed_list = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 4.0] 

    let sensitive = 0.8


    /**
     * program values
     */
    let array_next_key = []
    let array_pre_key = []
    let array_anticlock = []
    let array_clock = []
    let array_speed_up = []
    let array_speed_down = []
    let array_speed_list = []

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

    function showMSG(msg, duration) {
        $('.mhp1138_ccContainer').text(msg)
        setTimeout(() => {
            $('.mhp1138_ccContainer').text('')
        }, duration);
    }

    function activeTab() {

        $('.tab-menu-item.tooltipTrig').removeClass('active')
        $('.tab-menu-item[data-tab="free-your-hand"]').addClass('active')
        $('.video-action-tab').removeClass('active')
        $('.video-action-tab.free-your-hand').addClass('active')

    }

    function shortcutItemHTML(name, description, keyLabel) {

        let v = '<li class="alpha omega">\
        <span '+ name + '>\
            <button free-your-hand name="'+ name + '" style="width:70%">'+ description +'</button>\
            <a free-your-hand name="'+ name + '" style="width:70%;text-align:center">\
            '+keyLabel+'\
            </a>\
            <input free-your-hand name="'+ name + '" type="text" size="1" maxlength="1" placeholder="' + keyLabel + '" style="display:none;width:20%"></input>\
        </span>\
        </li>'

        return v
    }

    function shortcutKeyStrHTML(name, description, keyLabel){
        return '<li class="alpha omega" >\
        <span '+ name + '>\
        <a free-your-hand name="'+ name + '">\
            '+keyLabel+'\
        </a>\
        <input free-your-hand name="'+ name + '" type="text" size="1" maxlength="1" placeholder="' + keyLabel + '" style="display:none"></input>\
        </span></li>'

    }

    function insertKeyHTML(numPlace, name, description, keyLabel){
        $('#id-free-your-hand-shortcut div.display-grid  ul.actionTagList:eq('+numPlace+')').append(
            shortcutItemHTML(name, description, keyLabel)
        )
        // $('#id-free-your-hand-shortcut div.display-grid  ul.actionTagList:eq('+(numPlace+1)+')').append(
        //     shortcutKeyStrHTML(name, description, keyLabel)
        // )
        // $('input[free-your-hand][name="'+ name + '"]').hide()
    }


    function onListen() {

        $(document).on('click', '#id-free-your-hand-tab-menu', () => {
            activeTab()
        })

        // set new shortcut : observed keydown
        $(document).on('keydown', 'input[free-your-hand]', (event) => {


            if (event.isComposing || event.keyCode === 229) {
                return;
            }

            let e = document.activeElement

            if ($(e).is('input[free-your-hand]')) {

                event = event || window.event
                var keyCode = event.which || event.keyCode;

                let value = String.fromCharCode(keyCode)


                console.log('keypress', e.name, event.which, event.keyCode, e.charCode)

                let name = e.name
                $('#id-free-your-hand-shortcut a[name="'+ name +'"]').text(value)
                $('#id-free-your-hand-shortcut input[name="'+ name +'"]').attr('placeholder', value)

                $('#id-free-your-hand-shortcut a[name="'+ name +'"]').show()
                $('#id-free-your-hand-shortcut input[name="'+ name +'"]').hide()

                // store
                let data = getLocalData()
                if (data === undefined) {
                    data = defaultData()
                }
                data.shortcut[name] = {
                    label: value, code: keyCode
                }
                saveLocalData(data)
    
                setShortcutArrayFromLocalStorage()
    
                $('video').focus()

                event.stopImmediatePropagation();
            }

        })

        $(document).on('click', '#id-free-your-hand-shortcut a[free-your-hand]', (event) => {

            let name = $(event.target).attr('name')
            // console.log('click set shortcut: ', name)
            $('#id-free-your-hand-shortcut a[name="'+ name +'"]').hide()
            $('#id-free-your-hand-shortcut input[name="'+ name +'"]').show()
            $('#id-free-your-hand-shortcut input[name="'+ name +'"]').focus()

            $('#id-free-your-hand-shortcut input[name="'+ name +'"]').focusout(()=>{
                $('#id-free-your-hand-shortcut a[name="'+ name +'"]').show()
                $('#id-free-your-hand-shortcut input[name="'+ name +'"]').hide()
            })
        })
        

        $(document).on('click', '#id-free-your-hand-shortcut button[free-your-hand]', (event) => {

            let name = $(event.target).attr('name')
            console.log('click button: ', name)


            let nodevideo = $("video:has(source[src])").get(0);
            // console.log(array_peek_index)

            let array_peek_index = getMarkPosition(nodevideo.duration)
            // console.log(array_peek_index)

            if(name == 'previous'){
                preHighPoint(nodevideo, array_peek_index)
            }else if (name == 'next') {
                nextHighPoint(nodevideo, array_peek_index)
            }else if (name == 'anticlockwise') {
                anticlockwise(nodevideo)
            }else if (name == 'clockwise') {
                clockwise(nodevideo)
            }else if (name == 'speedup') {
                speedUp(nodevideo)
            }else if (name == 'speeddn') {
                speedDown(nodevideo)
            }

        })

        $(document).on('click', '#id-free-your-hand-shortcut-reset', () => {

            $('input[free-your-hand]').each((index, element) => {
                element.placeholder = ''
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
                anticlockwise: {},
                speedup: {},
                speeddn: {}
            }

            saveLocalData(data)

            $('#id-free-your-hand-shortcut-reset').text('done!')
            setTimeout(() => {
                $('#id-free-your-hand-shortcut-reset').text('reset shortcut')
            }, 300);

            setShortcutArrayFromLocalStorage()

            showShortcut()

            $('video').focus()
        })

    }

    function defaultData() {
        return {
            shortcut: {
                next: {},
                previous: {},
                clockwise: {},
                anticlockwise: {},
                speedup: {},
                speeddn: {}
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

        if (data && data.shortcut.speedup["code"]) {
            array_speed_up = [data.shortcut.speedup.code]
        } else {
            array_speed_up = default_array_speed_up
        }

        if (data && data.shortcut.speeddn["code"]) {
            array_speed_down = [data.shortcut.speeddn.code]
        } else {
            array_speed_down = default_array_speed_down
        }

        array_speed_list = default_array_speed_list

    }


    function genCharFromArryCode(array_key_code, connector = ' '){

        if(array_key_code.length == 0 ){
            return ''
        }else{
            let str = ''
            array_key_code.forEach( (charCode,index) => {
                if(index != array_key_code.length){
                    str += String.fromCharCode(charCode) + connector
                }else{
                    str += String.fromCharCode(charCode)
                }
                
            });

            return str
        }

    }

    function showShortcut(){

        // read local storage
        let fyhStorage = getLocalData()


        let strN = genCharFromArryCode(default_array_next_key), 
        strP = genCharFromArryCode(default_array_pre_key), 
        strC = genCharFromArryCode(default_array_anticlock), 
        strAC = genCharFromArryCode(default_array_clock),
        strSU = genCharFromArryCode(default_array_speed_up), 
        strSD = genCharFromArryCode(default_array_speed_down)

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
            if (fyhStorage.shortcut.speedup.label) {
                strSU = fyhStorage.shortcut.speedup.label
            }
            if (fyhStorage.shortcut.speeddn.label) {
                strSD = fyhStorage.shortcut.speeddn.label
            }


        }

        $('#id-free-your-hand-shortcut div.display-grid  ul.actionTagList').empty()

        // add specific shortcut : next
        insertKeyHTML(1, 'next', 'Next', strN)
        
        // add specific shortcut : previous
        insertKeyHTML(0, 'previous', 'Previous',strP)

        // add specific shortcut : clockwise
        insertKeyHTML(1, 'clockwise', 'clockwise', strC)

        // add specific shortcut : anticlockwise
        insertKeyHTML(0, 'anticlockwise', 'anticlockwise', strAC)


        // // add specific shortcut : speed up
        insertKeyHTML(1, 'speedup', 'speedup', strSU)

        // // add specific shortcut : speed down
        insertKeyHTML(0, 'speeddn', 'speeddn', strSD)

        // // add click listener
        // onListen()

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
            <button id="id-free-your-hand-shortcut-reset" >reset shortcut</button>\
        </div>\
    </div>\
    <div class="float-right">\
        <div id="id-free-your-hand-support">\
        </div>\
    </div>\
    <div class="reset"></div>\
</div>'


    let tableHTML = 
'<div class="display-grid col-4 gap-row-none sortBy seconds">\
<ul class="actionTagList full-width margin-none"></ul>\
<ul class="actionTagList full-width margin-none"></ul>\
<ul class="actionTagList full-width margin-none"></ul>\
<ul class="actionTagList full-width margin-none"></ul>\
</div>\
'

        // // turn off click listener
        // offListen()
        // delete free-your-hand element

        $('.free-your-hand').remove()

        // append free-your-hand element to tab-menu
        $('.tab-menu-wrapper-row').prepend(menuHTML)

        // append free-your-hand element to content
        $('.video-actions-container > .video-actions-tabs').append(contentHTML)

        $('#id-free-your-hand-shortcut').append(
            tableHTML
        )
        $('#id-free-your-hand-shortcut').append(
            '<div class="reset"></div>'
        )
        
        showShortcut()
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
        let average = array_sort[ Math.max(0, Math.min(Math.floor(array_sort.length * sensitive), array_sort.length - 1)) ];

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

        if (only_white) {
            $('.mhp1138_actionTag[data-tag!="HighTime"]').each((index, element) => {
                array_peek_index.push($(element).attr('style').split('%')[0].slice(('left:').length).trim() / 100. * duration)
            })
        } else {
            $('.mhp1138_actionTag').each((index, element) => {
                array_peek_index.push($(element).attr('style').split('%')[0].slice(('left:').length).trim() / 100. * duration)
            })
        }

        if (array_peek_index.length > 1) {
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
            array_peek_index = array_peek_index.filter((peek) => {
                return Math.abs(peek - position_white) > 40
            })
        });


        // <============add markers on the process bar============>
        mark(array_peek_index, nodevideo.duration);
        console.log('your hands are free now !!!')
        showMSG('your hands are free now !!!', 2000)
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
                    insertMenu()
                    activeTab()
                })
            } else {
                // console.log("load directly")
                // console.log($("video:has(source[src])").get(0))
                // console.log($("video:has(source[src])").get(0).duration)
                actionVideo()
                insertMenu()
                activeTab()
            }

        }, false)

    });

    // <============keyDown function============>
    function nextHighPoint(nodevideo, array_peek_index){

        for (let i = 0; i < array_peek_index.length; i++) {

            if (array_peek_index[i] > nodevideo.currentTime) {
                nodevideo.currentTime = array_peek_index[i];
                break;
            }
        }
    }

    function preHighPoint(nodevideo, array_peek_index){

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
                    // console.log('i : ', i , 
                    // (currentTime - array_peek_index[i]) ,
                    //  (array_peek_index[i + 1] - array_peek_index[i]) / 3., 
                    //  (currentTime - array_peek_index[i]) < (array_peek_index[i + 1] - array_peek_index[i]) / 3.)

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
        if (setDuration != null) {
            nodevideo.currentTime = setDuration
        }
    }

    function anticlockwise(nodevideo){
        // console.log("press H")
        var angle = getRotationDegrees($(nodevideo)) - 90;
        // console.log(angle);
        if (Math.abs(angle) === 90 || Math.abs(angle) === 270) {
            $(nodevideo).css("transform", "rotate(" + angle + "deg)" + " scale(calc(" 
            + (nodevideo.videoHeight > nodevideo.videoWidth 
            ? nodevideo.videoWidth/nodevideo.videoHeight 
            : nodevideo.videoHeight/nodevideo.videoWidth )
            + "))")
            
        }
        else {
            $(nodevideo).css("transform", "rotate(" + angle + "deg)" + " scale(1)")
        }

        showMSG('Rotate '+angle, 2000)
    }

    function clockwise(nodevideo){
        // console.log("press J")
        var angle = getRotationDegrees($(nodevideo)) + 90;
        // console.log(angle);
        if (Math.abs(angle) === 90 || Math.abs(angle) === 270) {
            $(nodevideo).css("transform", "rotate(" + angle + "deg)" + " scale(calc(" 
            + (nodevideo.videoHeight > nodevideo.videoWidth 
            ? nodevideo.videoWidth/nodevideo.videoHeight 
            : nodevideo.videoHeight/nodevideo.videoWidth )
            + "))")
        }
        else {
            $(nodevideo).css("transform", "rotate(" + angle + "deg)" + " scale(1)")
        }
        
        showMSG('Rotate '+angle, 2000)
    }

    function speedUp(nodevideo){
        var cSpeed = $(nodevideo).get(0).playbackRate

        let array_larger = array_speed_list.filter((el)=>{ return el > cSpeed })
        
        if(array_larger.length == 0){
            $(nodevideo).get(0).playbackRate = Math.max.apply(Math,array_speed_list); 
        }else{
            $(nodevideo).get(0).playbackRate = Math.min.apply(Math,array_larger); 
        }

        showMSG('Speed x'+$(nodevideo).get(0).playbackRate, 2000)

        // console.log($(nodevideo).get(0).playbackRate)
    }

    function speedDown(nodevideo){

        var cSpeed = $(nodevideo).get(0).playbackRate

        let array_smaller = array_speed_list.filter((el)=>{ return el < cSpeed })
        
        if(array_smaller.length == 0){
            $(nodevideo).get(0).playbackRate = Math.min.apply(Math,array_speed_list); 
        }else{
            $(nodevideo).get(0).playbackRate = Math.max.apply(Math,array_smaller); 
        }

        showMSG('Speed x'+$(nodevideo).get(0).playbackRate, 2000)

        // console.log($(nodevideo).get(0).playbackRate)
    }    

    // <============listen keyboard============>
    $(document).keydown(function (event) {

        if (event.isComposing || event.keyCode === 229) {
            return;
        }

        if ($(document.activeElement).is('input[free-your-hand]')) {
            return
        }

        event = event || window.event
        var keyCode = event.which || event.keyCode;

        console.log('press:', keyCode)

        let nodevideo = $("video:has(source[src])").get(0);
        // console.log(array_peek_index)

        let array_peek_index = getMarkPosition(nodevideo.duration)
        // console.log(array_peek_index)

        if (array_next_key.includes(keyCode)) { // next point (N)

            nextHighPoint(nodevideo, array_peek_index)

            event.stopImmediatePropagation();

        } else if (array_pre_key.includes(keyCode)) { // previous point (B)

            preHighPoint(nodevideo, array_peek_index)

            event.stopImmediatePropagation();

        } else if (keyCode >= 48 && keyCode <= 57) { // number key

            // console.log("press ", (keyCode - 48))
            nodevideo.currentTime = (keyCode - 48) * nodevideo.duration / 10.
            event.stopImmediatePropagation();

        } else if (keyCode >= 96 && keyCode <= 105) { // numpad number key

            // console.log("press ", (keyCode - 96))
            nodevideo.currentTime = (keyCode - 96) * nodevideo.duration / 10.
            event.stopImmediatePropagation();

        } else if (array_anticlock.includes(keyCode)) { // Rotate anticlockwise (H)

            anticlockwise(nodevideo)
            event.stopImmediatePropagation();

        } else if (array_clock.includes(keyCode)) { // Rotate clockwise (J)

            clockwise(nodevideo)
            event.stopImmediatePropagation();

        } else if (array_speed_up.includes(keyCode)) { // Speed up (A)

            speedUp(nodevideo)
            event.stopImmediatePropagation();
        } else if (array_speed_down.includes(keyCode)) { // Speed down (s)

            speedDown(nodevideo)
            event.stopImmediatePropagation();
        }

    });

})();