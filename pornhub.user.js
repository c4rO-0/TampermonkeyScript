// ==UserScript==
// @name         pornhub
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.pornhub.com/view_video.php?viewkey=*
// @require      https://code.jquery.com/jquery-latest.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function filter_av(array_y){
        let av_n = 5;
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
        let peek = new Array();
        if(array_y[1]< array_y[0]){
            peek.push(0);
        }

        for(let i=1;i<array_y.length-1;i++){
            if(array_y[i-1]< array_y[i] &&  array_y[i+1]< array_y[i]){
                peek.push(i);
            }
        }

        if(array_y[array_y.length-2]< array_y[array_y.length-1]){
            peek.push(array_y.length-1);
        }
        return peek;
    }

    $( document ).ready(function() {
        console.log( "ready!" );
        let str_point = $("polygon").attr("points");
        let str_array_point=str_point.split(" ");

        console.log(str_array_point.length);
        console.log(str_array_point[str_array_point.length-1]);

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

        // 准备等分数组
        // if(array_point.length %2 == 0){
        //     let len_array = array_point.length+1;
        // }else{
        //     let len_array = array_point.length;        
        // }

        let len_array = 11;
        let array_eq_point = new Array(len_array);
        let dis=len_video/len_array;
        
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
            // console.log(x,y)
        }

        let array_filter_y = filter_av(array_y);

        // console.log("====");
        // console.log(array_filter_y);
        // console.log("====");
        let array_peek = find_peak(array_filter_y);


        let nodevideo = $("video").get(0);
        console.log("时长 : " + nodevideo.duration);
        // console.log(nodevideo.currentTime);


    });

})();