// ==UserScript==
// @name         open link in new window - Trello
// @namespace    
// @version      0.2.1
// @license      MPL-2.0
// @description  Open the link in card description from new window. 
// @author       c4r
// @match        https://*trello.com/b/*
// @match        https://*trello.com/c/*
// @match        https://*trello.com/*
// @include      https://*trello.com/b/*
// @include      https://*trello.com/c/*
// @include      https://*trello.com*
// @require      https://code.jquery.com/jquery-latest.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';


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
    function waitForKeyElements (
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
            targetNodes     = $(selectorTxt);
        else
            targetNodes     = $(iframeSelector).contents ()
                                            .find (selectorTxt);

        if (targetNodes  &&  targetNodes.length > 0) {
            btargetsFound   = true;
            /*--- Found target node(s).  Go through each and act if they
                are new.
            */
            targetNodes.each ( function () {
                var jThis        = $(this);
                var alreadyFound = jThis.data ('alreadyFound')  ||  false;

                if (!alreadyFound) {
                    //--- Call the payload function.
                    var cancelFound     = actionFunction (jThis);
                    if (cancelFound)
                        btargetsFound   = false;
                    else
                        jThis.data ('alreadyFound', true);
                }
            } );
        }
        else {
            btargetsFound   = false;
        }

        //--- Get the timer-control variable for this selector.
        var controlObj      = waitForKeyElements.controlObj  ||  {};
        var controlKey      = selectorTxt.replace (/[^\w]/g, "_");
        var timeControl     = controlObj [controlKey];

        //--- Now set or clear the timer as appropriate.
        if (btargetsFound  &&  bWaitOnce  &&  timeControl) {
            //--- The only condition where we need to clear the timer.
            clearInterval (timeControl);
            delete controlObj [controlKey]
        }
        else {
            //--- Set a timer, if needed.
            if ( ! timeControl) {
                timeControl = setInterval ( function () {
                        waitForKeyElements (    selectorTxt,
                                                actionFunction,
                                                bWaitOnce,
                                                iframeSelector
                                            );
                    },
                    300
                );
                controlObj [controlKey] = timeControl;
            }
        }
        waitForKeyElements.controlObj   = controlObj;
    }   


    function addTarget() {

        let objContent = $("div.description-content > div.current");
        

        // console.log(objContent);
        
        if (objContent.length != 0) {
            let objUrl = $(objContent).find( "a[href^='http']" );
            
            $(objUrl).each(function(index, element){
        
        
                $(element).attr("target",$(element).attr("href"));
        
            });
        }
    }



    $( document ).ready(() =>{

        addTarget();

        waitForKeyElements ("div.window-wrapper.js-tab-parent > div.card-detail-window", addTarget);
                    
    });

})();