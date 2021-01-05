// ==UserScript==
// @name         Huobi TimeStamp
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  add Time for screenshot
// @author       You
// @match        https://account.huobi.com/*management/
// @grant        none
// @require      https://cdn.jsdelivr.net/npm/jquery@3.5.0/dist/jquery.min.js
// ==/UserScript==

(function() {
    'use strict';
    function callbackTitle(mutationsList, observer){
        if($('div.subaccount-assets .left p.title').length > 0){
            let strContent = $('div.subaccount-assets .left p.title').text();
            strContent += ' | '+ Date()
            console.log(strContent)
            $('div.subaccount-assets .left p.title').text(strContent)
            observer.disconnect()
        }else{
            console.log('not found')
        }
    }
    $(document).ready(()=>{
        if(document.getElementById('app')){

            let observerTitle = new MutationObserver(callbackTitle)

            observerTitle.observe($('#app').get(0),
                {
                    subtree: true, childList: true, characterData: false, attributes: true,
                    attributeFilter: ['.subaccount-assets'],
                    attributeOldValue: false, characterDataOldValue: false
                })

        }

    })
})();