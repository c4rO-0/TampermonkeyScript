// ==UserScript==
// @name         Free your hand - Pornhub
// @namespace    
// @version      0.3.2
// @license      MPL-2.0
// @description  easily fast forward video to the high time.
// @author       c4r
// @match        https://www.pornhub.com/view_video.php?viewkey=*
// @require      https://code.jquery.com/jquery-latest.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function merge(left, right) { //合并两个子数组
        var result = [];
        while (left.length && right.length) {
            var item = left[0] >= right[0] ? left.shift() : right.shift();//注意:判断的条件是小于或等于,如果只是小于,那么排序将不稳定.
            result.push(item);
        }
        return result.concat(left.length ? left : right);
    }

    function mergeSort(array) {  //采用自上而下的递归方法
        var length = array.length;
        if (length < 2) {
            return array;
        }
        var m = (length >> 1),
            left = array.slice(0, m),
            right = array.slice(m); //拆分为两个子数组
        return merge(mergeSort(left), mergeSort(right));//子数组继续递归拆分,然后再合并
    }
    function filter_av(array_y){
        let av_n = Math.floor(array_y.length/100.);
        if(av_n < 5) {
            av_n = 5;
        }
        if(av_n%2 == 0){
            av_n = av_n +1;
        }
        let array_r = new Array(array_y.length);
        for(let i=0;i<array_y.length;i++){
            if(i< (av_n-1)/2){
                array_r[i]= array_y[i];
            }else if(array_y.length-i <= (av_n-1)/2 ){
                array_r[i]= array_y[i];
            }else{
                array_r[i] = 0;
                for(let j=0;j<av_n;j++){
                    array_r[i] = array_r[i] +  array_y[i +j - (av_n-1)/2];
                }
                array_r[i] = array_r[i] / av_n;
            }
        }
        return array_r;
    }

    function find_peak(array_y){

        let array_sort = array_y;
        mergeSort(array_sort);
        let average =  array_sort[Math.floor(array_sort.length*0.7)];
        // average = 0;
        console.log("av : " + average);

        let peek = new Array();
        if(array_y[1]< array_y[0] && array_y[0] > average){
            peek.push(0);
        }

        for(let i=1;i<array_y.length-1;i++){
            if(array_y[i-1]< array_y[i] &&  array_y[i+1]<= array_y[i] && array_y[i] > average){
                // console.log(peek.length, i,peek[peek.length-1], array_y[i]);
                // if(peek.length == 0 || (i - peek[peek.length-1] > array_y.length/40) || (array_y[i] > array_y[peek[peek.length-1]]) ){
                    peek.push(i);
                // }
                
            }
        }

        if(array_y[array_y.length-2]< array_y[array_y.length-1] && array_y[array_y.length-1] > average ){
            peek.push(array_y.length-1);
        }

        // console.log(peek)
        // console.log("============")
        // console.log(array_y.length/40)
        // console.log("============")
        // 去除多余
        let peek_del = new Array();
        for(let i=0;i<peek.length;i++){
            let toSave = true
            for(let j=0; j<peek.length;j++){
                // 红点间距最短为视频时长40等分, 在前后40等分中取最高的
                if(toSave && i != j && Math.abs(peek[j] - peek[i]) < array_y.length/40 && array_y[peek[i]] <= array_y[peek[j]] ){

                    
                    toSave = false
                    // console.log('del-----')
                    // console.log(i,peek[i],array_y[peek[i]])
                    // console.log(j,peek[j],array_y[peek[j]])
                }
            }
            if(toSave){
                peek_del.push(peek[i])
                // console.log('save-----')
                // console.log(i,peek[i],array_y[peek[i]])
            }
        }        

        return peek_del;
    }

    function mark(array_y, duration){

        let objBar = $("div.mhp1138_progressOverflow");
        // console.log(objBar);
        let markP1 = "<div data-tag=\"HighTime\" class=\"mhp1138_actionTag\" style=\"left: ";
        let markP3 = "%; width: 0.178995%;\"></div>";

        for(let i=0;i<array_y.length;i++){
            // console.log(i);
            $(objBar).append(markP1 + (array_y[i]/duration*100.).toString() + markP3);
        }

        $(objBar).find("div.mhp1138_actionTag").each((index, element) => {
            if($(element).attr("data-tag") == "HighTime"){

               $( element).css("background-color","red");

            }
        });
    }

    function actionVideo(){
        let str_point = $("polygon").attr("points");
        let str_array_point=str_point.split(" ");

        // console.log(str_array_point.length);
        // console.log(str_array_point[str_array_point.length-1]);

        // 得到数组
        let len_video=parseFloat(str_array_point[str_array_point.length-2].split(",")[0]);
        console.log("video :" + len_video);
        let array_point= new Array();
        for (i=0;i< str_array_point.length -1; i++){
            let point = str_array_point[i].split(",");
            let x = parseFloat(point[0]);
            let y = -parseFloat(point[1])+100.;
            // console.log(x,y);
            array_point.push([x,y]);
        }
        
        
        let nodevideo = $("video").get(0);
        let len_array = Math.floor(nodevideo.duration);
        
        console.log("debug : len_array : ", len_array)
        if(len_array % 2 == 0){
            len_array = len_array +1;
        }
        let array_eq_point = new Array(len_array);
        let dis=len_video/(len_array-1);

        let array_y = new Array();
        let array_x = new Array();
        for(i=0;i<len_array;i++){
            let x = dis*(i);
            let y = 0.;
            let xInRange= false;
            for(let j=0;j<array_point.length;j++){
                if((array_point[j])[0] > x ){
                    y = ((array_point[j])[1]-(array_point[j-1])[1])/((array_point[j])[0]-(array_point[j-1])[0])*(x-(array_point[j-1])[0])+(array_point[j-1])[1];
                    break;
                }
            }
            array_y.push(y);
            array_x.push(x);
            // console.log(i, x,y, (array_point[i]) )
        }

        let array_filter_y = filter_av(array_y);

        // console.log("====");
        // console.log(array_filter_y);
        // console.log("====");

        // <============得到峰值对应的index============>
        let array_peek_index = find_peak(array_filter_y);

        console.log("时长 : " + nodevideo.duration);

        // 得到对应的时间
        for(let i=0;i<array_peek_index.length;i++){
            array_peek_index[i] = array_peek_index[i] * dis/len_video * nodevideo.duration;
        }

        // console.log("peak : " + array_peek_index.length);

        // 做标记
        mark(array_peek_index,nodevideo.duration);

        // console.log(array_peek_index);
        // 当前播放进度
        // console.log(nodevideo.currentTime);


        $(document).keydown(function(event){

            if(event.keyCode == 190){ // 前进

                for(let i=0;i<array_peek_index.length;i++){

                    if(array_peek_index[i]>nodevideo.currentTime){
                        nodevideo.currentTime = array_peek_index[i];
                        break;
                    }
                }

            }else if (event.keyCode == 188){ // 后退

                for(let i=array_peek_index.length-1;i>0;i--){

                    if(array_peek_index[i]<nodevideo.currentTime){

                        if( i == 0 ){

                            if((nodevideo.currentTime - array_peek_index[i])< (array_peek_index[i+1]-array_peek_index[i])/3.){
                                nodevideo.currentTime = 0;
                                break;
                            }else{
                                nodevideo.currentTime = array_peek_index[i];
                                break;
                            }

                        }else if(i == array_peek_index.length-1){
                            if((nodevideo.currentTime - array_peek_index[i])< (nodevideo.duration-array_peek_index[i])/3.){
                                nodevideo.currentTime = array_peek_index[i-1];
                                break;
                            }else{
                                nodevideo.currentTime = array_peek_index[i];
                                break;
                            }
                        }else{
                            if((nodevideo.currentTime - array_peek_index[i])< (array_peek_index[i+1]-array_peek_index[i])/3.){
                                nodevideo.currentTime = array_peek_index[i-1];
                                break;
                            }else{
                                nodevideo.currentTime = array_peek_index[i];
                                break;
                            }
                        }
                    }
                }

            }else if (event.keyCode >= 48 && event.keyCode <= 57){ // 数字键
                
                nodevideo.currentTime = (event.keyCode-48) * nodevideo.duration/10.

            }
        });        
    }

    $( document ).ready(function() {
        console.log( "ready!" );


        // 准备等分数组
        // if(array_point.length %2 == 0){
        //     let len_array = array_point.length+1;
        // }else{
        //     let len_array = array_point.length;
        // }

        

        console.log("check video : " , $("video").get(0).duration)
        if(isNaN($("video").get(0).duration) ){
            console.log("wait load")
            $("video").on('loadedmetadata', function() {
                actionVideo()
            })
        }else{
            console.log("load directly")
            actionVideo()
        }
    });

})();