// ==UserScript==
// @name         Free your hand - Pornhub
// @namespace    
// @version      1.1.1
// @license      MPL-2.0
// @description  easily fast forward video to the high time.
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

    let array_next_key = [78, 190]
    let array_pre_key = [66, 188]
    let array_anticlock = [72, 219 ]
    let array_clock = [74,221 ]

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

    /**
     * if video is found in page, this function will be called.
     * this functions contains :
     * - get all the view data
     * - analyse the progress bar
     * - get the highpoint 
     * - add marker to page
     */
    function actionVideo() {

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
        let nodevideo = $("video").get(0);
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


        // <============add markers on the process bar============>
        mark(array_peek_index, nodevideo.duration);

        // <============listen keyboard============>
        $(document).keydown(function (event) {

            if ( array_next_key.includes(event.keyCode)) { // next point (N)

                for (let i = 0; i < array_peek_index.length; i++) {

                    if (array_peek_index[i] > nodevideo.currentTime) {
                        nodevideo.currentTime = array_peek_index[i];
                        break;
                    }
                }

            } else if (array_pre_key.includes(event.keyCode)) { // previous point (B)

                for (let i = array_peek_index.length - 1; i > 0; i--) {

                    if (array_peek_index[i] < nodevideo.currentTime) {

                        if (i == 0) {

                            if ((nodevideo.currentTime - array_peek_index[i]) < (array_peek_index[i + 1] - array_peek_index[i]) / 3.) {
                                nodevideo.currentTime = 0;
                                break;
                            } else {
                                nodevideo.currentTime = array_peek_index[i];
                                break;
                            }

                        } else if (i == array_peek_index.length - 1) {
                            if ((nodevideo.currentTime - array_peek_index[i]) < (nodevideo.duration - array_peek_index[i]) / 3.) {
                                nodevideo.currentTime = array_peek_index[i - 1];
                                break;
                            } else {
                                nodevideo.currentTime = array_peek_index[i];
                                break;
                            }
                        } else {
                            if ((nodevideo.currentTime - array_peek_index[i]) < (array_peek_index[i + 1] - array_peek_index[i]) / 3.) {
                                nodevideo.currentTime = array_peek_index[i - 1];
                                break;
                            } else {
                                nodevideo.currentTime = array_peek_index[i];
                                break;
                            }
                        }
                    }
                }

            } else if (event.keyCode >= 48 && event.keyCode <= 57) { // number key

                // console.log("press ", (event.keyCode - 48))
                nodevideo.currentTime = (event.keyCode - 48) * nodevideo.duration / 10.

            } else if (event.keyCode >= 96 && event.keyCode <= 105) { // numpad number key

                // console.log("press ", (event.keyCode - 96))
                nodevideo.currentTime = (event.keyCode - 96) * nodevideo.duration / 10.

            } else if (array_anticlock.includes(event.keyCode)) { // Rotate anticlockwise (H)
                // console.log("press H")
                var angle = getRotationDegrees($(nodevideo)) - 90;
                console.log(angle);
                if (Math.abs(angle) === 90 || angle === 270) {
                    $(nodevideo).css("transform","rotate("+ angle +"deg)" + " scale(calc(16/9))")
                }
                else {
                    $(nodevideo).css("transform","rotate("+ angle +"deg)" + " scale(1)")
                }
                event.stopImmediatePropagation();

            } else if (array_clock.includes(event.keyCode)) { // Rotate clockwise (J)
                // console.log("press J")
                var angle = getRotationDegrees($(nodevideo)) + 90;
                console.log(angle);
                if (Math.abs(angle) === 90 || angle === 270) {
                    $(nodevideo).css("transform","rotate("+ angle +"deg)" + " scale(calc(16/9))")
                }
                else {
                    $(nodevideo).css("transform","rotate("+ angle +"deg)" + " scale(1)")
                }
                event.stopImmediatePropagation();
            }

        });
    }


    // <============Start Here============>
    $(document).ready(function () {
        console.log("ready!");

        // waiting video appeared
        waitForKeyElements("video", function () {
            if (isNaN($("video").get(0).duration)) {
                //console.log("wait load")
                $("video").on('loadedmetadata', function () {
                    actionVideo()
                })
            } else {
                //console.log("load directly")
                actionVideo()
            }
        }, false)

    });

})();