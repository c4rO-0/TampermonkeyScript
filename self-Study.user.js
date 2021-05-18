// ==UserScript==
// @name         self-Study
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        http://lsem.fudan.edu.cn/fd_aqks_new/examProgress/examSelfStudy/selfStudyShowAllTopic
// @icon         https://www.google.com/s2/favicons?domain=fudan.edu.cn
// @grant        none
// ==/UserScript==

( function() {
    'use strict';

    function getAnswer(element){

        return new Promise((resolve, reject) => {
            $(element).find('a').click()
            setTimeout(() => {
                resolve($(element).find('span.answer').text())
            }, 2000);
            
        })

    }


    function wait(ms) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                console.log("Done waiting");
                resolve(ms)
            }, ms)
        })
    }

    $('document').ready(()=>{
        if($('.top_link').length > 0){
            console.log('insert button')
            $('.top_link').prepend(
                '<button id="id-collect" >收集</button>'
            )
            document.getElementById("id-collect").onclick=async ()=>{
                console.warn("Starting...")
                let numQ = $('tbody tr').length
                let arrayAnswer = new Array(numQ)
                for (let index = 0; index < numQ; index++) {
                    arrayAnswer[index] = await getAnswer($('tbody tr:eq('+index+')'))
                    console.warn('get ' + index + '-ans ', arrayAnswer[index] )
                }

                console.warn('collecting done!!')
                // show all
                for (let index = 0; index < numQ; index++) {
                    $('tbody tr:eq('+index+') span.answer').text(arrayAnswer[index])
                    $('tbody tr:eq('+index+') span.answer').show()
                }
                console.warn('show all!!')
            };
        }
    })
    console.log("end");

})();