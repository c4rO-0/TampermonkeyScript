// ==UserScript==
// @name         open link in new window - Trello
// @namespace    
// @version      0.1.0
// @license      MPL-2.0
// @description  Open the link in card description from new window. 
// @author       c4r
// @match        https://trello.com/c/*
// @require      https://code.jquery.com/jquery-latest.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function addTarget() {
        let objContent = $("div.description-content > div.current");


        // console.log(objContent);
    
        let objUrl = $(objContent).find( "a[href^='http']" );
        
        $(objUrl).each(function(index, element){
    
    
            $(element).attr("target",$(element).attr("href"));
    
        })
    }


    $( document ).ready(() =>{

        addTarget();
                    
    });

})();