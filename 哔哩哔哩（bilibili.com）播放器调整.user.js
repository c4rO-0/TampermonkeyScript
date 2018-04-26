// ==UserScript==
// @name        哔哩哔哩（bilibili.com）播放器调整
// @namespace   micky7q7
// @author      mickey7q7
// @license     MIT License
// @homepageURL https://github.com/mickey7q7/bilibili_adjustPlayer
// @include     http*://www.bilibili.com/video/av*
// @include     http*://www.bilibili.com/watchlater/*
// @include     http*://www.bilibili.com/bangumi/play/ep*
// @include     http*://www.bilibili.com/bangumi/play/ss*
// @include     http*://bangumi.bilibili.com/anime/*/play*
// @include     http*://bangumi.bilibili.com/movie/*
// @exclude     http*://bangumi.bilibili.com/movie/
// @description 调整B站播放器设置，增加一些实用的功能。
// @version     1.31
// @grant       GM.setValue
// @grant       GM_setValue
// @grant       GM.getValue
// @grant       GM_getValue
// @grant       unsafeWindow
// @run-at      document-end
// ==/UserScript==
(function () {
	'use strict';
	var adjustPlayer = {
		doubleClickFullScreen: function (set,delayed) {
			if (typeof set !== 'undefined' && typeof delayed !== 'undefined') {
				try{
					if (delayed === 0 ) {
						var video = isBangumi('.bilibili-player-video video');
						video.addEventListener('dblclick', function () {
							var fullScreenBtn = isBangumi('div[name="browser_fullscreen"]');
							if (fullScreenBtn !== null) {
								doClick(fullScreenBtn);
							}
						});
					} else {
						var videoParentNodeEvent = function() {
							var dblclickTimer = null;
							var videoParentNode = isBangumi('.bilibili-player-video');
							videoParentNode.addEventListener('click', function () {
								clearTimeout(this.dblclickTimer);
								this.dblclickTimer = window.setTimeout(function() {
									var playPauseBtn = isBangumi('.bilibili-player-video-control > div.bilibili-player-video-btn-start');
									if (playPauseBtn !== null) {
										doClick(playPauseBtn);
									}
								}, delayed);
							});

							videoParentNode.addEventListener('dblclick', function () {
								clearTimeout(this.dblclickTimer);
								var fullScreenBtn = isBangumi('div[name="browser_fullscreen"]');
								if (fullScreenBtn !== null) {
									doClick(fullScreenBtn);
								}
							});
						};

						var iframePlayer = document.querySelector('iframe.bilibiliHtml5Player');
						if (iframePlayer === null) {
							window.eval( [
								'$(".bilibili-player-video").unbind("click");',
								'window.bilibiliPlayerVideoEvents = $(".bilibili-player-video").data("events")'
							].join(''));
						} else {
							iframePlayer.contentWindow.window.eval( [
								'$(".bilibili-player-video").unbind("click");',
								'top.window.bilibiliPlayerVideoEvents = $(".bilibili-player-video").data("events")'
							].join(''));
						}

						//console.log(unsafeWindow.bilibiliPlayerVideoEvents);
						if (typeof unsafeWindow.bilibiliPlayerVideoEvents === 'undefined') {
							videoParentNodeEvent();
						} else {
							if (typeof unsafeWindow.bilibiliPlayerVideoEvents.click === 'undefined') {
								videoParentNodeEvent();
							} else {
								console.log('doubleClickFullScreen： unbind click event failed');
								return;
							}
							console.log('doubleClickFullScreen： unbind click event failed');
						}
					}
				} catch (e) {console.log('doubleClickFullScreen：'+e);}
			}
		},
		autoWide: function (set,fullscreen) {
			if (typeof set !== 'undefined') {
				var player = isPlayer();
				if (player === "flashPlayer") {
					var flashPlayer = isBangumi('#bofqi');
					var newPlayer = isBangumi('param[name="flashvars"]');
					var oldPlayer = isBangumi('iframe[class="player"]');
					if (flashPlayer.getAttribute('class') !== 'scontent wide') {
						if (newPlayer !== null) {
							newPlayer.value += '&as_wide=1';
							flashPlayer.innerHTML = flashPlayer.innerHTML;
						} else if (oldPlayer !== null) {
							oldPlayer.src += '&as_wide=1';
						}
					}
				} else if (player === "html5Player") {
					var autoWidescreen = function () {
						var widescreenBtn = isBangumi('i[name="widescreen"]');
						if (widescreenBtn !== null) {
							if (widescreenBtn.getAttribute('data-text') !== '退出宽屏') {
								doClick(widescreenBtn);
							}
						}
					};
					autoWidescreen();

					if (typeof fullscreen !== 'undefined' ) {
						if (fullscreen === 'on') {
							function fullscreenEvent(e) {
								var element = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
								if(typeof element === 'undefined') {
									autoWidescreen();
								}
							}
							document.addEventListener("fullscreenchange", fullscreenEvent);
							document.addEventListener("webkitfullscreenchange", fullscreenEvent);
							document.addEventListener("mozfullscreenchange", fullscreenEvent);
							document.addEventListener("MSFullscreenChange", fullscreenEvent);
						}
					}
				}
			}
		},
		autoFocus: function (set,type,value,position,shortcuts) {
			if (typeof set !== 'undefined') {
				try{
					var scrollToY;
					var currentScrollToY = (window.pageYOffset || document.documentElement.scrollTop) - (document.documentElement.clientTop || 0);
					var playerHeight = document.querySelector('#bofqi .player').offsetHeight;

					if (matchURL.isWatchlater() === true) {
						scrollToY = document.querySelector('.video-box-module').offsetTop;
					} else if (matchURL.isBangumiMovie() === true) {
						var moviePlayWrapper = document.querySelector('.movie_play_wrapper');
						scrollToY = moviePlayWrapper.offsetParent.offsetTop + moviePlayWrapper.offsetTop;
					} else {
						var oldPlayerWrapper= document.querySelector('.player-wrapper');
						var newPlayerWrapper= document.querySelector('.player-box');
						if(oldPlayerWrapper !== null) {
							scrollToY = oldPlayerWrapper.offsetTop;
						} else {
							scrollToY = newPlayerWrapper.offsetTop;
						}
					}

					if(shortcuts === true){
						unsafeWindow.scrollTo(0, 0);
					}

					window.setTimeout(function() {
						if (typeof position !== 'undefined' ) {
							if (position === "video") {
								if (matchURL.isWatchlater()) {
									scrollToY = scrollToY + document.querySelector('#bofqi').offsetParent.offsetTop;
								} else if (matchURL.isBangumiMovie()) {
									scrollToY = scrollToY + document.querySelector('.movie_play').offsetTop - document.querySelector('.movie_play_wrapper').offsetTop;
								} else if (matchURL.isNewBangumi()) {
									scrollToY = scrollToY + document.querySelector('.bangumi-player').offsetTop;
								} else {
									scrollToY = scrollToY + document.querySelector('#bofqi').offsetTop;
								}
							}
						}

						if (typeof value !== 'undefined' && typeof type !== 'undefined') {
							if (type === "add") {
								scrollToY += value;
							} else if (type === "sub") {
								scrollToY -= value;
							}
						}

						if((scrollToY <= (currentScrollToY - playerHeight)) && shortcuts !== true){
							return;
						} else {
							unsafeWindow.scrollTo(0, scrollToY);
						}

					}, 200);

				} catch (e) {console.log('autoFocus：'+e);}
			}
		},
		autoPlay: function (set,video) {
			if (typeof set !== 'undefined' && video !== null) {
				var controlBtn = isBangumi('.bilibili-player-video-control div[name="pause_screen"]');
				var playButton = isBangumi('i[name="play_button"]');
				if (controlBtn === null) {
					if (video.play) {
						video.play();
					} else {
						doClick(playButton);
					}
				}
			}
		},
		hideDanmuku: function (set,type) {
			if (typeof set !== 'undefined') {
				var hideDanmuku = function () {
					var controlBtn = isBangumi('.bilibili-player-video-control > div[name="ctlbar_danmuku_on"] i');
					if (controlBtn !== null) {
						doClick(controlBtn);
					}
				};

				if (typeof type !== 'undefined') {
					if (type === "all") {
						hideDanmuku();
					} else if (type === "bangumi") {
						if (matchURL.isOldBangumi()) {
							hideDanmuku();
						} else if (matchURL.isNewBangumi()){
							hideDanmuku();
						}
					}
				} else {
					hideDanmuku();
				}
			}
		},
		danmukuPreventShade: function (set,type) {
			if (typeof set !== 'undefined' && typeof type !== 'undefined') {
				try{
					var controlBtn = isBangumi('.bilibili-player-danmaku-setting-lite-panel input.bilibili-player-setting-preventshade + label');
					if(controlBtn !== null) {
						doClick(controlBtn);
						window.setTimeout(function() {
							if (type === "on") {
								if (controlBtn.getAttribute("data-pressed") === "false") {
									doClick(controlBtn);
								}
							} else if (type === "off") {
								if (controlBtn.getAttribute("data-pressed") === "true") {
									doClick(controlBtn);
								}
							}
						}, 800);
					}
				} catch (e) {console.log('danmukuPreventShade：'+e);}
			}
		},
		tabDanmulist: function (set) {
			if (typeof set !== 'undefined') {
				try{
					var controlBtn = isBangumi('.bilibili-player-filter > div[name="tab_danmulist"]:not(.active)');
					if(controlBtn !== null) {
						window.setTimeout(function() {
							doClick(controlBtn);
						}, 200);
					}
				} catch (e) {console.log('tabDanmulist：'+e);}
			}
		},
		autoNextPlist: function (set,video) {
			if (typeof set !== 'undefined' && video !== null) {
				try{
					var nextPlist = function(){
						if (isBangumi('.bilibili-player-video-btn-repeat > i').getAttribute("data-text") === "关闭洗脑循环") { return; }
						var controlBtn = isBangumi('.bilibili-player-video-btn-next > i');
						if (controlBtn !== null) {
							doClick(controlBtn);
						}
					};
					var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
					if (matchURL.isVideoAV()) {
						if(isBangumi('.bilibili-player-electric-panel') === null){
							video.addEventListener('ended',function () {
								nextPlist();
							}, false);
						} else {
							var observer = new MutationObserver(function (records) {
								records.map(function (record) {
									var targetNode = record.target.getAttribute("class");
									if (targetNode.search("video-state-pause") !== -1) {
										var controlBtn = isBangumi('.bilibili-player-electric-panel');
										if (controlBtn !== null) {
											nextPlist();
											observer.disconnect();
										}
									}
								});
							});
							observer.observe(document.querySelector('#bofqi .bilibili-player-area'), {
								attributes: true,
								attributeFilter:['class'],
								childList: true
							});
						}
					} else if (matchURL.isOldBangumi() || matchURL.isNewBangumi()) {
						if(isBangumi('.bilibili-player-bangumipay-panel') === null){
							video.addEventListener('ended',function () {
								nextPlist();
							}, false);
						} else {
							var observer = new MutationObserver(function (records) {
								records.map(function (record) {
									var targetNode = record.target.getAttribute("style");
									if (targetNode.search("display: block;") !== -1) {
										nextPlist();
										observer.disconnect();
									}
								});
							});
							observer.observe(document.querySelector('#bofqi .bilibili-player-bangumipay-panel'), {
								attributes: true,
								attributeFilter:['style'],
								childList: true
							});
						}
					}
				} catch (e) {console.log('autoNextPlist：'+e);}
			}
		},
		autoLoopVideo: function (set) {
			if (typeof set !== 'undefined') {
				var controlBtn = isBangumi('.bilibili-player-video-btn-repeat > i');
				if (controlBtn !== null) {
					doClick(controlBtn);
				}
			}
		},
		autoWebFullScreen: function (set) {
			if (typeof set !== 'undefined') {
				var controlBtn = isBangumi('.bilibili-player-video-web-fullscreen > i');
				if (controlBtn !== null) {
					if (controlBtn.getAttribute("data-text") === "网页全屏") {
						doClick(controlBtn);
					}
				}
			}
		},
		autoFullScreen: function (set,video) {
			if (typeof set !== 'undefined') {
				try{
					var fullScreen = function() {
						var controlBtn = isBangumi('div[name="browser_fullscreen"] > i[data-text="进入全屏"]');
						if (controlBtn !== null) {
							doClick(controlBtn);
						}
					};
					fullScreen();
					document.addEventListener("keydown", function(e) {
						if (e.keyCode == 122) {
							fullScreen();
							return false;
						}
					}, false);
				}
				catch(e) {console.log('autoFullScreen：'+e);}
			}
		},
		autoVideoSpeed: function (set,video) {
			if (typeof set !== 'undefined' && video !== null) {
				switch (set) {
					case "0.5":
						video.playbackRate = 0.5;
						break;
					case "0.75":
						video.playbackRate = 0.75;
						break;
					case "1":
						break;
					case "1.25":
						video.playbackRate = 1.25;
						break;
					case "1.5":
						video.playbackRate = 1.5;
						break;
					case "2":
						video.playbackRate = 2;
						break;
					default:
						break;
				}
			}
		},
		autoLightOn: function (set) {
			if (typeof set !== 'undefined') {
				try{
					//window.eval('window.heimu();');

					var isHeimuExist = function(){
						var flag = false;
						if (matchURL.isVideoAV() || matchURL.isWatchlater()) {
							var heimu = document.querySelector('#heimu');
							if (heimu !== null) {
								var heimuStyle = heimu.getAttribute("style");
								if(heimuStyle.search("display: block;") !== -1){
									flag = true;
								}
							}
						} else {
							var heimu = document.querySelector('#heimu');
							if (heimu !== null) {
								var heimuStyle = heimu.getAttribute("style");
								if(heimuStyle !== null){
									if(heimuStyle.search("display: block;") !== -1){
										flag = true;
									}
								}
							}
						}
						return flag;
					};

					if(!isHeimuExist()){
						var isActiveContextMenu = isBangumi('.bilibili-player-context-menu-container.black');
						if (isActiveContextMenu !== null && isActiveContextMenu.getAttribute("class").search("active") !== -1) {
							return;
						}

						if (isBangumi('#adjustMiniPlayerlightOnOff') === null ) {
							var css ='.bilibili-player-context-menu-container.black.active {opacity: 0; !important;}';
							var node = document.createElement('style');
							node.type = 'text/css';
							node.id = 'adjustPlayerlightOnOff';
							node.appendChild(document.createTextNode(css));
							isBangumi('.player').appendChild(node);
						}

						var clickLightOnOff = function(controlBtn) {
							if (controlBtn !== null) {
								var lightOnOffItem = null;
								var contextMenuItem = controlBtn.querySelectorAll('li > a'), i;
								for (i = 0; i < contextMenuItem.length; ++i) {
									if (contextMenuItem[i].innerHTML === "关灯") {
										lightOnOffItem = contextMenuItem[i];
										doClick(contextMenuItem[i]);
										break;
									}
								}

								var adjustPlayerlightOnOff = isBangumi('#adjustPlayerlightOnOff');
								adjustPlayerlightOnOff.parentNode.removeChild(adjustPlayerlightOnOff);
							}
						};

						var heimuDblclickEvent = function(){
							var heimu = document.querySelector('#heimu');
							var isDblclickEvent = heimu.getAttribute("heimuDblclick");
							if(isDblclickEvent === null){
								heimu.addEventListener('dblclick', function () {
									heimu.setAttribute("style","display: none;");
								});
								heimu.setAttribute("heimuDblclick","true");
							}
						};

						var contextMenu = isBangumi('.bilibili-player-area > .bilibili-player-video-wrap');
						var timerCount = 0;
						var timer = window.setInterval(function callback() {
							var controlBtn = isBangumi('.bilibili-player-context-menu-container.black ul');
							if (controlBtn !== null && controlBtn.innerHTML === '') {
								contextMenuClick(contextMenu);
							} else {
								clickLightOnOff(controlBtn);
								heimuDblclickEvent();
								clearInterval(timer);
							}
							timerCount++;
							if (timerCount >= 50) {
								clearInterval(timer);
							}
						}, 200);
					}
				}
				catch(e) {console.log('autoLightOn：'+e);}
			}
		},
		resizePlayer: function (set,width,ratio) {
			if (typeof set !== 'undefined' && typeof width !== 'undefined') {
				try{
					if (typeof ratio === 'undefined') {
						ratio = '16 / 9';
					}
					var css = [
						'.bgray-btn-wrap { margin-left: calc('+ width +' / 2) !important; } ',
						'.player-wrapper .player-content, .video-box-module .bili-wrapper , .moviescontent, .widescreen .movie_play, #bofqi { width: '+ width +' !important; } ',
						'#bofqi .player, .moviescontent { width: '+ width +' !important; height: calc(48px + '+ width +' / calc('+ ratio +') - 300px / calc('+ ratio +') + 68px) !important; } ',
						'#bofqi.wide .player, .wide.moviescontent { width: '+ width +' !important; height: calc('+ width +' / calc('+ ratio +') + 68px) !important; } ',
						'.player-wrapper .bangumi-player, #__bofqi.bili-wrapper { width: '+ width +' !important; background: none !important; height: auto !important;} ',
						'#__bofqi.bili-wrapper { min-height: unset !important; } ',
						'#bofqi.wide .autohide-controlbar, .wide.autohide-controlbar-movies { width: '+ width +' !important; height: calc('+ width +' / calc('+ ratio +') + 0px) !important; } '
					];
					var node = document.createElement('style');
					node.type = 'text/css';
					node.id = 'adjustPlayerSize';

					var player = isPlayer();
					if (player === "flashPlayer") {
						//修复 flash 播放器 网页全屏挤在左上角
						css.push(
							'body[style$="position: fixed; width: 100%; height: 100%; padding: 0px; margin: 0px;"] #bofqi .player{ width: 100% !important; height: 100% !important; } ',
							'body[style$="position: fixed; width: 100%; height: 100%; padding: 0px; margin: 0px;"] .player-wrapper .player-content ,body[style$="position: fixed; width: 100%; height: 100%; padding: 0px; margin: 0px;"] #bofqi { width: 100% !important; } '
						);

						if (isBangumi('#adjustPlayerSize')) {
							return;
						} else {
							node.appendChild(document.createTextNode(css.join('')));
							document.documentElement.appendChild(node);
						}
					} else if (player === "html5Player") {
						var fixResize= function(){
							//修复内间距导致的 “黑边”
							isBangumi('.bilibili-player-video video').parentNode.setAttribute("style","padding: 0px !important;");

							//修复 Firefox 下bangumi 页弹幕框消失
							isBangumi('.bilibili-player-video-inputbar').setAttribute("style","float:none !important;");

							//修复“自动宽屏模式” 没有勾选，会无法调整大小
							var evt = document.createEvent('Event');
							evt.initEvent('resize', true, true);
							isBangumi('.bilibili-player-video video').dispatchEvent(evt);

							//修复播放器尺寸调整过小，分级切换按钮被挡住
							if (matchURL.isVideoAV()) {
								var vPartToggle = document.querySelector('#v_multipage a.item.v-part-toggle');
								if(vPartToggle !== null){
									var bgrayBtnWrap = document.querySelector('.bgray-btn-wrap');
									var multiPageWidth = document.querySelector('#v_multipage').offsetWidth;
									if(parseInt(multiPageWidth) >= parseInt(width)){
										bgrayBtnWrap.setAttribute("style","margin-left:calc("+ multiPageWidth +"px / 2) !important;");
									}
								}
							}
						};
						if (isBangumi('#adjustPlayerSize')) {
							fixResize();
							return;
						} else {
							node.appendChild(document.createTextNode(css.join('')));
							document.documentElement.appendChild(node);
							fixResize();
						}
					}

					//修复番剧页拉下页面后出现页面缩上去的bug
					if (matchURL.isOldBangumi() || matchURL.isNewBangumi()) {
						var bangumiPlayerWrapper = document.querySelector('#bangumi_player.player-wrapper');
						var bofqi = document.querySelector('#bofqi');
						if (bangumiPlayerWrapper !== null) {
							var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
							var fixMinHeight = function(bofqi){
								if (player === "flashPlayer") {
									if (!bofqi.classList.contains('wide')) {
										bangumiPlayerWrapper.style.minHeight='calc(48px + '+ width +' / calc('+ ratio +') - 300px / calc('+ ratio +') + 68px)';
									}
									else {
										bangumiPlayerWrapper.style.minHeight='calc('+ width +' / calc('+ ratio +') + 0px)';
									}
								} else if (player === "html5Player") {
									if (!bofqi.classList.contains('wide')) {
										bangumiPlayerWrapper.style.minHeight='calc(48px + '+ width +' / calc('+ ratio +') - 300px / calc('+ ratio +') + 68px)';
									}
									else if (!bofqi.querySelector('.player').classList.contains('autohide-controlbar')){
										bangumiPlayerWrapper.style.minHeight='calc('+ width +' / calc('+ ratio +') + 68px)';
									}
									else {
										bangumiPlayerWrapper.style.minHeight='calc('+ width +' / calc('+ ratio +') + 0px)';
									}
								}
							};
							new MutationObserver(function(records) {
								records.map(function (record) {
									fixMinHeight(record.target);
								});
							}).observe(bofqi, {
								attributes: true,
								attributeFilter: ['class']
							});
							setTimeout(function() {
								fixMinHeight(bofqi);
							}, 200);
						}
					}

					//修复播放器尺寸设置过大时，被其他浮动元素遮挡
					var gotop;
					if (matchURL.isVideoAV()) {
						var oldNav= document.querySelector('#index_nav');
						var newNav= document.querySelector('.fixed-nav-m');
						if(oldNav !== null) {
							gotop = oldNav;
						} else {
							gotop = newNav;
						}
					} else if (matchURL.isNewBangumi()) {
						gotop = document.querySelector('.bangumi-nav-right');
					} else if (matchURL.isOldBangumi()) {
						gotop = document.querySelector('#index_nav');
					} else if (matchURL.isWatchlater()) {
						gotop = document.querySelector('.fixed-nav-m');
					}

					if (gotop !== null) {
						gotop.style.visibility = "hidden";
						var last_known_scroll_position = 0;
						var ticking = false;
						var mainInner;
						if (matchURL.isVideoAV()) {
							mainInner = document.querySelector('.player-wrapper + .main-inner');
							if(mainInner === null){
								mainInner = document.querySelector('.player-box + .bili-wrapper');
							}
						} else if (matchURL.isNewBangumi()) {
							mainInner = document.querySelector('.main-container .bangumi-info-wrapper');
						} else if (matchURL.isOldBangumi()) {
							mainInner = document.querySelector('.b-page-body + .main-inner');
						} else if (matchURL.isWatchlater()) {
							mainInner = document.querySelector('.view-later-module .video-ex-info');
						}
						if (typeof mainInner !== 'undefined' && mainInner !== null ) {
							mainInner = mainInner.offsetTop;
							window.addEventListener('scroll', function(e) {
								last_known_scroll_position = window.scrollY;
								if (!ticking) {
									window.requestAnimationFrame(function() {
										if (last_known_scroll_position >= mainInner) {
											gotop.style.visibility = "visible";
										} else {
											gotop.style.visibility = "hidden";
										}
										ticking = false;
									});
								}
								ticking = true;
							});
						}
					}
				} catch (e) {console.log('resizePlayer：'+e);}
			}
		},
		resizeMiniPlayer: function (set,width,isResizable) {
			if (typeof set !== 'undefined' && typeof width !== 'undefined') {
				var ratio = 16 / 9;
				var height = Number(width / ratio).toFixed();
				var css = [
					'#bofqi.mini-player:before, #bofqi.float, #bofqi.float:before, #bofqi.float .move + .player, .player-wrapper .mini-player { width: '+ width +'px !important; height: '+ height +'px !important; }',
					'#bofqi.mini-player, #bofqi.newfloat .move, #bofqi.float .move { width: '+ width +'px !important; }',
					'#bofqi.mini-player:before, #bofqi.float:before, #bofqi.newfloat:before, .player-wrapper .mini-player:before { box-shadow: none !important; }',
					'#bofqi.mini-player > .player, #bofqi.newfloat, #bofqi.newfloat:before, #bofqi.newfloat .move + .player, .player-wrapper .mini-player > #bofqi .player { width: '+ width +'px !important; height: '+ height +'px !important; }',
					'.bangumi-player.mini-player > #bofqi { width: '+ width +'px !important; height: '+ height +'px !important; }',
					'.bangumi-player.mini-player > .bgray-btn-wrap { display:none !important; }',
					'#adjust-player-miniplayer-resizable { width: '+ width +'px ; height: '+ height +'px; position: absolute; top: 30px; z-index: 0; overflow: hidden; resize: both; }',
					'.newfloat #adjust-player-miniplayer-resizable, .mini-player #adjust-player-miniplayer-resizable { z-index: 10000;}',
					'#bofqi.mini-player {height:auto;margin:auto;}'
				];
				var node = document.createElement('style');
				node.type = 'text/css';
				node.id = 'adjustMiniPlayerSize';
				node.appendChild(document.createTextNode(css.join('')));
				var existed_node = document.getElementById("adjustMiniPlayerSize");
				if(existed_node){existed_node.remove();}
				document.documentElement.appendChild(node);

				//针对mini 播放器 添加了resizable功能, 可以更自由的调整大小 https://greasyfork.org/zh-CN/forum/discussion/34902/x
				if (typeof isResizable !== 'undefined' && isResizable === 'on') {
					var resizable = function(){
						var miniPlayer = document.querySelector('#bofqi.newfloat .player') || document.querySelector('#bofqi.newfloat .move + .player') || document.querySelector('#bofqi.mini-player > .player') || document.querySelector('.player-wrapper .mini-player > #bofqi .player');
						if (miniPlayer !== null ) {
							var resizableElement = document.createElement('div');
							resizableElement.id = "adjust-player-miniplayer-resizable";
							resizableElement.innerHTML = '<div style="width: 10px; height: 10px; position: absolute; bottom: 0px; right: 0; background: #fff; pointer-events: none;">↘</div>';

							var miniPlayerDiv = document.querySelector('.newfloat') || document.querySelector('.mini-player');
							if (miniPlayerDiv !== null ) {
								miniPlayerDiv.appendChild(resizableElement);

								var requestAnimationFrame = window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
								var cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;
								var requestId;

								function loop(time) {
									requestId = undefined;
									//resizableEvent start
									var resizableElementWidth = resizableElement.clientWidth;
									var resizableElementHeight = resizableElement.clientHeight;
									//console.log(resizableElementWidth + "\n" + resizableElementHeight);
									var css = [
										'#bofqi.mini-player:before, #bofqi.float, #bofqi.float:before, #bofqi.float .move + .player, .player-wrapper .mini-player { width: '+ resizableElementWidth +'px !important; height: '+ resizableElementHeight +'px !important; }',
										'#bofqi.mini-player, #bofqi.newfloat .move, #bofqi.float .move { width: '+ resizableElementWidth +'px !important; }',
										'#bofqi.mini-player:before, #bofqi.float:before, #bofqi.newfloat:before, .player-wrapper .mini-player:before { box-shadow: none !important; }',
										'#bofqi.mini-player > .player, #bofqi.newfloat, #bofqi.newfloat:before, #bofqi.newfloat .move + .player, .player-wrapper .mini-player > #bofqi .player { width: '+ resizableElementWidth +'px !important; height: '+ resizableElementHeight +'px !important; }',
										'.bangumi-player.mini-player > #bofqi { width: '+ resizableElementWidth +'px !important; height: '+ resizableElementHeight +'px !important; }',
										'.bangumi-player.mini-player > .bgray-btn-wrap { display:none !important; }',
										'#adjust-player-miniplayer-resizable { position: absolute; top: 30px; z-index: 1; overflow: hidden; resize: both; }',
										'.newfloat #adjust-player-miniplayer-resizable, .mini-player #adjust-player-miniplayer-resizable { z-index: 10000;}',
										'#bofqi.mini-player {height:auto;margin:auto;}'
									];
									var node = document.createElement('style');
									node.type = 'text/css';
									node.id = 'adjustMiniPlayerSize';
									node.appendChild(document.createTextNode(css.join('')));
									var existed_node = document.getElementById("adjustMiniPlayerSize");
									if(existed_node){existed_node.remove();}
									document.documentElement.appendChild(node);
									//resizableEvent end
									start();
								}
								function start() {
									if (!requestId) {
										requestId = requestAnimationFrame(loop);
									}
								}
								function stop() {
									if (requestId) {
										cancelAnimationFrame(requestId);
										requestId = undefined;
									}
								}
								resizableElement.addEventListener("mouseup",function(e){
									stop();
								} , false);
								resizableElement.addEventListener("mousedown",function(e){
									if(e.buttons === 1){
										if((resizableElement.clientWidth - 10) < e.offsetX && (resizableElement.clientHeight - 10) < e.offsetY){
											start();
										} else {
											var video = isBangumi('.bilibili-player-video');
											doClick(video);
										}
									}
								} , false);
							}
						}
					};
					//滚到评论区等迷你播放器出现再执行resizable
					var last_known_scroll_position = 0;
					var ticking = false;
					var mainInner;
					if (matchURL.isVideoAV()) {
						mainInner = document.querySelector('.player-wrapper + .main-inner');
						if(mainInner === null){
							mainInner = document.querySelector('.player-box + .bili-wrapper');
						}
					} else if (matchURL.isNewBangumi()) {
						mainInner = document.querySelector('.main-container .bangumi-info-wrapper');
					} else if (matchURL.isOldBangumi()) {
						mainInner = document.querySelector('.b-page-body + .main-inner');
					} else if (matchURL.isWatchlater()) {
						mainInner = document.querySelector('.view-later-module .video-ex-info');
					}
					if (typeof mainInner !== 'undefined' && mainInner !== null ) {
						mainInner = mainInner.offsetTop;
						var scrollEvent = function (e) {
							last_known_scroll_position = window.scrollY;
							if (!ticking) {
								window.requestAnimationFrame(function() {
									if (last_known_scroll_position >= mainInner) {
										setTimeout(function() {
											resizable();
										}, 200);
										window.removeEventListener('scroll', scrollEvent, false);
									}
									ticking = false;
								});
							}
							ticking = true;
						};
						window.addEventListener('scroll', scrollEvent, false);
					}
				}
			}
		},
		fixMiniPlayer: function() {
			//重写迷你播放器滚动事件
			try {
				if (localStorage.getItem('adjustPlayer_b_miniplayer') === null) localStorage.setItem('adjustPlayer_b_miniplayer', localStorage.getItem('b_miniplayer'));
				if (localStorage.getItem('adjustPlayer_b_miniplayer') !== '1' && localStorage.getItem('adjustPlayer_b_miniplayer') !== '0') localStorage.setItem('adjustPlayer_b_miniplayer', '1');
				var miniplayer = function(type, miniSwitch) {
					var isMiniplayer = localStorage.getItem('b_miniplayer');
					if (type === "off") {
						if (isMiniplayer === "1") miniSwitch.click();
					} else if (type === "on") {
						if (isMiniplayer === "0") miniSwitch.click();
					}
				};
				var NavRight = matchURL.isNewBangumi() ? document.querySelector('.bangumi-nav-right') : document.querySelector('.fixed-nav-m');
				if (NavRight === null) return;
				var miniSwitch = matchURL.isNewBangumi() ? NavRight.querySelectorAll('.bangumi-nav-right > .nav-mini-switch')[0] : NavRight.querySelectorAll('.fixed-nav-m .mini')[0];
				var setMiniPlayer = function(scroll_pos) {
					var adjustPlayerMiniplayer = localStorage.getItem('adjustPlayer_b_miniplayer');
					//console.log(adjustPlayerMiniplayer);
					if (adjustPlayerMiniplayer === "1") {
						if (!matchURL.isNewBangumi() || scroll_pos >= document.querySelector('#bangumi_detail').offsetTop) miniplayer("on", miniSwitch);
						else miniplayer("off", miniSwitch);
					} else if (adjustPlayerMiniplayer === "0") miniplayer("off", miniSwitch);
				};
				var miniSwitchClone = miniSwitch.cloneNode(true);
				var setMiniSwitchClone = function() {
					setMiniPlayer(window.scrollY);
					var miniplayerValue = localStorage.getItem('adjustPlayer_b_miniplayer');
					//console.log(miniplayerValue);
					if (miniplayerValue === '0') {
						miniSwitchClone.innerHTML = miniSwitchClone.innerHTML.replace('ON', 'OFF');
						miniSwitchClone.title = miniSwitchClone.title.replace('关闭', '打开');
					} else if (miniplayerValue === '1') {
						miniSwitchClone.innerHTML = miniSwitchClone.innerHTML.replace('OFF', 'ON');
						miniSwitchClone.title = miniSwitchClone.title.replace('打开', '关闭');
					}
				};
				miniSwitchClone.onclick = function(e) {
					var adjustPlayerMiniplayer = localStorage.getItem('adjustPlayer_b_miniplayer');
					//console.log(adjustPlayerMiniplayer);
					if (adjustPlayerMiniplayer === '0') localStorage.setItem('adjustPlayer_b_miniplayer', '1');
					else if (adjustPlayerMiniplayer === '1') localStorage.setItem('adjustPlayer_b_miniplayer', '0');
					setMiniSwitchClone();
					return;
				};
				setMiniSwitchClone();
				miniSwitch.setAttribute('style', 'display:none');
				NavRight.insertBefore(miniSwitchClone, miniSwitch);
				if (matchURL.isNewBangumi()) {
					var last_known_scroll_position = 0;
					var ticking = false;
					window.addEventListener('scroll', function(e) {
						last_known_scroll_position = window.scrollY;
						if (!ticking) {
							window.requestAnimationFrame(function() {
								setMiniPlayer(last_known_scroll_position);
								ticking = false;
							});
						}
						ticking = true;
					});
				}
			} catch (e) {console.log('fixMiniPlayer：' + e);}
		},
		autoHideControlBar: function (set,focusDanmakuInput,video) {
			if (typeof set !== 'undefined') {
				try{
					if (isBangumi('#adjustPlayerAutoHideControlBar')) {return;}

					//伪修复 macOS 下 Chrome 透明度失效 https://greasyfork.org/zh-CN/forum/discussion/30243/x
					var fixSendbarOpacity = function(){
						var opacity = "1";
						if (navigator.userAgent.indexOf('Mac OS X') !== -1 && /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)) {
							opacity = "1";
						} else {
							opacity = "0.9";
						}
						return opacity;
					};

					//开启了“自动隐藏播放器控制栏”并设置了“定位到弹幕框的快捷键”之后，鼠标移动到弹幕框时不显示“弹幕框” https://greasyfork.org/zh-CN/forum/post/quote/30243/Comment_42612
					var isFocusDanmakuInput = function(){
						var css = '';
						if (focusDanmakuInput) {
							css = '#bilibiliPlayer.mode-webfullscreen .bilibili-player-video-sendbar, #bilibiliPlayer.mode-widescreen .bilibili-player-video-sendbar { visibility: hidden; }';
						}
						return css;
					};

					var css = [ //Modify the https://userstyles.org/styles/131642/bilibili-html5
						'#bilibiliPlayer.mode-webfullscreen .bilibili-player-video-wrap, #bilibiliPlayer.mode-widescreen .bilibili-player-video-wrap { height: 100% !important; width: 100% !important; }',
						'#bilibiliPlayer.mode-webfullscreen .bilibili-player-video-control, #bilibiliPlayer.mode-widescreen .bilibili-player-video-control { display: block; opacity: 0 !important; transition: 0.2s; position: absolute; bottom: 0px; }',
						'#bilibiliPlayer.mode-webfullscreen .bilibili-player-video-control:hover, #bilibiliPlayer.mode-widescreen .bilibili-player-video-control:hover { opacity: '+ fixSendbarOpacity() +' !important; }',
						'#bilibiliPlayer.mode-webfullscreen .bilibili-player-video-sendbar, #bilibiliPlayer.mode-widescreen .bilibili-player-video-sendbar { display: block; opacity: 0 !important; transition: 0.2s; position: absolute; top: 0px; }',
						'#bilibiliPlayer.mode-webfullscreen .bilibili-player-video-sendbar:hover, #bilibiliPlayer.mode-widescreen .bilibili-player-video-sendbar:hover { opacity: '+ fixSendbarOpacity() +' !important; }',
						'#bilibiliPlayer.mode-webfullscreen .bilibili-player-video-sendbar .bilibili-player-mode-selection-container, #bilibiliPlayer.mode-widescreen .bilibili-player-video-sendbar .bilibili-player-mode-selection-container { height: 120px; border-radius: 5px; top: 100%; }',
						'#bilibiliPlayer.mode-webfullscreen .bilibili-player-video-sendbar .bilibili-player-color-picker-container, #bilibiliPlayer.mode-widescreen .bilibili-player-video-sendbar .bilibili-player-color-picker-container { height: 208px; border-radius: 5px; top: 100%; }',
						'#bilibiliPlayer.mode-webfullscreen .bilibili-player-video-info-container, #bilibiliPlayer.mode-widescreen .bilibili-player-video-info-container { top: 40px; }',
						'#bilibiliPlayer.mode-webfullscreen .bilibili-player-video-float-lastplay, #bilibiliPlayer.mode-widescreen .bilibili-player-video-float-lastplay { bottom: 30px; }',
						isFocusDanmakuInput()
					];
					var node = document.createElement('style');
					node.type = 'text/css';
					node.id = 'adjustPlayerAutoHideControlBar';
					node.appendChild(document.createTextNode(css.join('')));
					isBangumi('.player').appendChild(node);
					document.querySelector('#bofqi > .player').classList.add("autohide-controlbar");

					//修复“番剧电影”页面结构不一致导致的“白边”
					if (matchURL.isBangumiMovie()) {
						document.querySelector('.moviescontent').classList.add("autohide-controlbar-movies");
					}

					//进行快进(退)操作时弹出进度条
					video.addEventListener("seeking", function() {
						var controlBar = isBangumi('.autohide-controlbar > #bilibiliPlayer[class*="mode-"] .bilibili-player-video-control');
						if (controlBar !== null ) {
							controlBar.style = "opacity: 1 !important;";
							var timer = null;
							clearTimeout(this.timer);
							this.timer = window.setTimeout(function() {
								var controlBar = isBangumi('.autohide-controlbar > #bilibiliPlayer[class*="mode-"] .bilibili-player-video-control');
								if (controlBar !== null ) {
									controlBar.style = "opacity: 0;";
								}
							}, 3000);
						}
					}, true);
				} catch (e) {console.log('adjustPlayerAutoHideControlBar：'+e);}
			}
		},
		skipSetTime : function (set,skipTime,video) {
			if (typeof set !== 'undefined' && video !== null) {
				var setTime = function () {
					var vLength = video.duration.toFixed();
					//console.log(skipTime);
					try {
						if (skipTime === 0) {
							video.currentTime = set;
						}
						else if (skipTime > vLength) {
							return;
						}
						else {
							video.currentTime += skipTime;
						}
					} catch (e) {
						console.log('skipSetTime：' + e);
					}
				};
				setTime();
			}
		},
		shortcuts : function (set) {
			var shortcut = {
				playPause : function () {
					var video = isBangumi('.bilibili-player-video video');
					if (video !== null) {
						if (!video.paused) {
							doClick(video);
							shortcut.shortcutsTips("播放/暂停", "暂停");
						} else {
							doClick(video);
							shortcut.shortcutsTips("播放/暂停", "播放");
						}
					}
				},
				videoFramerate : function (type) {
					var video = isBangumi('.bilibili-player-video video');
					var framerate = 24;
					if (video !== null) {
						if(typeof window.adjustPlayerVideoFps === 'undefined') {
							var contextMenu = isBangumi('.bilibili-player-area > .bilibili-player-video-wrap');
							contextMenuClick(contextMenu);
							var controlBtn = isBangumi('.bilibili-player-context-menu-container.black ul');
							if (controlBtn !== null) {
								var contextMenuItem = controlBtn.querySelectorAll('li > a'), i;
								for (i = 0; i < contextMenuItem.length; ++i) {
									if (contextMenuItem[i].innerHTML === "视频统计信息") {
										doClick(contextMenuItem[i]);
										doClick(isBangumi('a.bilibili-player-video-info-close'));
										var fps = isBangumi('.bilibili-player-video-info-panel > div[data-name="fps"] .info-data');
										framerate = fps.innerHTML;
										window.adjustPlayerVideoFps = framerate;
										break;
									}
								}
							}
						} else {
							framerate = window.adjustPlayerVideoFps;
						}
						//var currentFrame = Math.floor(video.currentTime * framerate);
						if (!video.paused) {
							var video = isBangumi('.bilibili-player-video');
							doClick(video);
						}
						if (type === "prev") {
							video.currentTime -= 1 / framerate;
							shortcut.shortcutsTips("视频帧率", "快退一帧");
						} else if (type === "next") {
							video.currentTime += 1 / framerate;
							shortcut.shortcutsTips("视频帧率", "快进一帧");
						}
					}
				},
				showHideDanmuku : function () {
					var controlBtn = isBangumi('.bilibili-player-video-control .bilibili-player-video-btn-danmaku ');
					var settingPanel = isBangumi('.bilibili-player-danmaku-setting-lite-panel');
					if (controlBtn !== null) {
						doClick(controlBtn);
						settingPanel.style.display = "none";

						var tipsValue = function() {
							if (controlBtn.getAttribute("name") === "ctlbar_danmuku_close") {
								return "关闭弹幕";
							} else {
								return "打开弹幕";
							}
						};

						shortcut.shortcutsTips("弹幕",tipsValue());
					}
				},
				videoSpeed : function (type) {
					var video = isBangumi('.bilibili-player-video video');
					if (video !== null) {
						var videoSpeed = video.playbackRate;
						var speed = [0.25,0.5,0.75,1,1.25,1.5,2,3,4,6,8,12,16];
						switch (type) {
							case 'add':
								var addSpeed = Math.max(...speed);
								if (videoSpeed < addSpeed) {
									for (var i = 0; i < speed.length; i++) {
										if (addSpeed > speed[i] && videoSpeed < speed[i]) {
											addSpeed = speed[i];
										}
									}
									video.playbackRate = addSpeed;
								}
								shortcut.shortcutsTips("播放速度", video.playbackRate + "倍速");
								break;
							case 'sub':
								var subSpeed = Math.min(...speed);
								if (videoSpeed > subSpeed) {
									for (var i = 0; i < speed.length; i++) {
										if (subSpeed < speed[i] && videoSpeed > speed[i]) {
											subSpeed = speed[i];
										}
									}
									video.playbackRate = subSpeed;
								}
								shortcut.shortcutsTips("播放速度", video.playbackRate + "倍速");
								break;
							case 'reset':
								if (videoSpeed != 1) {
									video.playbackRate = 1;
								}
								shortcut.shortcutsTips("播放速度", video.playbackRate + "倍速");
								break;
							default:
								console.log("請不要把奇怪的東西插進來");
								break;
						}
					}
				},
				playerWide : function () {
					var controlBtn = isBangumi('i[name="widescreen"]');
					var fullscreenBtn = isBangumi('div[name="browser_fullscreen"] > i');
					if (controlBtn !== null) {
						doClick(controlBtn);

						var tipsValue = function() {
							if (controlBtn.getAttribute("data-text") === "宽屏模式" && fullscreenBtn.getAttribute("data-text") === "进入全屏") {
								return "退出宽屏";
							} else if (controlBtn.getAttribute("data-text") === "宽屏模式" && fullscreenBtn.getAttribute("data-text") === "退出全屏") {
								return "全屏状态下无法使用";
							} else {
								return "宽屏模式";
							}
						};

						shortcut.shortcutsTips("宽屏模式",tipsValue());
					}
				},
				fullscreen : function () {
					var controlBtn = isBangumi('div[name="browser_fullscreen"] > i');
					if (controlBtn !== null) {
						doClick(controlBtn);

						var tipsValue = function() {
							if (controlBtn.getAttribute("data-text") === "进入全屏") {
								return "退出全屏";
							} else {
								return "进入全屏";
							}
						};

						shortcut.shortcutsTips("全屏",tipsValue());
					}
				},
				webfullscreen : function () {
					var controlBtn = isBangumi('.bilibili-player-video-web-fullscreen > i');
					if (controlBtn !== null) {
						doClick(controlBtn);

						var tipsValue = function() {
							if (controlBtn.getAttribute("data-text") === "网页全屏") {
								return "退出全屏";
							} else {
								return "全屏";
							}
						};

						shortcut.shortcutsTips("网页全屏",tipsValue());
					}
				},
				gotoPlist : function (type) {
					var video = isBangumi('.bilibili-player-video video');
					if (video !== null) {
						var plist,nextPlist,prevPlist,curPage;
						if (matchURL.isVideoAV()) {
							plist = document.querySelector('#v_multipage');
							curPage = document.querySelector('#v_multipage a.item.on');
							if (curPage !== null ) {
								nextPlist = curPage.nextElementSibling;
								prevPlist = curPage.previousElementSibling;
							}

						} else if (matchURL.isOldBangumi()) {
							plist = document.querySelector('ul.slider-list');
							curPage = document.querySelector('.video-slider-list-wrapper ul.slider-list .cur');
							if (curPage !== null ) {
								nextPlist = curPage.nextElementSibling;
								prevPlist = curPage.previousElementSibling;
							}

						} else if (matchURL.isWatchlater()) {
							plist = document.querySelector('.bilibili-player .mCSB_container > ul');
							curPage = document.querySelector('.bilibili-player .mCSB_container > ul li[data-state-play=true]');
							if (curPage !== null ) {
								if (curPage.nextElementSibling !== null) {
									nextPlist = curPage.nextElementSibling.querySelector('div');
								}
								if (curPage.previousElementSibling !== null) {
									prevPlist = curPage.previousElementSibling.querySelector('div');
								}
							}
						} else if (matchURL.isNewBangumi()) {
							plist = document.querySelector('.bangumi-list-wrapper .bottom-block .episode-list');
							curPage = document.querySelector('.bangumi-list-wrapper .bottom-block .episode-list > .episode-item.on');
							if (curPage !== null ) {
								if (curPage.nextElementSibling !== null) {
									nextPlist = curPage.nextElementSibling;
								}
								if (curPage.previousElementSibling !== null) {
									prevPlist = curPage.previousElementSibling;
								}
							}
						}
						var isHeimuExist = function(){
							var flag = false;
							if (matchURL.isVideoAV() || matchURL.isWatchlater()) {
								var heimu = document.querySelector('#heimu');
								if (heimu !== null) {
									var heimuStyle = heimu.getAttribute("style");
									if(heimuStyle.search("display: block;") !== -1){
										flag = true;
									}
								}
							} else {
								var heimu = document.querySelector('#heimu');
								if (heimu !== null) {
									var heimuStyle = heimu.getAttribute("style");
									if(heimuStyle !== null){
										if(heimuStyle.search("display: block;") !== -1){
											flag = true;
										}
									}
								}
							}
							return flag;
						};
						if (type === "prev") {
							if (typeof plist !== 'undefined' && typeof prevPlist !== 'undefined' && prevPlist !== null) {
								var readyState = isBangumi('.bilibili-player-video-panel').getAttribute('style');
								if (readyState !== null ) {
									if (readyState.search("display: none;") !== -1) {
										if(isHeimuExist()){
											shortcut.shortcutsTips("分集切换","关灯状态下无法使用");
											return;
										}
										doClick(prevPlist);
									} else {
										return;
									}
								}
							} else {
								shortcut.shortcutsTips("分集切换","没有上一集了");
							}
						} else if (type === "next") {
							if (typeof plist !== 'undefined' && typeof nextPlist !== 'undefined' && nextPlist !== null) {
								var readyState = isBangumi('.bilibili-player-video-panel').getAttribute('style');
								if (readyState !== null ) {
									if (readyState.search("display: none;") !== -1) {
										if(isHeimuExist()){
											shortcut.shortcutsTips("分集切换","关灯状态下无法使用");
											return;
										}
										var nextPlistInnerText = nextPlist.innerText;
										if(nextPlistInnerText.search("展开") !== -1 || nextPlistInnerText.search("收起") !== -1 || nextPlistInnerText.search("全部 >") !== -1){
											shortcut.shortcutsTips("分集切换","没有下一集了");
											return;
										}
										doClick(nextPlist);
									} else {
										return;
									}
								}
							} else {
								shortcut.shortcutsTips("分集切换","没有下一集了");
							}
						}
					}
				},
				videoMute : function () {
					var controlBtn = isBangumi('div[name="vol"]');
					if (controlBtn !== null) {
						doClick(controlBtn.querySelector('i'));

						var tipsValue = function() {
							if (controlBtn.className.search("video-state-volume-min") !== -1) {
								return "静音";
							} else {
								return "恢复静音";
							}
						};

						shortcut.shortcutsTips("静音",tipsValue());
					}
				},
				lightOnOff : function () {
					var isActiveContextMenu = isBangumi('.bilibili-player-context-menu-container.black');
					if (isActiveContextMenu !== null && isActiveContextMenu.getAttribute("class").search("active") !== -1) {
						return;
					}

					if (isBangumi('#adjustMiniPlayerlightOnOff') === null ) {
						var css ='.bilibili-player-context-menu-container.black.active {opacity: 0; !important;}';
						var node = document.createElement('style');
						node.type = 'text/css';
						node.id = 'adjustPlayerlightOnOff';
						node.appendChild(document.createTextNode(css));
						isBangumi('.player').appendChild(node);
					}

					var clickLightOnOff = function(controlBtn) {
						if (controlBtn !== null) {
							var lightOnOffItem = null;
							var contextMenuItem = controlBtn.querySelectorAll('li > a'), i;
							for (i = 0; i < contextMenuItem.length; ++i) {
								if (contextMenuItem[i].innerHTML === "关灯" || contextMenuItem[i].innerHTML === "开灯") {
									lightOnOffItem = contextMenuItem[i];
									doClick(contextMenuItem[i]);
									break;
								}
							}

							var adjustPlayerlightOnOff = isBangumi('#adjustPlayerlightOnOff');
							adjustPlayerlightOnOff.parentNode.removeChild(adjustPlayerlightOnOff);

							var tipsValue = function() {
								if (lightOnOffItem.innerHTML !== "开灯") {
									return "关灯";
								} else {
									return "开灯";
								}
							};
							shortcut.shortcutsTips("开/关灯",tipsValue());
						}
					};

					var contextMenu = isBangumi('.bilibili-player-area > .bilibili-player-video-wrap');
					var timerCount = 0;
					var timer = window.setInterval(function callback() {
						var controlBtn = isBangumi('.bilibili-player-context-menu-container.black ul');
						if (controlBtn !== null && controlBtn.innerHTML === '') {
							contextMenuClick(contextMenu);
						} else {
							clickLightOnOff(controlBtn);
							clearInterval(timer);
						}
						timerCount++;
						if (timerCount >= 20) {
							clearInterval(timer);
						}
					}, 200);
				},
				loopVideoOnOff : function () {
					var controlBtn = isBangumi('.bilibili-player-video-btn-repeat > i');
					if (controlBtn !== null) {
						doClick(controlBtn);

						window.setTimeout(function() {
							var controllTooltip = isBangumi('div.player-tooltips');
							if(controllTooltip !== null){
								controllTooltip.style.display = "none";
							}
						}, 200);

						var tipsValue = function() {
							if (controlBtn.getAttribute("data-text") !== "打开洗脑循环") {
								return "开启";
							} else {
								return "关闭";
							}
						};
						shortcut.shortcutsTips("循环播放",tipsValue());
					}
				},
				focusPlayer : function () {
					var controlBtn = document.body.getAttribute("adjustPlayerScrollToY");
					if (controlBtn === null) {
						var scrollToY = (window.pageYOffset || document.documentElement.scrollTop) - (document.documentElement.clientTop || 0);
						document.body.setAttribute("adjustPlayerScrollToY",scrollToY);
						if (typeof GM_getValue === 'function') {
							var setting = config.read();
							var autoFocusOffsetType = setting.autoFocusOffsetType;
							var autoFocusOffsetValue= setting.autoFocusOffsetValue;
							var autoFocusPosition = setting.autoFocusPosition;
							adjustPlayer.autoFocus(true,autoFocusOffsetType,autoFocusOffsetValue,autoFocusPosition,true);
							shortcut.shortcutsTips("定位","到播放器顶端");
						} else {
							var setting = config.read();
							setting.then(function(value){
								var autoFocusOffsetType = value.autoFocusOffsetType;
								var autoFocusOffsetValue= value.autoFocusOffsetValue;
								var autoFocusPosition = value.autoFocusPosition;
								adjustPlayer.autoFocus(true,autoFocusOffsetType,autoFocusOffsetValue,autoFocusPosition,true);
								shortcut.shortcutsTips("定位","到播放器顶端");
							});
						}
					} else {
						var scrollToY = document.body.getAttribute("adjustPlayerScrollToY");
						unsafeWindow.scrollTo(0, scrollToY);

						shortcut.shortcutsTips("定位","回到之前位置");
						document.body.removeAttribute("adjustPlayerScrollToY");
					}
				},
				focusDanmakuInput : function (e) {
					var controlBtn = isBangumi("input.bilibili-player-video-danmaku-input");
					if (controlBtn !== null) {
						var adjustPlayerAutoHideControlBar = isBangumi("#adjustPlayerAutoHideControlBar");
						if (adjustPlayerAutoHideControlBar !== null ) {
							var sendbar = isBangumi(".bilibili-player-video-sendbar");
							sendbar.style = "opacity: 1 !important; visibility: visible;!important;outline: none;";
							sendbar.setAttribute("tabindex","-1");

							var sendbarBlurEvent = function (e) {
								controlBtn.focus();
								sendbar.removeEventListener('blur', sendbarBlurEvent, false);
							};
							var danmakuInputKeydownEvent = function (e) {
								if (e.keyCode == 9) {
									isBangumi('.bilibili-player-video video').focus();
									isBangumi(".bilibili-player-video-sendbar").style = "opacity: 1;";
									e.preventDefault();
									controlBtn.removeEventListener('keydown', danmakuInputKeydownEvent, false);
								}
							};
							sendbar.addEventListener("blur",sendbarBlurEvent, false);
							controlBtn.addEventListener("keydown", danmakuInputKeydownEvent, false);
						}
						e.preventDefault();

						setTimeout(function() {
							controlBtn.focus();
						},200);

						shortcut.shortcutsTips("定位","到弹幕框焦点");
					}
				},
				shortcutsTips : function (type,value) {
					try{
						var timeoutID ;
						clearTimeout(this.timeoutID);

						var tips = isBangumi('#bilibiliPlayer > .bilibili-player-area > .bilibili-player-video-wrap > #adjust-player-shortcuts-tips');
						if (tips === null ) {
							var tipsElement = document.createElement('div');
							tipsElement.id = "adjust-player-shortcuts-tips";
							tipsElement.style = "display: block; width:auto; opacity: 0;";
							tipsElement.className = "bilibili-player-volumeHint";
							tipsElement.innerHTML = type + ":" + value;
							isBangumi('#bilibiliPlayer > .bilibili-player-area > .bilibili-player-video-wrap ').appendChild(tipsElement);
							tipsElement.style = "display: block; width:auto; opacity: 1; margin-left:-"+(tipsElement.offsetWidth / 2)+"px";
						} else {
							tips.innerHTML = type + ":" + value;
							tips.style = "display: block; width:auto; opacity: 1; margin-left:-"+(tips.offsetWidth / 2)+"px";
						}

						this.timeoutID = window.setTimeout(function() {
							var adjustPlayerShortcutsTips = isBangumi('#bilibiliPlayer > .bilibili-player-area > .bilibili-player-video-wrap > #adjust-player-shortcuts-tips');
							if(adjustPlayerShortcutsTips !== null) {
								adjustPlayerShortcutsTips.style = "display: block;width:auto;opacity: 0;";
							}
						}, 1000);
					} catch (e) {console.log('shortcutsTips：'+e);}
				},
				shortcutsEvent : function(type,kCode,event) {
					if (typeof kCode === 'undefined' || kCode === "" || kCode === null ) {
						return ;
					}

					var isCombinationKey = function() {
						var keys = kCode.split("+");
						if (keys.length > 1 ) {
							keys[1] = parseInt(keys[1]);
							return {CombinationKey: true,keys:keys};
						} else {
							return {CombinationKey: false,keys:parseInt(kCode)};
						}
					};

					var executeEvent = function() {
						switch (type) {
							case "playPause":
								shortcut.playPause();
								break;
							case "prevVideoFramerate":
								shortcut.videoFramerate("prev");
								break;
							case "nextVideoFramerate":
								shortcut.videoFramerate("next");
								break;
							case "showHideDanmuku":
								shortcut.showHideDanmuku();
								break;
							case "addVideoSpeed":
								shortcut.videoSpeed("add");
								break;
							case "subVideoSpeed":
								shortcut.videoSpeed("sub");
								break;
							case "resetVideoSpeed":
								shortcut.videoSpeed("reset");
								break;
							case "playerWide":
								shortcut.playerWide();
								break;
							case "fullscreen":
								shortcut.fullscreen();
								break;
							case "webfullscreen":
								shortcut.webfullscreen();
								break;
							case "prevPlist":
								shortcut.gotoPlist("prev");
								break;
							case "nextPlist":
								shortcut.gotoPlist("next");
								break;
							case "videoMute":
								shortcut.videoMute();
								break;
							case "lightOnOff":
								shortcut.lightOnOff();
								break;
							case "loopVideoOnOff":
								shortcut.loopVideoOnOff();
								break;
							case "focusPlayer":
								shortcut.focusPlayer();
								break;
							case "focusDanmakuInput":
								shortcut.focusDanmakuInput(event);
								break;
							default:
								break;
						}
					};

					var k = isCombinationKey(kCode);
					if (k.CombinationKey) {
						if (event.ctrlKey || event.altKey || event.shiftKey) {
							if (k.keys[0] === "shift") {
								if (event.shiftKey && event.keyCode === k.keys[1]) {
									executeEvent(type);
									return;
								}
							} else if (k.keys[0] === "ctrl") {
								if (event.ctrlKey && event.keyCode === k.keys[1]) {
									executeEvent(type);
									return;
								}
							} else if (k.keys[0] === "alt") {
								if (event.altKey && event.keyCode === k.keys[1]) {
									executeEvent(type);
									return;
								}
							}
						}
					} else {
						if (event.ctrlKey || event.altKey || event.shiftKey) {
							return;
						} else {
							if (event.keyCode === k.keys) {
								executeEvent(type);
								return;
							}
						}
					}
				},
				init : function (set) {
					if (typeof set !== 'undefined') {
						try{
							if (set.shortcutsSwitch !== true) {
								return;
							}

							var shortcutsEventObj = {};
							for (var prop in set) {
								var KeyCode = prop.indexOf('KeyCode');
								if(KeyCode !== -1 ){
									shortcutsEventObj[set[prop]] = prop.replace(/KeyCode/gi, '');
								}
							}

							function bindEvent(event) {
								//console.log(shortcutsEventObj);
								if (event.target.nodeName === "INPUT") {
									return;
								}
								if (event.target.nodeName === "TEXTAREA") {
									return;
								}

								var focused = document.activeElement;
								if (focused.nodeName === "IFRAME") {
									window.top.focus();
								}

								if (event.shiftKey) {
									var shiftEventName = shortcutsEventObj['shift+' + event.keyCode];
									if(typeof shiftEventName !== 'undefined'){
										shiftEventName = shiftEventName.replace(/shift\+/gi, '');
										if (set[shiftEventName] === true) {
											shortcut.shortcutsEvent(shiftEventName,set[shiftEventName + 'KeyCode'],event);
											return;
										}
									}
								}
								if (event.ctrlKey) {
									var ctrlEventName = shortcutsEventObj['ctrl+' + event.keyCode];
									if(typeof ctrlEventName !== 'undefined'){
										ctrlEventName = ctrlEventName.replace(/ctrl\+/gi, '');
										if (set[ctrlEventName] === true) {
											shortcut.shortcutsEvent(ctrlEventName,set[ctrlEventName + 'KeyCode'],event);
											return;
										}
									}
								}
								if (event.altKey) {
									var altEventName = shortcutsEventObj['alt+' + event.keyCode];
									if(typeof altEventName !== 'undefined'){
										altEventName = altEventName.replace(/alt\+/gi, '');
										if (set[altEventName] === true) {
											shortcut.shortcutsEvent(altEventName,set[altEventName + 'KeyCode'],event);
											return;
										}
									}
								}

								var eventName = shortcutsEventObj[event.keyCode];
								if(typeof eventName !== 'undefined'){
									if (set[eventName] === true) {
										shortcut.shortcutsEvent(eventName,set[eventName + 'KeyCode'],event);
										return;
									}
								}
							}

							var iframe = document.querySelector('iframe.bilibiliHtml5Player');
							if (iframe !== null) {
								iframe.contentWindow.document.addEventListener("keydown",bindEvent, false);
							}
							document.addEventListener("keydown",bindEvent, false);
						} catch (e) {console.log('shortcuts：'+e);}
					}
				}
			};
			shortcut.init(set);
		},
		init: function(firstrun,setting) {
			//修复后台打开视频页面脚本加载失效
			var documentState = document.visibilityState;
			if(documentState === "visible") {
				//初始化
				console.log('adjustPlayer:\n' + 'loadPage:' + location.href);
				//console.log('settingInfo:\n' + JSON.stringify(setting));
				//显示帮助提示
				var isFirstrun = function() {
					if (firstrun) {
						config.setValue('player_firstrun', false);
						configWindow.help();
					}
				};
				//总计时器
				var timerCount = 0;
				var timer = window.setInterval(function callback() {
					var player = isPlayer();
					if (player === "flashPlayer") {
						try {
							setTimeout(function () {
								createConfigBtn();
								isFirstrun();
								adjustPlayer.autoWide(setting.autoWide,setting.autoWideFullscreen);
								adjustPlayer.autoFocus(setting.autoFocus,setting.autoFocusOffsetType,setting.autoFocusOffsetValue,setting.autoFocusPosition);
								adjustPlayer.resizePlayer(setting.resizePlayer,setting.adjustPlayerWidth,setting.adjustPlayerRatio);
								adjustPlayer.fixMiniPlayer();
								if (setting.resizePlayer === true && typeof setting.resizeMiniPlayer === 'undefined') {
									adjustPlayer.resizeMiniPlayer(true,320);
								} else {
									adjustPlayer.resizeMiniPlayer(setting.resizeMiniPlayer,setting.resizeMiniPlayerSize);
								}
								reloadPList.init();
							}, 500);
							console.log('adjustPlayer:\nflashPlayer init success');
						} catch (e) {
							clearInterval(timer);
							console.log('adjustPlayer:\nflashPlayer init error\n' + e);
						} finally {
							clearInterval(timer);
						}
					} else if (player === "html5Player") {
						var readyState = isBangumi('.bilibili-player-video-panel').getAttribute('style');
						var video = isBangumi('.bilibili-player-video video');
						if (video !== null && readyState !== null ) {
							if (readyState.search("display: none;") !== -1) {
								try {
									createConfigBtn();
									isFirstrun();

									//给老版本初始化“双击全屏延时”的默认值
									if (setting.doubleClickFullScreen === true && typeof setting.doubleClickFullScreenDelayed === 'undefined') {
										adjustPlayer.doubleClickFullScreen(setting.doubleClickFullScreen,200);
									} else {
										adjustPlayer.doubleClickFullScreen(setting.doubleClickFullScreen,setting.doubleClickFullScreenDelayed);
									}

									//“半自动全屏”提示，“半自动全屏”最优先开启
									var autoFullScreen = function(){
										var tipsAutoFullScreen = config.getValue('player_tips_autoFullScreen', true);
										if (tipsAutoFullScreen) {
											configWindow.tipsAutoFullScreen();
										}
										adjustPlayer.autoFullScreen(setting.autoFullScreen,video);
									};
									if (setting.autoWebFullScreen === true && setting.autoFullScreen === true) {
										autoFullScreen();
									} else if (setting.autoWebFullScreen === true) {
										adjustPlayer.autoWebFullScreen(setting.autoWebFullScreen);
									} else if (setting.autoFullScreen === true) {
										autoFullScreen();
									} else {
										//开启“网页全屏”，“半自动全屏”后，不加载的功能
										adjustPlayer.autoFocus(setting.autoFocus,setting.autoFocusOffsetType,setting.autoFocusOffsetValue,setting.autoFocusPosition);
										adjustPlayer.autoWide(setting.autoWide,setting.autoWideFullscreen);
										adjustPlayer.resizePlayer(setting.resizePlayer,setting.adjustPlayerWidth,setting.adjustPlayerRatio);
										adjustPlayer.fixMiniPlayer();
									}

									//初始化“迷你播放器尺寸”的默认值
									if (setting.resizePlayer === true && typeof setting.resizeMiniPlayer === 'undefined') {
										adjustPlayer.resizeMiniPlayer(true,320);
									} else {
										adjustPlayer.resizeMiniPlayer(setting.resizeMiniPlayer,setting.resizeMiniPlayerSize,setting.resizeMiniPlayerSizeResizable);
									}

									//开启“循环播放”后，不加载“自动播放下一个视频”
									if (setting.autoNextPlist === true && setting.autoLoopVideo === true) {
										adjustPlayer.autoLoopVideo(setting.autoLoopVideo);
									} else if (setting.autoNextPlist === true) {
										window.setTimeout(function() {adjustPlayer.autoNextPlist(setting.autoNextPlist,video);}, 1000);
									} else {
										adjustPlayer.autoLoopVideo(setting.autoLoopVideo);
									}

									adjustPlayer.danmukuPreventShade(setting.danmukuPreventShade,setting.danmukuPreventShadeType);
									adjustPlayer.tabDanmulist(setting.tabDanmulist);

									//修复没开启“自动宽屏模式”自动关灯失效
									window.setTimeout(function() {adjustPlayer.autoLightOn(setting.autoLightOn);}, 200);

									adjustPlayer.hideDanmuku(setting.danmuku,setting.danmukuType);
									adjustPlayer.autoHideControlBar(setting.autoHideControlBar,setting.shortcuts.focusDanmakuInput,video);
									adjustPlayer.autoPlay(setting.autoPlay,video);
									adjustPlayer.autoVideoSpeed(setting.autoVideoSpeed,video);
									adjustPlayer.skipSetTime(setting.skipSetTime,setting.skipSetTimeValue,video);
									adjustPlayer.shortcuts(setting.shortcuts);

									reloadPList.init();
									console.log('adjustPlayer:\nhtml5Player init success');
								}
								catch (e) {
									clearInterval(timer);
									console.log('adjustPlayer:\nhtml5Player init error\n' + e);
								}
								finally {
									clearInterval(timer);
								}
							}
						} else {
							//console.log(timerCount);
							timerCount++;
							if (timerCount >= 120) {
								timerCount = 0 ;
								clearInterval(timer);
								console.log('adjustPlayer:\n html5Player init error: not find video');
							}
						}
					} else {
						//console.log(timerCount);
						timerCount++;
						if (timerCount >= 120) {
							timerCount = 0 ;
							clearInterval(timer);
							console.log('adjustPlayer:\n html5Player init error: timeout');
						}
					}
				}, 800);
			} else if(documentState === "hidden"){
				//修复后台打开视频页面脚本加载失效
				var hidden, visibilityChange;
				if (typeof document.hidden !== "undefined") {
					hidden = "hidden";
					visibilityChange = "visibilitychange";
				} else if (typeof document.msHidden !== "undefined") {
					hidden = "msHidden";
					visibilityChange = "msvisibilitychange";
				} else if (typeof document.webkitHidden !== "undefined") {
					hidden = "webkitHidden";
					visibilityChange = "webkitvisibilitychange";
				}
				function visibilitychangeEvent() {
					if (typeof document.addEventListener === "undefined" || typeof document[hidden] === "undefined") {
						console.log("adjustPlayer:\n nonsupport the Page Visibility API.");
					} else {
						if(document.visibilityState === "visible") {
							init();
							document.removeEventListener(visibilityChange,visibilitychangeEvent, false);
						}
					}
				}
				document.addEventListener(visibilityChange, visibilitychangeEvent, false);
			} else {
				console.log("adjustPlayer:\n nonsupport the Page Visibility API.");
			}
		},
		reload: function(setting) {
			//多P页面重加载
			console.log('adjustPlayer:\n' + 'reloadPage:' + location.href);
			//总计时器
			var timerCount = 0;
			var timer = window.setInterval(function callback() {
				var player = isPlayer();
				if (player === "flashPlayer") {
					try {
						setTimeout(function () {
							adjustPlayer.autoWide(setting.autoWide,setting.autoWideFullscreen);
							adjustPlayer.autoFocus(setting.autoFocus,setting.autoFocusOffsetType,setting.autoFocusOffsetValue,setting.autoFocusPosition);
							adjustPlayer.resizePlayer(setting.resizePlayer,setting.adjustPlayerWidth,setting.adjustPlayerRatio);
							adjustPlayer.fixMiniPlayer();
							reloadPList.init();
						}, 500);
						console.log('adjustPlayer:\nflashPlayer reload success');
					} catch (e) {
						clearInterval(timer);
						console.log('adjustPlayer:\nflashPlayer reload error\n' + e);
					} finally {
						clearInterval(timer);
					}
				} else if (player === "html5Player") {
					var readyState = isBangumi('.bilibili-player-video-panel').getAttribute('style');
					var video = isBangumi('.bilibili-player-video video');
					if (video !== null && readyState !== null ) {
						if (readyState.search("display: none;") !== -1) {
							try {
								//给老版本初始化“双击全屏延时”的默认值
								if (setting.doubleClickFullScreen === true && typeof setting.doubleClickFullScreenDelayed === 'undefined') {
									adjustPlayer.doubleClickFullScreen(setting.doubleClickFullScreen,200);
								} else {
									adjustPlayer.doubleClickFullScreen(setting.doubleClickFullScreen,setting.doubleClickFullScreenDelayed);
								}
								//“半自动全屏”提示，“半自动全屏”最优先开启
								var autoFullScreen = function(){
									var tipsAutoFullScreen = config.getValue('player_tips_autoFullScreen', true);
									if (tipsAutoFullScreen) {
										configWindow.tipsAutoFullScreen();
									}
									adjustPlayer.autoFullScreen(setting.autoFullScreen,video);
								};
								if (setting.autoWebFullScreen === true && setting.autoFullScreen === true) {
									autoFullScreen();
								} else if (setting.autoWebFullScreen === true) {
									adjustPlayer.autoWebFullScreen(setting.autoWebFullScreen);
								} else if (setting.autoFullScreen === true) {
									autoFullScreen();
								} else {
									//开启“网页全屏”，“半自动全屏”后，不加载的功能
									adjustPlayer.autoFocus(setting.autoFocus,setting.autoFocusOffsetType,setting.autoFocusOffsetValue,setting.autoFocusPosition);
									adjustPlayer.autoWide(setting.autoWide,setting.autoWideFullscreen);
									adjustPlayer.resizePlayer(setting.resizePlayer,setting.adjustPlayerWidth,setting.adjustPlayerRatio);
									adjustPlayer.fixMiniPlayer();
								}
								//初始化“迷你播放器尺寸”的默认值
								if (setting.resizePlayer === true && typeof setting.resizeMiniPlayer === 'undefined') {
									adjustPlayer.resizeMiniPlayer(true,320);
								} else {
									adjustPlayer.resizeMiniPlayer(setting.resizeMiniPlayer,setting.resizeMiniPlayerSize,setting.resizeMiniPlayerSizeResizable);
								}
								//开启“循环播放”后，不加载“自动播放下一个视频”
								if (setting.autoNextPlist === true && setting.autoLoopVideo === true) {
									adjustPlayer.autoLoopVideo(setting.autoLoopVideo);
								} else if (setting.autoNextPlist === true) {
									window.setTimeout(function() {adjustPlayer.autoNextPlist(setting.autoNextPlist,video);}, 1000);
								} else {
									adjustPlayer.autoLoopVideo(setting.autoLoopVideo);
								}

								adjustPlayer.danmukuPreventShade(setting.danmukuPreventShade,setting.danmukuPreventShadeType);
								adjustPlayer.tabDanmulist(setting.tabDanmulist);

								//修复没开启“自动宽屏模式”自动关灯失效
								window.setTimeout(function() {adjustPlayer.autoLightOn(setting.autoLightOn);}, 200);
								adjustPlayer.hideDanmuku(setting.danmuku,setting.danmukuType);
								adjustPlayer.autoHideControlBar(setting.autoHideControlBar,setting.shortcuts.focusDanmakuInput,video);
								window.setTimeout(function() {adjustPlayer.autoVideoSpeed(setting.autoVideoSpeed,video);}, 200);
								window.setTimeout(function() {adjustPlayer.skipSetTime(setting.skipSetTime,setting.skipSetTimeValue,video);}, 200);
								adjustPlayer.autoPlay(setting.autoPlay,video);
								reloadPList.init();
								console.log('adjustPlayer:\nhtml5Player reload success');
							}
							catch (e) {
								clearInterval(timer);
								console.log('adjustPlayer:\nhtml5Player reload error\n' + e);
							}
							finally {
								clearInterval(timer);
							}
						}
					} else {
						//console.log(timerCount);
						timerCount++;
						if (timerCount >= 120) {
							timerCount = 0 ;
							clearInterval(timer);
							console.log('adjustPlayer:\n html5Player reload error: not find video');
						}
					}
				} else {
					//console.log(timerCount);
					timerCount++;
					if (timerCount >= 120) {
						timerCount = 0 ;
						clearInterval(timer);
						console.log('adjustPlayer:\n html5Player reload error: timeout');
					}
				}
			}, 800);
		}
	};
	var reloadPList = {
		getPListId: function(href) {
			var id;
			if(typeof href !== 'undefined'){
				id = href.match(/ep\d*/g) || href.match(/p=\d*/g) || href.match(/#page=\d*/g) || href.match(/ss\d*#\d*/g) || href.match(/watchlater\/#\/av\d*\/p\d*/g);
				if (id !== null) {
					id = id[0].replace(/\D/g,'');
				} else {
					id = '';
				}
			}
			return id;
		},
		getCurrentPListId: function(id) {
			if(typeof id !== 'undefined') {
				var currentPListId = document.body.querySelector('#adjust-player-currentPListId');
				if(currentPListId === null){
					var node = document.createElement('div');
					node.id = 'adjust-player-currentPListId';
					node.setAttribute("style","display: none;");
					node.innerHTML = id;
					document.body.appendChild(node);
				} else{
					currentPListId.innerHTML = id;
				}
			} else {
				console.log("reloadPList: Can't get CurrentPListId");
			}
		},
		init: function(){
			var pListId = reloadPList.getPListId(location.href);
			reloadPList.getCurrentPListId(pListId);

			var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
			var observer = new MutationObserver(function (records) {
				for (var i = 0; i < records.length; i++) {
					var targetNode = records[i].target;
					if (targetNode !== null) {
						var isReload = false;
						var reloadTimer = null;
						clearTimeout(this.reloadTimer);
						this.reloadTimer = window.setTimeout(function() {
							if(isReload === false){
								var newPlistId,oldPListId;
								newPlistId = reloadPList.getPListId(targetNode.baseURI);
								oldPListId = document.querySelector('#adjust-player-currentPListId').innerHTML;
								if(newPlistId !== oldPListId){
									console.log('reloadPList:\nnewPlistId:' + newPlistId + "\noldPListId:" +oldPListId);
									isReload = true;
									observer.disconnect();
									if (typeof GM_getValue === 'function') {
										var setting = config.read();
										adjustPlayer.reload(setting);
									} else {
										var setting = config.read();
										setting.then(function(value){
											adjustPlayer.reload(value);
										});
									}
								}
							} else {
								return;
							}
						}, 200);
					}
				}
			});
			observer.observe(document.querySelector('#bofqi'), {
				attributes: true,
				childList: true
			});
		}
	};
	var config = {
		storageType: function () {
			if(window.localStorage) {
				var type = localStorage.getItem('adjustPlayer_storageType');
				if(type === "localStorage") {
					return "localStorage";
				} else if(type === null || type === "extension" ) {
					return "extension";
				} else {
					return "unknown";
				}
			} else {
				console.log("adjustPlayer:获取设置失败，不支持localStorage");
			}
		},
		getValue: function (value,defalutValue) {
			var storageType = config.storageType();
			if(storageType === "localStorage"){
				var item;
				if(typeof defalutValue !== "undefined" && item === null){
					item = localStorage.getItem('adjustPlayer_localStorage_' + value);
					localStorage.setItem('adjustPlayer_localStorage_' + value,defalutValue);
				} else {
					item = localStorage.getItem('adjustPlayer_localStorage_' + value);
				}
				item = JSON.parse(item);
				return item;
			} else if(storageType === "extension"){
				if (typeof GM_getValue === 'function') {
					var item;
					if(typeof defalutValue !== 'undefined'){
						item = GM_getValue(value,defalutValue);
					} else {
						item = GM_getValue(value);
					}
					return item;
				} else {
					if(typeof defalutValue !== 'undefined'){
						return GM.getValue(value,defalutValue);
					} else {
						return GM.getValue(value);
					}
				}
			} else {
				console.log("adjustPlayer:读取"+ value +"失败，未知存储类型");
				item = null;
				return item;
			}
		},
		setValue: function (name,value) {
			var storageType = config.storageType();
			if(storageType === "localStorage"){
				value = JSON.stringify(value);
				localStorage.setItem('adjustPlayer_localStorage_' + name,value);
			} else if(storageType === "extension"){
				if (typeof GM_getValue === 'function') {
					GM_setValue(name,value);
				} else {
					GM.setValue(name,value);
				}
			} else {
				console.log("adjustPlayer:设置"+ value +"失败，未知存储类型");
			}
		},
		read: function () {
			if (typeof GM_getValue === 'function') {
				var adjustPlayerSetting = config.getValue('player_adjustPlayer');
				if(typeof adjustPlayerSetting !== "undefined" && adjustPlayerSetting !== null){
					return adjustPlayerSetting;
				} else {
					var defaultConfig = config.restore();
					if (defaultConfig !== null) {
						return defaultConfig;
					} else {
						console.log("adjustPlayer:读取设置失败");
					}
				}
			} else {
				return new Promise (function(resolve, reject) {
					var adjustPlayerSetting = config.getValue('player_adjustPlayer');
					adjustPlayerSetting.then(function(value) {
						if(typeof value !== "undefined" && value !== null){
							resolve(value);
						} else {
							var defaultConfig = config.restore();
							defaultConfig.then(function(value) {
								if (value !== null) {
									resolve(value);
								} else {
									console.log("adjustPlayer:读取设置失败");
								}
							});
						}
					});
				});
			}
		},
		write: function (adjustPlayer) {
			config.setValue('player_adjustPlayer', adjustPlayer);
		},
		restore: function () {
			var defalutConfig = '{ "autoWide": true, "autoFocus": true, "shortcuts": {} }';
			config.setValue('player_adjustPlayer', JSON.parse(defalutConfig));
			config.setValue('player_firstrun', true);
			config.setValue('player_tips_autoFullScreen', true);
			if (typeof GM_getValue === 'function') {
				var item = config.getValue('player_adjustPlayer');
				return item;
			} else {
				return new Promise (function(resolve, reject) {
					var item = config.getValue('player_adjustPlayer');
					item.then(function(value) {
						resolve(value);
					});
				});
			}
		}
	};
	var dialog = {
		create: function (name, title, bar, content,isModal) {
			var isExist = document.querySelector('#adjust-player > #' + name);
			if (isExist === null) {
				var dialogElement = document.createElement('div');
				dialogElement.id = name;
				dialogElement.className = 'dialog';
				dialogElement.innerHTML = '<div class="title">' + title + '' + bar + '</div>' + content;
				if (isModal != null) {
					dialogElement.setAttribute("isModal", "true");
					dialogElement.setAttribute("modalParentId", isModal.getAttribute("id"));
					isModal.classList.add("modalWindow");
				}
				document.querySelector('#adjust-player').appendChild(dialogElement);
				dialog.eventBinding(dialogElement, name);
				//mask
				document.querySelector('#adjust-player .adjust-player-mask').setAttribute("style","display: block;");
			}
		},
		close: function (element) {
			if (element.getAttribute('isModal') === "true") {
				var modalParent = document.querySelector('#'+ element.getAttribute('modalParentId') +'');
				if (modalParent !== null) {
					modalParent.classList.remove("modalWindow");
				}
			}
			document.querySelector('#adjust-player').removeChild(element);
			//mask
			var adjustPlayer = document.querySelectorAll('#adjust-player > div.dialog').length;
			if (adjustPlayer < 1) {
				document.querySelector('#adjust-player .adjust-player-mask').removeAttribute("style");
			}
		},
		eventBinding: function (element, name) {
			element.addEventListener('mouseover', function (e) {
				var adjustPlayerTooltip =document.querySelector('#adjust-player-tooltip');
				var tooltip = e.target.getAttribute('tooltip');
				if (e.target && tooltip !== null) {
					var left = e.clientX;
					var top = e.clientY;
					if(adjustPlayerTooltip === null){
						var tooltipElement = document.createElement('div');
						tooltipElement.id = "adjust-player-tooltip";
						tooltipElement.style = 'left: '+ left +'px;top: '+ top +'px;margin:10px 0 0 -80px;color: #222;font-size:12px;line-height: 16px;text-align: left;display: block;position: fixed;background: #fff;border-radius: 4px;box-shadow: 0px 0px 1px 0px;width: 200px;overflow-wrap: break-word;padding: 4px;z-index: 999999;';
						tooltipElement.innerHTML = tooltip.replace(/\n/g,"<br/>");
						document.querySelector('#adjust-player').appendChild(tooltipElement);
					}else{
						adjustPlayerTooltip.style = 'left: '+ left +'px;top: '+ top +'px;margin:10px 0 0 -80px;color: #222;font-size:12px;line-height: 16px;text-align: left;display: block;position: fixed;background: #fff;border-radius: 4px;box-shadow: 0px 0px 1px 0px;width: 200px;overflow-wrap: break-word;padding: 4px;z-index: 999999;';
						adjustPlayerTooltip.innerHTML = tooltip.replace(/\n/g,"<br/>");
					}
				} else {
					if(adjustPlayerTooltip !== null){
						adjustPlayerTooltip.style = '';
						adjustPlayerTooltip.innerHTML = '';
					}
				}
			});
			element.addEventListener('click', function (e) {
				var action = e.target.getAttribute('action');
				if (e.target && action !== null) {
					if (name === "main") {
						switch (action) {
							case 'shortcuts':
								configWindow.shortcutsWindow(e);
								break;
							case 'adjustPlayerSize':
								configWindow.adjustPlayerSize();
								break;
							case 'restoreDef':
								configWindow.restore();
								break;
							case 'save':
								configWindow.save();
								break;
							case 'childElementDisabledEvent':
								configWindow.childElementDisabledEvent(e.target.getAttribute("name"),e.target.getAttribute("disabledchildelement"));
								break;
							case 'storageType':
								configWindow.storageTypeWindow(e);
								break;
							default:
								break;
						}
					} else if (name === "tipsAutoFullScreen") {
						switch (action) {
							case 'notTips':
								configWindow.tipsAutoFullScreenEvent(name);
								break;
							default:
								break;
						}
					} else if (name === "shortcutsSetting") {
						switch (action) {
							case 'clear':
								configWindow.shortcutsSettingClear();
								break;
							case 'save':
								configWindow.shortcutsSettingSave();
								break;
							case 'cancel':
								configWindow.shortcutsSettingCancel();
								break;
							default:
								break;
						}
					} else if (name === "storageType") {
						switch (action) {
							case 'save':
								configWindow.storageTypeSave();
								break;
							case 'cancel':
								dialog.close(this);
								break;
							default:
								break;
						}
					}
					switch (action) {
						case 'help':
							configWindow.help();
							break;
						case 'close':
							dialog.close(this);
							break;
						default:
							break;
					}
				}
			});
		}
	};
	var configWindow = {
		create: function () {
			var name = 'main';
			var title = '哔哩哔哩（bilibili.com）播放器调整';
			var bar = '<span class="btn" action="help">?</span><span class="btn" action="close">X</span>';
			var content = commentToString(function () { /*
         <form>
            <div class="wrapper">
            	<div class="left">
            		<fieldset class="shortcutsGroup">
            			<legend><label>快捷键</label></legend>
            			<div class="block">
            				<label class="h5">
            					<input name="shortcutsSwitch" type="checkbox" list="shortcuts" action="childElementDisabledEvent" disabledChildElement="div,shortcutsItem" >启用快捷键功能<span tooltip="使用帮助：&#10;1：快捷键的总开关，开启后“快捷键功能”才会生效" class="tipsButton">[?]</span>
            				</label>
            				<div class="shortcutsItem">
            					<label class="h5">
            						<input name="playPause" type="checkbox" list="shortcuts">播放/暂停视频 <span class="tipsButton" action="shortcuts" typeName="playPause">[设置]</span>
            						<input type="text" name="playPauseKeyName" readOnly="true" list="shortcuts">
            						<input type="hidden" name="playPauseKeyCode" list="shortcuts" KeyCode="true">
            					</label>
            					<label class="h5">
            						<input name="showHideDanmuku" type="checkbox" list="shortcuts">显示/隐藏弹幕 <span class="tipsButton" action="shortcuts" typeName="showHideDanmuku">[设置]</span>
            						<input type="text" name="showHideDanmukuKeyName" readOnly="true" list="shortcuts">
            						<input type="hidden" name="showHideDanmukuKeyCode" list="shortcuts" KeyCode="true">
            					</label>
            					<label class="h5">
            						<input name="playerWide" type="checkbox" list="shortcuts">宽屏模式 <span class="tipsButton" action="shortcuts" typeName="playerWide">[设置]</span>
            						<input type="text" name="playerWideKeyName" readOnly="true" list="shortcuts">
            						<input type="hidden" name="playerWideKeyCode" list="shortcuts" KeyCode="true">
            					</label>
            					<label class="h5">
            						<input name="fullscreen" type="checkbox" list="shortcuts">全屏模式 <span class="tipsButton" action="shortcuts" typeName="fullscreen">[设置]</span>
            						<input type="text" name="fullscreenKeyName" readOnly="true" list="shortcuts">
            						<input type="hidden" name="fullscreenKeyCode" list="shortcuts" KeyCode="true">
            					</label>
            					<label class="h5">
            						<input name="webfullscreen" type="checkbox" list="shortcuts">网页全屏模式 <span class="tipsButton" action="shortcuts" typeName="webfullscreen">[设置]</span>
            						<input type="text" name="webfullscreenKeyName" readOnly="true" list="shortcuts">
            						<input type="hidden" name="webfullscreenKeyCode" list="shortcuts" KeyCode="true">
            					</label>
								<label class="h5">
            						<input name="videoMute" type="checkbox" list="shortcuts">静音/恢复静音  <span class="tipsButton" action="shortcuts" typeName="videoMute">[设置]</span>
            						<input type="text" name="videoMuteKeyName" readOnly="true" list="shortcuts">
            						<input type="hidden" name="videoMuteKeyCode" list="shortcuts" KeyCode="true">
            					</label>
								<label class="h5">
            						<input name="lightOnOff" type="checkbox" list="shortcuts">播放器关灯/开灯  <span class="tipsButton" action="shortcuts" typeName="lightOnOff">[设置]</span>
            						<input type="text" name="lightOnOffKeyName" readOnly="true" list="shortcuts">
            						<input type="hidden" name="lightOnOffKeyCode" list="shortcuts" KeyCode="true">
            					</label>
								<label class="h5">
            						<input name="loopVideoOnOff" type="checkbox" list="shortcuts">循环播放  <span class="tipsButton" action="shortcuts" typeName="loopVideoOnOff">[设置]</span>
            						<input type="text" name="loopVideoOnOffKeyName" readOnly="true" list="shortcuts">
            						<input type="hidden" name="loopVideoOnOffKeyCode" list="shortcuts" KeyCode="true">
            					</label>
								<label class="h5">
            						<input name="focusPlayer" type="checkbox" list="shortcuts">定位到播放器<span tooltip="使用帮助：&#10;1：具体位置根据“功能调整” - “自动定位到XXX顶端” 设置的值来定位&#10（没设置“功能调整” - “自动定位到XXX顶端”功能的话，默认定位到播放器顶端）&#10;2：按下后会在“播放器位置”，和“之前浏览的位置”进行切换" class="tipsButton">[?]</span>
									<span class="tipsButton" action="shortcuts" typeName="focusPlayer">[设置]</span>
            						<input type="text" name="focusPlayerKeyName" readOnly="true" list="shortcuts">
            						<input type="hidden" name="focusPlayerKeyCode" list="shortcuts" KeyCode="true">
            					</label>
								<label class="h5">
            						<input name="focusDanmakuInput" type="checkbox" list="shortcuts">定位到弹幕框<span tooltip="使用帮助：&#10;1：焦点在弹幕框时键盘按 Tab 键隐藏弹幕框&#10;2：开启了“自动隐藏播放器控制栏”并设置了“定位到弹幕框的快捷键”之后，请用快捷键来显示弹幕框" class="tipsButton">[?]</span>
									<span class="tipsButton" action="shortcuts" typeName="focusDanmakuInput">[设置]</span>
            						<input type="text" name="focusDanmakuInputKeyName" readOnly="true" list="shortcuts">
            						<input type="hidden" name="focusDanmakuInputKeyCode" list="shortcuts" KeyCode="true">
            					</label>
								<label class="h5">
            						<input name="addVideoSpeed" type="checkbox" list="shortcuts">增加播放速度 <span class="tipsButton" action="shortcuts" typeName="addVideoSpeed">[设置]</span>
            						<input type="text" name="addVideoSpeedKeyName" readOnly="true" list="shortcuts">
            						<input type="hidden" name="addVideoSpeedKeyCode" list="shortcuts" KeyCode="true">
            					</label>
            					<label class="h5">
            						<input name="subVideoSpeed" type="checkbox" list="shortcuts">减少播放速度 <span class="tipsButton" action="shortcuts" typeName="subVideoSpeed">[设置]</span>
            						<input type="text" name="subVideoSpeedKeyName" readOnly="true" list="shortcuts">
            						<input type="hidden" name="subVideoSpeedKeyCode" list="shortcuts" KeyCode="true">
            					</label>
								<label class="h5">
            						<input name="resetVideoSpeed" type="checkbox" list="shortcuts">重置播放速度 <span class="tipsButton" action="shortcuts" typeName="resetVideoSpeed">[设置]</span>
            						<input type="text" name="resetVideoSpeedKeyName" readOnly="true" list="shortcuts">
            						<input type="hidden" name="resetVideoSpeedKeyCode" list="shortcuts" KeyCode="true">
            					</label>
								<label class="h5">
            						<input name="prevPlist" type="checkbox" list="shortcuts">上一个视频  <span class="tipsButton" action="shortcuts" typeName="prevPlist">[设置]</span>
            						<input type="text" name="prevPlistKeyName" readOnly="true" list="shortcuts">
            						<input type="hidden" name="prevPlistKeyCode" list="shortcuts" KeyCode="true">
            					</label>
            					<label class="h5">
            						<input name="nextPlist" type="checkbox" list="shortcuts">下一个视频 <span class="tipsButton" action="shortcuts" typeName="nextPlist">[设置]</span>
            						<input type="text" name="nextPlistKeyName" readOnly="true" list="shortcuts">
            						<input type="hidden" name="nextPlistKeyCode" list="shortcuts" KeyCode="true">
            					</label>
								<label class="h5">
            						<input name="prevVideoFramerate" type="checkbox" list="shortcuts">快退一帧  <span class="tipsButton" action="shortcuts" typeName="prevVideoFramerate">[设置]</span>
            						<input type="text" name="prevVideoFramerateKeyName" readOnly="true" list="shortcuts">
            						<input type="hidden" name="prevVideoFramerateKeyCode" list="shortcuts" KeyCode="true">
            					</label>
            					<label class="h5">
            						<input name="nextVideoFramerate" type="checkbox" list="shortcuts">快进一帧 <span class="tipsButton" action="shortcuts" typeName="nextVideoFramerate">[设置]</span>
            						<input type="text" name="nextVideoFramerateKeyName" readOnly="true" list="shortcuts">
            						<input type="hidden" name="nextVideoFramerateKeyCode" list="shortcuts" KeyCode="true">
            					</label>
            				</div>
            			</div>
            		</fieldset>
            		<fieldset class="danmukuGroup">
            			<legend><label>弹幕</label></legend>
            			<div class="block">
            				<label class="h5">
            					<input name="danmuku" type="checkbox">默认隐藏
            					<select name="danmukuType">
            						<option value="all" selected="selected">所有</option>
            						<option value="bangumi">番剧</option>
            					</select>弹幕<span tooltip="使用帮助：&#10;1：选择默认隐藏“番剧”弹幕时，只隐藏 bangumi.bilibili.com 域名，www.bilibili.com/bangumi/play/ep 下视频的弹幕" class="tipsButton">[?]</span>
            				</label>
							<label class="h5">
								<input name="danmukuPreventShade" type="checkbox">默认
								<select name="danmukuPreventShadeType">
            						<option value="on" selected="selected">开启</option>
            						<option value="off">关闭</option>
            					</select>防挡弹幕<span tooltip="使用帮助：&#10;1：“番剧”页面和普通页面的“防挡弹幕”默认设置竟然不一样？开启后设置让它一致 " class="tipsButton">[?]</span>
							</label>
							<label class="h5"><input name="tabDanmulist" type="checkbox">默认显示弹幕列表</label>
            		</div>
            	</fieldset>
            </div>
            <div class="right">
            	<fieldset class="modeGroup">
            		<legend><label>播放模式</label></legend>
            		<div class="block">
						<label><input name="autoWide" type="checkbox">自动宽屏</label>
						<label class="h5" style="margin-left: 24px;">退出全屏后
							<select name="autoWideFullscreen">
            					<option value="off" selected="selected">关闭</option>
            					<option value="on">开启</option>
            				</select>自动宽屏
							<span tooltip="使用帮助：&#10;1：开启“自动宽屏”功能后，退出全屏后是否开启宽屏" class="tipsButton">[?]</span>
						</label>
            			<label class="h5"><input name="autoWebFullScreen" type="checkbox">自动网页全屏<span tooltip="使用帮助：&#10;1：按Esc键退出网页全屏&#10;3：开启此功能后，调整大小，自动宽屏，定位功能不会启用" class="tipsButton">[?]</span></label>
            			<label class="h5"><input name="doubleClickFullScreen" type="checkbox" action="childElementDisabledEvent" disabledChildElement="input,doubleClickFullScreenDelayed" >双击全屏<span tooltip="使用帮助：&#10;1：双击视频区域全屏" class="tipsButton">[?]</span></label>
						<label class="h5" style="margin-left: 24px;">播放/暂停延时<input name="doubleClickFullScreenDelayed" type="number" min="0" max="500" placeholder="200" value="200" style="width: 45px;">毫秒<span tooltip="使用帮助：&#10;1：开启“双击全屏”功能后点击视频区域“播放/暂停”会增加延时，使全屏功能更流畅&#10;2：由于增加了延时，导致点击视频区域“播放/暂停”功能不是及时的，这时可以用键盘空格键暂停&#10;3：毫秒数设置为0，关闭延时" class="tipsButton">[?]</span></label>
            			<label class="h5"><input name="autoFullScreen" type="checkbox">半自动全屏<span tooltip="使用帮助：&#10;1：因为浏览器有限制无法使用脚本模拟自动全屏，需要手动按下 F11 键全屏。&#10;3：退出全屏需要手动按 F11 键，再次按 Esc 键退出网页全屏。&#10;4：建议搭配“自动播放下一个视频”功能使用。&#10;" class="tipsButton">[?]</span></label>
					</div>
            	</fieldset>
            	<fieldset class="playbackGroup">
            		<legend><label>播放视频</label></legend>
            		<div class="block">
            			<label class="h5"><input name="autoPlay" type="checkbox">自动播放视频</label>
            			<label class="h5"><input name="autoNextPlist" type="checkbox">自动播放下一个视频<span tooltip="使用帮助：&#10;1：此选项启用后将无视“B站”HTML5播放器自带的“自动换P功能”&#10;2：自动跳过“承包榜”、“充电名单”" class="tipsButton">[?]</span></label>
            			<label class="h5"><input name="autoLoopVideo" type="checkbox">自动循环播放当前视频<span tooltip="使用帮助：&#10;1：开启此功能后“自动播放下一个视频”不会启用 &#10;" class="tipsButton">[?]</span></label>
						<label class="h5"><input name="skipSetTime" type="checkbox" action="childElementDisabledEvent" disabledChildElement="inputs,skipSetTimeValueMinutes;skipSetTimeValueSeconds" >自动从指定时间开始播放</label>
            			<label style="margin-left: 24px;">
            				<input name="skipSetTimeValueMinutes" type="number" min="0" max="60" placeholder="0" value="0" style="width: 45px;" disabled="">分钟
            				<input name="skipSetTimeValueSeconds" type="number" min="0" max="60" placeholder="0" value="0" style="width: 45px;" disabled="">秒
            				<input type="hidden" name="skipSetTimeValue">
            			</label>
            			<label class="h5">选择默认播放速度
            				<select name="autoVideoSpeed">
            					<option value="0.5">0.5倍速</option>
            					<option value="0.75">0.75倍速</option>
            					<option value="1" selected="selected">正常</option>
            					<option value="1.25">1.25倍速</option>
            					<option value="1.5">1.5倍速</option>
            					<option value="2">2倍速</option>
            				</select>
            			</label>
            		</div>
            	</fieldset>
            	<fieldset class="functionGroup">
            			<legend><label>功能调整</label></legend>
            			<div class="block">
            				<label><input name="autoFocus" type="checkbox">自动定位到
            					<select name="autoFocusPosition">
            						<option value="player" selected="selected">播放器</option>
            						<option value="video">视频</option>
            					</select>
            					顶端<span tooltip="使用帮助：&#10;1：如果不满意位置，可以设置偏移位置，往上或往下移（播放器顶端位置（或视频顶端位置）是参照）。" class="tipsButton">[?]</span>
            				</label>
            				<label style="margin-left: 24px;">定位偏移
            					<select name="autoFocusOffsetType">
            						<option value="defalut" selected="selected">默认</option>
            						<option value="sub">上移</option>
            						<option value="add">下移</option>
            					</select>
            					<input name="autoFocusOffsetValue" type="number" min="0" value="0" placeholder="0" style="width: 45px;" disabled="">像素
            				</span>
            			</label>
            			<label class="h5"><input name="autoHideControlBar" type="checkbox">自动隐藏播放器控制栏<span tooltip="使用帮助：&#10;1：需要开启“宽屏模式”或“网页全屏模式”才会生效&#10;3：鼠标移动到播放器顶部显示弹幕栏，移动到底部显示控制栏&#10;4：如果发现画面出现“黑边”请开启“手动指定播放器大小”功能&#10; 并使用 [调整大小] 功能调整大小&#10;5：此功能修改自：https://userstyles.org/styles/131642/bilibili-html5" class="tipsButton">[?]</span></label>
            			<label>
            				<input name="resizePlayer" type="checkbox">手动指定播放器大小
            				<span class="tipsButton" action="adjustPlayerSize" tooltip="使用帮助：&#10;1：点击[调整大小]进行调整">[调整大小]</span>
            				<input type="hidden" name="adjustPlayerWidth">
							<input type="hidden" name="adjustPlayerRatio">
            			</label>
            			<label>
            				<input name="resizeMiniPlayer" type="checkbox" action="childElementDisabledEvent" disabledChildElement="input,resizeMiniPlayerSize" >迷你播放器宽度
            				<input name="resizeMiniPlayerSize" type="number" min="0" value="320" placeholder="320" style="width: 45px;" disabled="">像素
            				<span tooltip="使用帮助：&#10;1：调整评论处迷你播放器大小，输入合适的宽度后自动计算新大小&#10;   （ 新大小比例为 16：9）&#10;" class="tipsButton">[?]</span>
						</label>
						<label class="h5" style="margin-left: 24px;">
							迷你播放器
							<select name="resizeMiniPlayerSizeResizable">
            					<option value="off" selected="selected">关闭</option>
            					<option value="on">开启</option>
            				</select>可调整大小
							<span tooltip="使用帮助：&#10;1：开启“修改迷你播放器宽度”后，拖动迷你播放器右下角调节按钮，可以调整大小。&#10;2：此功能是“实验功能”，部分页面可能不起作用" class="tipsButton">[?]</span>
						</label>
						<label class="h5"><input name="autoLightOn" type="checkbox">自动播放器关灯<span tooltip="使用帮助：&#10;1：在视频区域内点击右键进行开，关灯操作&#10;2：双击黑暗区域开灯。" class="tipsButton">[?]</span></label>
            		</div>
            	</fieldset>
            </div>
        </div>
        <div class="info">
          	<span class="ver"></span>
			<span class="storageType">
          		<a href="javascript:void(0);" action="storageType" tooltip="脚本设置无法保存的，请点这里！">存储类型</a>
           	</span>
           	<span class="feedback">
          		<a href="https://greasyfork.org/zh-CN/scripts/21284-%E5%93%94%E5%93%A9%E5%93%94%E5%93%A9-bilibili-com-%E6%92%AD%E6%94%BE%E5%99%A8%E8%B0%83%E6%95%B4/feedback">反馈</a>
           	</span>
        </div>
        <div class="btns">
           	<div class="btn" action="restoreDef">恢复默认设置</div>
           	<div class="btn" action="save">保存</div>
           	<div class="btn btn-cancel" action="close">关闭</div>
        </div>
        </form>
            */ });
			dialog.create(name, title, bar, content);
		},
		load: function (formData) {
			//loadData
			var form = document.querySelector('#adjust-player #main form');
			deserialize(form, formData);
			//init bindEvent
			configWindow.mainWindowResizeEvent();
			configWindow.autoFocusEvent();
			configWindow.childElementDisabledEvent("resizeMiniPlayer","input,resizeMiniPlayerSize");
			configWindow.childElementDisabledEvent("doubleClickFullScreen","input,doubleClickFullScreenDelayed");
			configWindow.childElementDisabledEvent("skipSetTime","inputs,skipSetTimeValueMinutes;skipSetTimeValueSeconds");
			configWindow.childElementDisabledEvent("shortcutsSwitch","div,shortcutsItem");
			//version
			try{
				var version = document.querySelector('#adjust-player form span.ver').innerHTML = "版本:" + GM_info.script.version;
			} catch (e) {
				var version = document.querySelector('#adjust-player form span.ver').innerHTML = "版本:无法获取";
			}
			//html5Player tips
			var player = isPlayer();
			if (player === "html5Player") {
				if (document.querySelector('#adjustPlayerMainIsHTML5') === null ) {
					var css ='#adjust-player .h5 { color:#222 !important;}';
					var node = document.createElement('style');
					node.type = 'text/css';
					node.id = 'adjustPlayerMainIsHTML5';
					node.appendChild(document.createTextNode(css));
					document.documentElement.appendChild(node);
				}
			}
		},
		save: function () {
			try {
				var form = document.querySelector('#adjust-player #main form');
				var formData = serialize(form);
				//autoFocus
				if (formData.autoFocusOffsetType !== 'defalut' && formData.autoFocus === true) {
					var autoFocusOffsetValue = parseInt(formData.autoFocusOffsetValue.match(/^\+?[0-9]*$/g) [0]);
					if (!isNaN(autoFocusOffsetValue)) {
						formData.autoFocusOffsetValue = autoFocusOffsetValue;
					} else {
						formData.autoFocusOffsetValue = 0;
					}
				} else {
					delete formData.autoFocusOffsetType;
					delete formData.autoFocusOffsetValue;
				}
				//skipSetTime
				if (formData.skipSetTime === true) {
					var skipSetTimeValueMinutes = parseInt(formData.skipSetTimeValueMinutes.match(/^\+?[0-9]*$/g) [0]);
					var skipSetTimeValueSeconds = parseInt(formData.skipSetTimeValueSeconds.match(/^\+?[0-9]*$/g) [0]);
					if (!isNaN(skipSetTimeValueMinutes)) {
						formData.skipSetTimeValueMinutes = skipSetTimeValueMinutes;
						formData.skipSetTimeValue = skipSetTimeValueMinutes * 60;
					} else {
						delete formData.skipSetTimeValueMinutes;
					}
					if (!isNaN(skipSetTimeValueSeconds)) {
						formData.skipSetTimeValueSeconds = skipSetTimeValueSeconds;
						formData.skipSetTimeValue += skipSetTimeValueSeconds;
					} else{
						delete formData.skipSetTimeValueSeconds;
					}
				} else {
					delete formData.skipSetTimeValue;
					delete formData.skipSetTimeValueMinutes;
					delete formData.skipSetTimeValueSeconds;
				}
				//autoVideoSpeed
				if (formData.autoVideoSpeed === '1') {
					delete formData.autoVideoSpeed;
				}
				//resizePlayer
				if (formData.resizePlayer !== true ) {
					delete formData.adjustPlayerWidth;
					delete formData.adjustPlayerRatio;
				}
				//resizeMiniPlayer
				if (formData.resizeMiniPlayer === true ) {
					var resizeMiniPlayerSize = parseInt(formData.resizeMiniPlayerSize.match(/^\+?[0-9]*$/g) [0]);
					if (!isNaN(resizeMiniPlayerSize)) {
						formData.resizeMiniPlayerSize = resizeMiniPlayerSize;
					} else {
						formData.autoFocusOffsetValue = 320;
					}
				} else {
					delete formData.resizeMiniPlayerSize;
				}
				//doubleClickFullScreenDelayed
				if (formData.doubleClickFullScreen === true ) {
					var doubleClickFullScreenDelayed = parseInt(formData.doubleClickFullScreenDelayed.match(/^\+?[0-9]*$/g) [0]);
					if (!isNaN(doubleClickFullScreenDelayed)) {
						formData.doubleClickFullScreenDelayed = doubleClickFullScreenDelayed;
					} else {
						formData.doubleClickFullScreenDelayed = 200;
					}
				} else {
					delete formData.doubleClickFullScreenDelayed;
				}
				//console.log(formData);
				config.write(formData);
				//alert
				unsafeWindow.alert('保存设置成功');
				location.reload();
			} catch (e) {
				unsafeWindow.alert('保存设置失败');
				location.reload();
				console.log("adjustPlayer:\nsave error\n " + e);
			}
		},
		restore: function () {
			var defaultConfig = config.restore();
			if (typeof defaultConfig !== 'undefined') {
				unsafeWindow.alert('恢复设置成功');
			} else {
				unsafeWindow.alert('恢复设置失败');
			}
			location.reload();
		},
		mainWindowResizeEvent: function () {
			var wrapper = document.querySelector('#adjust-player #main form .wrapper');
			var mainWindow = document.querySelector('#adjust-player #main');
			var mainWindowHeight = mainWindow.offsetHeight;
			mainWindow.style = 'margin-top:-' + (mainWindowHeight / 2).toFixed(0) + 'px;';
			var windowHeight = window.outerHeight;
			if (windowHeight < (mainWindowHeight + 280)) {
				wrapper.style = "max-height:" + (windowHeight - 280) + 'px; padding-right:10px;';
				mainWindow.style = 'margin-top:-' + (mainWindow.offsetHeight /2) + 'px;';
			}
		},
		autoFocusEvent: function () {
			var autoFocusOffsetType = document.querySelector('#adjust-player form select[name="autoFocusOffsetType"]');
			var autoFocusOffsetValue = document.querySelector('#adjust-player form input[name="autoFocusOffsetValue"]');
			autoFocusOffsetType.onchange = function (e) {
				var autoFocusEvent = e.target.value ==="defalut" ? autoFocusOffsetValue.setAttribute('disabled', '') : autoFocusOffsetValue.removeAttribute('disabled');
			};
			var autoFocusEvent = autoFocusOffsetType.value ==="defalut" ? autoFocusOffsetValue.setAttribute('disabled', '') : autoFocusOffsetValue.removeAttribute('disabled');
		},
		childElementDisabledEvent: function (parent,childAndType) {
			var childAndType = childAndType.split(",");
			var type = childAndType[0];
			var child = childAndType[1];
			var disabledEvent;

			if (type === "input") {
				var parentElement = document.querySelector('#adjust-player form input[name="'+parent+'"]');
				var childElement = document.querySelector('#adjust-player form input[name="'+child+'"]');
				disabledEvent = parentElement.checked ? childElement.removeAttribute('disabled') : childElement.setAttribute('disabled', '');
			} else if (type === "inputs") {
				var parentElement = document.querySelector('#adjust-player form input[name="'+parent+'"]');
				var childElements = child.split(";");
				var setDisabled = function (disabled) {
					for (var i = 0; i < childElements.length; ++i) {
						if (disabled) {
							document.querySelector('#adjust-player form input[name="'+childElements[i]+'"]').setAttribute('disabled', '');
						} else {
							document.querySelector('#adjust-player form input[name="'+childElements[i]+'"]').removeAttribute('disabled');
						}
					}
				};
				disabledEvent = parentElement.checked ? setDisabled(false) : setDisabled(true);
			} else if (type === "div") {
				var parentElement = document.querySelector('#adjust-player form input[name="'+parent+'"]');
				var childElement = document.querySelector('#adjust-player form div.'+child+'');
				disabledEvent = parentElement.checked ? childElement.classList.remove("disabled") : childElement.classList.add("disabled");
			}
		},
		adjustPlayerSize: function () {
			//init
			if (matchURL.isWatchlater() || matchURL.isOldBangumi() || matchURL.isNewBangumi()) {
				if (window.confirm('调整大小功能不支持在\n【稍后观看页面】，【番剧页面】 中使用。\n点确定会跳转到测试页面，请在测试页面中重新调整\n取消放弃调整' )) {
					window.top.location = "http://www.bilibili.com/video/av120040/";
					return;
				} else {
					return;
				}
			}

			var adjustPlayerSizeCSS = document.querySelector('#adjustPlayerSize');
			if (adjustPlayerSizeCSS !== null) {
				document.documentElement.removeChild(document.querySelector('#adjustPlayerSize'));
			}
			var adjustPlayerMiniplayerResizable = document.querySelector('#adjust-player-miniplayer-resizable');
			if (adjustPlayerMiniplayerResizable !== null) {
				adjustPlayerMiniplayerResizable.remove();
			}
			var arcToolbarReport = document.querySelector('#arc_toolbar_report');
			if (arcToolbarReport !== null) {
				arcToolbarReport.remove();
			}

			document.querySelector('#adjust-player').setAttribute("style","visibility: hidden;");

			//tips
			var tips = document.createElement('div');
			tips.innerHTML =  commentToString(function () { /*
            <div class="info">
              <p>当前宽度：<span class="width">853</span> px</p>
              <p>当前高度：<span class="height">480</span> px</p>
			  <p>当前比例：<span class="ratio">16/9</span></p>
            </div>
            <div class="tips-text">
			  <p>调整后的大小有宽度限制，最小宽度为740像素。</p>
			  <p>调整后的大小有高度限制，最小高度为416像素。</p>
			  <p>调整后的大小在“普通模式”下会根据“播放器顶栏”、“弹幕栏”、“播放器控件”的大小自动计算出合适的尺寸。</p>
            </div>
            <div class="drag-arrow">
              <p style="color: red; font-size: 80px;">↘</p>
            </div>
            */});
			tips.id = "adjust-player-tips";
			tips.style = "width: 853px; height:480px";

			//save
			var tipsSave = document.createElement('div');
			tipsSave.innerHTML =  commentToString(function () { /*
            <div class="content">
              <p class="bold">使用帮助</p>
              <p>1.拖动右下角“外框”调整播放器大小（<span style="color: red;">↘</span> 处）。</p>
			  <p>2.当前灰色区域的大小，保存后就是播放器的新大小。</p>
              <p>3.调整到合适的大小，点击保存。</p>
              <div class="box custom-ratio">
                  <div style="text-align: left;">限制调整比例：</div>
                    <select name="customRatio" style="width:100%;margin-top: 10px;">
                        <option value="3/2">3 / 2</option>
                        <option value="4/3">4 / 3</option>
                        <option value="15/9">15 / 9</option>
						<option value="16/9" selected="selected">16 / 9</option>
						<option value="16/10">16 / 10</option>
                        <option value="18/9">18 / 9</option>
                        <option value="21/9">21 / 9</option>
                        <option value="32/9">32 / 9</option>
                     </select>
              </div>
              <div class="box custom-width">
                  <div style="text-align: left;">快速保存宽度为：</div>
                  <div class="btn b-btn" action="quickSave" customWidth="853">853px</div>
				  <div class="btn b-btn" action="quickSave" customWidth="1153">1153px</div>
                  <div class="btn b-btn" action="quickSave" customWidth="1280">1280px</div>
                  <div class="btn b-btn" action="quickSave" customWidth="1580">1580px</div>
                  <div class="btn b-btn" action="quickSave" customWidth="1920">1920px</div>
                  <div class="btn b-btn" action="quickSave" customWidth="2220">2220px</div>
              </div>
              <div class="btn b-btn" action="save" style="width:49%;float:left;" >保存</div>
              <div class="btn b-btn-cancel" action="cancel" style="width:49%;float:right;" >取消</div>
			  <div style="clear: both;"></div>
            </div>
            */});
			tipsSave.id = "adjust-player-tips-save";
			tipsSave.onclick = function (e) {
				var adjustPlayerWidth = document.querySelector('#adjust-player form input[name="adjustPlayerWidth"]');
				var adjustPlayerRatio = document.querySelector('#adjust-player form input[name="adjustPlayerRatio"]');
				var resizePlayer = document.querySelector('#adjust-player form input[name="resizePlayer"]');

				var action = e.target.getAttribute('action');
				if (e.target && action !== null) {
					var customRatio = document.querySelector('#adjust-player-tips-save select[name="customRatio"]');
					if (action === "save") {
						try {
							var minWidth = 740;
							var minHeight = 416;
							var adjustPlayerTips = document.querySelector('#adjust-player-tips');
							var width = parseInt(adjustPlayerTips.clientWidth);
							var height = parseInt(adjustPlayerTips.clientHeight);

							if(height < minHeight){
								unsafeWindow.alert('保存设置失败\n播放器高度调整后过小，最小416像素，请重新调整！');
								return;
							} else {
								if(width <= minWidth){
									width = "740px";
								} else {
									width = adjustPlayerTips.clientWidth + "px";
								}
								adjustPlayerWidth.value = width;
								adjustPlayerRatio.value = customRatio.options[customRatio.selectedIndex].value;
								resizePlayer.checked = true;
								configWindow.save();
							}
						} catch (ex) {
							unsafeWindow.alert('保存设置失败');
							location.reload();
							console.log("adjustPlayer:\n adjustPlayerSize save error\n " + ex);
						}
					} else if (action === "cancel") {
						location.reload();
					} else if (action === "quickSave") {
						var customWidth = e.target.getAttribute('customWidth');
						var height = Number(customWidth / window.adjustPlayerTipsRatio).toFixed();
						adjustPlayerWidth.value = customWidth + "px";
						adjustPlayerRatio.value =  customRatio.options[customRatio.selectedIndex].value;
						resizePlayer.checked = true;
						configWindow.save();
					}
				}
			};
			tipsSave.onchange = function (e) {
				var name = e.target.getAttribute('name');
				if (e.target && name !== null) {
					if (name === "customRatio") {
						var customRatio = e.target.value;
						var ratio = customRatio.split("/");
						ratio = ratio[0] / ratio[1];
						window.adjustPlayerTipsRatio = ratio;

						var adjustPlayerTipsRatio = document.querySelector('#adjust-player-tips .info .ratio');
						adjustPlayerTipsRatio.innerHTML = customRatio;
					}
				}
			};

			//resize
			var playerContent = document.querySelector('#bofqi');
			var oldPlayerWrapper = document.querySelector('.player-wrapper .player');
			var newPlayerWrapper = document.querySelector('.bili-wrapper .player');
			if (oldPlayerWrapper !== null) {
				oldPlayerWrapper.setAttribute("style","visibility: hidden;");
			} else {
				newPlayerWrapper.setAttribute("style","visibility: hidden;");
				document.querySelector('#__bofqi').setAttribute("style","width: auto !important; background: none !important; height: auto !important; position: relative !important;");
			}
			playerContent.style = "position: relative; width:100%; min-height: 480px; ";
			playerContent.insertBefore(tips, playerContent.firstChild);
			playerContent.insertBefore(tipsSave, playerContent.firstChild);

			var adjustPlayerTipsSave = document.querySelector('#adjust-player-tips-save');
			var adjustPlayerTipsSaveContent = document.querySelector('#adjust-player-tips-save .content');
			adjustPlayerTipsSave.setAttribute("style", "position: absolute; z-index: 100000; left: calc(100% / 2 - calc("+ adjustPlayerTipsSaveContent.clientWidth +"px / 2));");

			//resize event
			window.adjustPlayerTipsRatio = 16 / 9;
			var adjustPlayerTips = document.querySelector('#adjust-player-tips');
			var adjustPlayerTipsW = document.querySelector('#adjust-player-tips .info .width');
			var adjustPlayerTipsH = document.querySelector('#adjust-player-tips .info .height');
			var adjustPlayerTipsDragArrow = document.querySelector('#adjust-player-tips .drag-arrow');

			var resizeEvent = function callback() {
				window.setTimeout(callback, 20);
				var width = adjustPlayerTips.clientWidth;
				var height = adjustPlayerTips.clientHeight;
				var newHeight = Number(width / window.adjustPlayerTipsRatio ).toFixed();
				adjustPlayerTips.setAttribute("style","position: relative; z-index:10000; margin:0 auto; width: "+ width + "px; height:"+ newHeight +"px; min-width:740px;");
				adjustPlayerTipsW.innerHTML = width;
				adjustPlayerTipsH.innerHTML = newHeight;
				adjustPlayerTipsDragArrow.setAttribute("style", "top:calc("+ height +"px - 80px);right:20px;");
			};

			window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

			var resizeEventID ;
			resizeEventID = window.requestAnimationFrame(resizeEvent);

			//window.cancelAnimationFrame(resizeEventID);
		},
		shortcutsWindow: function (e) {
			//create
			var name = 'shortcutsSetting';
			var title = '快捷键设置';
			var bar = '<span class="btn" action="cancel">X</span>';
			var content = commentToString(function () { /*
			<p style="margin-bottom: 4px;font-size: 16px;">请在输入框内按下需要的按键设置快捷键：<span id="tips" style="text-align: left; color: #ff81aa; margin-top: 33px; right: 32px; position: absolute;"></span></p>
			<p>
			  <input type="text" name="keyName" placeholder="支持单个组合键ctrl，alt，shift" style="width: 574px;font-size: 16px;text-align: center;padding:4px 0;border: 1px solid #ccd0d7;border-radius: 4px;" >
			  <input type="hidden" name="keyCode" >
			  <input type="hidden" name="typeName" >
			</p>
			<p style="color: #99a2aa; border: 1px solid #e5e9ef;background-color: #f4f5f7; border-radius: 10px; margin: 10px 0; padding: 20px;">
			  <span style="padding: 0 10px;font-weight: bold;">* 请不要在意英文的按键名称。<br/></span>
			  <span style="padding: 0 10px;font-weight: bold;">* 请关闭输入法后设置。<br/></span>
			  <span style="padding: 0 10px;font-weight: bold;">* 默认的快捷键（已知的）有：</span><br/><span style="margin-left: 27px; display: inline-block;">空格 （播放/暂停）<br/>方向键上、下 （音量+/音量-）<br/>方向键左、右 （后退/快进） <br/>最好避开这些按键，和浏览器默认的快捷键，脚本没有阻止默认行为。</span>
			</p>
			<div class="btns" style="text-align: center;">
               <div class="btn" action="clear">清除此快捷键</div>
               <div class="btn" action="save">设置</div>
               <div class="btn btn-cancel" action="cancel">取消</div>
			</div>
			*/ });
			var isModal = e.target.offsetParent;
			dialog.create(name, title, bar, content,isModal);

			//onkeydown
			var tips = document.querySelector('#shortcutsSetting #tips');
			var kName = document.querySelector('#shortcutsSetting input[name="keyName"]');
			var kCode = document.querySelector('#shortcutsSetting input[name="keyCode"]');
			var typeName = document.querySelector('#shortcutsSetting input[name="typeName"]');
			typeName.value = e.target.getAttribute('typeName');

			function keydownEvent(event) {
				if (!event.metaKey) {
					event.preventDefault();
				}
				tips.innerHTML = "";
				var keyCode = getkeyCode(event.keyCode);
				if (typeof keyCode !== 'undefined') {
					if (event.altKey && event.shiftKey || event.ctrlKey && event.shiftKey ||  event.ctrlKey && event.altKey) {
						return;
					}
					if (event.shiftKey && event.keyCode !== 16) {
						kName.value = "shift + " + keyCode;
						kCode.value = "shift" + '+' +event.keyCode;
					} else if (event.ctrlKey && event.keyCode !== 17) {
						kName.value = "ctrl + " + keyCode;
						kCode.value = "ctrl" + '+' +event.keyCode;
					} else if (event.altKey && event.keyCode !== 18) {
						kName.value = "alt + " + keyCode;
						kCode.value = "alt" + '+' +event.keyCode;
					} else {
						kName.value = keyCode;
						kCode.value = event.keyCode;
					}
				} else {
					tips.innerHTML = "按键无法被识别";
				}
			}
			kName.addEventListener("keydown",keydownEvent, false);

			//inputFocus
			function focusEvent(event) {
				document.removeEventListener("keydown",focusEvent, false);
				kName.focus();
				keydownEvent(event);
			}
			document.addEventListener("keydown",focusEvent, false);
			//console.log(e);
		},
		shortcutsSettingClear: function () {
			var typeName = document.querySelector('#shortcutsSetting input[name="typeName"]');
			var keyName = document.querySelector('#adjust-player #main form .shortcutsGroup input[name="'+typeName.value+'KeyName"]');
			var keyCode = document.querySelector('#adjust-player #main form .shortcutsGroup input[name="'+typeName.value+'KeyCode"]');
			var type = document.querySelector('#adjust-player #main form .shortcutsGroup input[name="'+typeName.value+'"]');
			keyName.value = "";
			keyCode.value = "";
			type.checked = false;
			dialog.close(document.querySelector('#adjust-player > #shortcutsSetting'));
		},
		shortcutsSettingSave: function () {
			try {
				var tips = document.querySelector('#shortcutsSetting #tips');
				var kName = document.querySelector('#shortcutsSetting input[name="keyName"]');
				var kCode = document.querySelector('#shortcutsSetting input[name="keyCode"]');
				var typeName = document.querySelector('#shortcutsSetting input[name="typeName"]');
				var typeNameValue = document.querySelector('#adjust-player #main form .shortcutsGroup input[name="'+typeName.value+'KeyCode"]');

				if (kName.value !== "" && kCode.value !== "" && typeName.value !=="") {
					var keyCodes = document.querySelectorAll('#adjust-player #main form .shortcutsGroup input[KeyCode="true"]'), i;
					var isUsedkeyCode = false;
					for (i = 0; i < keyCodes.length; ++i) {
						if (kCode.value === keyCodes[i].value && kCode.value !== typeNameValue.value) {
							isUsedkeyCode = true;
							break;
						}
					}

					if (isUsedkeyCode) {
						tips.innerHTML = "按键冲突，已使用过的快捷键";
						kName.focus();
					} else if (kCode.value === "16" || kCode.value === "17" || kCode.value === "18") {
						tips.innerHTML = "按键不能为单个的 ctrl，alt，shift";
						kName.focus();
					} else {
						var shortcutsKeyName = document.querySelector('#adjust-player .shortcutsGroup input[name="'+typeName.value+'KeyName"]');
						var shortcutsKeyCode = document.querySelector('#adjust-player .shortcutsGroup input[name="'+typeName.value+'KeyCode"]');
						var shortcutsTypeName = document.querySelector('#adjust-player .shortcutsGroup input[name="'+typeName.value+'"]');

						shortcutsKeyName.value = kName.value;
						shortcutsKeyCode.value = kCode.value;
						shortcutsTypeName.checked = true;

						dialog.close(document.querySelector('#adjust-player > #shortcutsSetting'));
					}

				} else {
					tips.innerHTML = "按键不能为空";
					kName.focus();
				}
			} catch (ex) {
				unsafeWindow.alert('设置失败');
				console.log("shortcutsSettingSave\n " + ex);
			}
		},
		shortcutsSettingCancel: function () {
			var typeName = document.querySelector('#shortcutsSetting input[name="typeName"]');
			var keyCode = document.querySelector('#adjust-player #main form .shortcutsGroup input[name="'+typeName.value+'KeyCode"]');
			var type = document.querySelector('#adjust-player #main form .shortcutsGroup input[name="'+typeName.value+'"]');
			if (keyCode.value !== "") {
				type.checked = true;
			} else {
				type.checked = false;
			}

			dialog.close(document.querySelector('#adjust-player > #shortcutsSetting'));
		},
		storageTypeWindow: function (e) {
			var name = 'storageType';
			var title = '更改脚本数据存储类型';
			var bar = '<span class="btn" action="close">X</span>';
			var content = commentToString(function () { /*
			<p style="margin-bottom: 4px;font-size: 16px;">请选择脚本数据存储类型：<span id="tips" style="text-align: left; color: #ff81aa; margin-top: 33px; right: 22px; position: absolute;"></span></p>
			<p style="margin: 10px;font-size: 16px; text-align:center;">
			   <input type="radio" id="extension" name="storageType" value="extension" checked>
			      <label for="extension">extension（油猴扩展存储）</label>
			   <input type="radio" id="localStorage" name="storageType" value="localStorage">
			      <label for="localStorage">localStorage（浏览器存储）</label>
			</p>
			<ol style="color: #99a2aa; border: 1px solid #e5e9ef;background-color: #f4f5f7; border-radius: 10px; margin: 10px 0; padding: 20px 20px 20px 40px;">
			   <li style="list-style: decimal;"><span style="font-weight: bold;color:red;">如果没有出现“无法保存脚本数据”的情况，请无视这个设置！</span></li>
			   <li style="list-style: decimal;"><span style="font-weight: bold;">出现“无法保存脚本数据”的情况，请把“存储类型” 更改为 “localStorage（浏览器存储）”</span></li>
			   <li style="list-style: decimal;"><span style="font-weight: bold;">如果更改为 “localStorage（浏览器存储）” www.bilibili.com 和 bangumi.bilibili.com 的设置不会同步，需要手动重新设置。</span></li>
			   <li style="list-style: decimal;">使用 Greasemonkey、Tampermonkey 扩展来安装脚本的用户，一般请不要修改，请保持默认的“extension（油猴扩展存储）” 。</li>
			   <li style="list-style: decimal;">如果更改为 “localStorage（浏览器存储）” 那么删除脚本的时候，脚本设置不会被清除，想清除的话请使用浏览器的“清除浏览数据”功能来清除。</li>
			   <li style="list-style: decimal;">两种存储类型不会自动同步设置，更换存储类型后请重新设置。</li>
			</ol>
			<div class="btns" style="text-align: center;">
               <div class="btn" action="save">设置</div>
               <div class="btn btn-cancel" action="cancel">取消</div>
			</div>
			*/ });
			var isModal = e.target.parentNode.parentNode.offsetParent;
			dialog.create(name, title, bar, content,isModal);

			var setStorageTypeValue = localStorage.getItem('adjustPlayer_storageType');
			if(setStorageTypeValue !== null){
				var storageType = document.querySelectorAll('#storageType input[name="storageType"]'), i;
				for (i = 0; i < storageType.length; ++i) {
					if(storageType[i].value === setStorageTypeValue){
						storageType[i].checked = true;
						break;
					}
				}
			}
		},
		storageTypeSave: function () {
			var setStorageTypeValue = null;
			var storageType = document.querySelectorAll('#storageType input[name="storageType"]'), i;
			for (i = 0; i < storageType.length; ++i) {
				if(storageType[i].checked === true){
					setStorageTypeValue = storageType[i].value;
					break;
				}
			}
			if(setStorageTypeValue !== null){
				localStorage.setItem('adjustPlayer_storageType',setStorageTypeValue);
				var getStorageType = localStorage.getItem('adjustPlayer_storageType');
				if(getStorageType === setStorageTypeValue){
					alert("更改设置成功");
					location.reload();
				} else {
					alert("更改设置失败");
					location.reload();
				}
			}
		},
		help: function () {
			var name = 'help';
			var title = '哔哩哔哩（bilibili.com）播放器调整';
			var bar = '<span class="btn" action="close">X</span>';
			var content = commentToString(function () { /*
			<h2 style="font-weight: bold;font-size: 16px;">小提示：</h2>
			<ol style="padding: 0 0 0 20px;margin:10px 0;">
			   <li style="list-style: disc;"><span style="font-weight: bold;">建议开启“HTML5 播放器”。</span></li>
			   <li style="list-style: disc;">播放器调整设置窗口在播放器右侧。</li>
			   <li style="list-style: disc;">播放器调整设置窗口中，鼠标移动到<span style="font-size: 12px; color: #00a1d6; cursor: pointer;margin:0 10px;"tooltip="查看帮助">[?]</span>上，查看此功能的使用帮助。</li>
			   <li style="list-style: disc;">播放器调整设置窗口中，灰色项表示当前功能不可用，需要开启“HTML5播放器”才能使用。</li>
			</ol>
			<h2 style="font-weight: bold;font-size: 16px;">开启“HTML5播放器”步骤：</h2>
			<ol style="padding: 0 0 0 20px;margin:10px 0;">
			   <li style="list-style: decimal;">打开<a href="http://www.bilibili.com/html/help.html#p" rel="nofollow">http://www.bilibili.com/html/help.html#p</a></li>
			   <li style="list-style: decimal;">选择→【试用点我】←开启HTML5播放器试用</li>
			</ol>
			<div class="btns" style="text-align: center;"><div class="btn" action="close">关闭</div></div>
			*/ });
			dialog.create(name, title, bar, content);
		},
		tipsAutoFullScreen: function () {
			var name = 'tipsAutoFullScreen';
			var title = '半自动全屏功能提示';
			var bar = '';
			var content = commentToString(function () { /*
			<p>1. 因为浏览器有限制无法使用脚本模拟自动全屏，需要手动按下 F11 键全屏。</p>
			<p>2. 退出全屏需要手动按 F11 键，再次按 Esc 键退出网页全屏。</p>
			<p>3. 建议搭配“自动播放下一个视频”功能使用。</p>
			<div class="btns" style="text-align: center;">
			   <div class="btn" action="notTips">不再提示</div>
			</div>
			*/ });
			dialog.create(name, title, bar, content);
		},
		tipsAutoFullScreenEvent: function (name) {
			config.setValue('player_tips_autoFullScreen', false);
			dialog.close(document.querySelector('#adjust-player > #' + name));
		},
		init: function () {
			configWindow.create();
			if (typeof GM_getValue === 'function') {
				var formData = config.read();
				configWindow.load(formData);
			} else {
				var formData = config.read();
				formData.then(function(value){
					configWindow.load(value);
				});
			}
		}
	};
	function addStyle() {
		try{
			var css = commentToString(function () { /*
          .adjust-player-mask { display: none; position: fixed; top: 0; left: 0; z-index: 100001; width: 100%; height: 100%; background: #000; opacity: .6; filter: alpha(opacity=60) }
          #adjust-player .title { font-size: 16px; color: #222; text-align: center; font-weight: bold; margin-bottom: 20px }
          #adjust-player .dialog { position: fixed; z-index: 100002; top: 50%; margin-top: -280px; left: 50%; width: 580px; margin-left: -320px; padding: 20px; background-color: rgb(255, 255, 255); border-radius: 6px; box-shadow: 1px 1px 40px 0px rgba(0, 0, 0, 0.6); display: block; font-size: 14px; line-height: 26px }
          #adjust-player .title span { font-size: 12px; color: #fff; background-color: #00a1d6; display: inline-block; width: 22px; height: 22px; position: absolute; right: 25px; border-radius: 50%; line-height: 22px; transition: .1s; transition-property: background-color; margin-top: 2px }
          #adjust-player .title span:hover { background-color: #00b5e5; cursor: pointer }
          #adjust-player .title [action="help"] { right: 52px }
          #adjust-player fieldset { border: 1px solid #e5e9ef; border-radius: 4px; padding: 0 6px 6px; background-color: #f4f5f7; margin-bottom: 10px }
          #adjust-player legend { font-weight: bold; font-size: 14px; margin-left: 10px; border: 1px solid #e5e9ef; background-color: #fff; padding: 0 10px; border-radius: 4px }
          #adjust-player legend label span { color: #6d757a; font-size: 12px }
          #adjust-player input, #adjust-player select { margin: 0px 2px }
          #adjust-player input[type="number"] { padding: 1px 0 }
          #adjust-player input[readOnly="true"] { color: #99a2aa; width: 80px; max-width: 80px; border: 0px; background: #f4f5f7 }
          #adjust-player select { height: 23px }
          #adjust-player .block { padding: 5px 0 }
          #adjust-player .block .bold { font-weight: bold }
          #adjust-player .block label { display: block; margin-left: 7px }
          #adjust-player .tipsButton { font-size: 12px; color: #00a1d6; cursor: pointer; padding: 0 2px }
          #adjust-player .left { float: left }
          #adjust-player .right { float: right }
          #adjust-player .left, #adjust-player .right { width: 48%; vertical-align: top }
          #adjust-player .shortcutsItem { max-width: 200px }
          #adjust-player .info { position: absolute; bottom: 20px; border: 1px solid #e5e9ef; border-radius: 20px; padding: 0 10px }
          #adjust-player .info .ver { font-weight: bold; padding-right: 5px; color: #6d757a }
          #adjust-player a { outline: 0; color: #00a1d6; text-decoration: none; cursor: pointer }
          #adjust-player .btns { text-align: right; width: 100%; display: inline-block }
          #adjust-player .btn { margin: 10px 0px 0px 10px; width: 100px; height: 28px; line-height: 28px; font-size: 14px; display: inline-block; color: #fff; cursor: pointer; text-align: center; border-radius: 4px; background-color: #00a1d6; vertical-align: middle; border: 1px solid #00a1d6; transition: .1s; transition-property: background-color, border, color; user-select: none }
          #adjust-player .btn:hover { color: #fff; background: #00b5e5; border-color: #00b5e5 }
          #adjust-player .btn-cancel { display: inline-block; text-align: center; cursor: pointer; color: #222; border: 1px solid #ccd0d7; background-color: #fff; border-radius: 4px; transition: .1s; transition-property: background-color, border, color }
          #adjust-player .btn-cancel:hover { color: #00a1d6; border-color: #00a1d6; background: #fff }
          #adjust-player .h5 { color: #ccc }
          #adjust-player form .wrapper { overflow-x: hidden; white-space: nowrap }
          #adjust-player .modalWindow { z-index: 100000 }
          #adjust-player .shortcutsItem.disabled > label { color: #ccc !important }
          #adjust-player-tips { width: 100%; height: 100%; line-height: 16px; color: #333; overflow: auto; resize: horizontal; background: linear-gradient(135deg,#E6E7E8 0,#E6E7E8 99%,#fff 95%); }
          #adjust-player-tips p,#adjust-player-tips-save p { text-align: left }
          #adjust-player-tips-save .content { position: absolute; top:20px; width: 485px; font-size: 16px; line-height: 24px; padding: 20px; background: #fff; border: 1px solid #eee; border-radius: 4px;z-index:1; }
          #adjust-player-tips-save .content .bold { font-weight: bold; font-size: 18px; text-align: center; color: #333; padding-bottom: 18px }
          #adjust-player-tips-save .content .btn { display: inline-block; margin-top: 10px; padding: 4px 0; width: 120px; color: #fff; cursor: pointer; text-align: center; border-radius: 4px; background-color: #00a1d6; vertical-align: middle; border: 1px solid #00a1d6; transition: .1s; transition-property: background-color, border, color; -webkit-touch-callout: none; -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none }
          #adjust-player-tips-save .content .btn:hover { background-color: #00b5e5; border-color: #00b5e5 }
          #adjust-player-tips-save .content .btn.b-btn-cancel { text-align: center; cursor: pointer; color: #222; border: 1px solid #ccd0d7; background-color: #fff; border-radius: 4px; transition: .1s; transition-property: background-color, border, color }
          #adjust-player-tips-save .content .btn.b-btn-cancel:hover { color: #00a1d6; border-color: #00a1d6 }
          #adjust-player-tips-save .content .btns { margin-top: 10px }
          #adjust-player-tips-save .box  { margin:10px 0; padding:10px; color: #222; border-radius: 4px; border: 1px solid #ccd0d7; }
          #adjust-player-tips-save .custom-width .btn { display: inline-block; width: auto; padding:0 10px; }
          #adjust-player-tips .info { position: relative; top: 10px; margin-left: 10px; font-weight: bold;z-index:10; }
          #adjust-player-tips .info span { color: #333; font-size: 12px; color: #fb7299 }
          #adjust-player-tips .tips-text { position: absolute; bottom: 10px; margin-left: 10px; color: #99a2aa; }
          #adjust-player-tips .drag-arrow { position: absolute; right: 0; }
          .bgray-btn { height: auto !important; margin: 10px 0px 0px 10px !important }
          .video-box-module .bili-wrapper .bgray-btn-wrap, .player-wrapper .bangumi-player .bgray-btn-wrap { top: -10px !important }
          .video-toolbar-module { width: 1160px !important; margin: 0 auto; margin-top: 20px }
          #app .player-box { padding: 20px 0 }
          #bofqi.heimu { box-shadow: none !important }
          @media screen and (max-width:1400px) {
               .video-toolbar-module { width: 980px !important }
          }
        */});
			var node = document.createElement('style');
			node.type = 'text/css';
			node.id = 'adjustPlayerMainCss';
			node.appendChild(document.createTextNode(css));
			document.body.appendChild(node);
			//创建设置窗口容器
			var adjustPlayer = document.createElement('div');
			adjustPlayer.id = 'adjust-player';
			document.body.appendChild(adjustPlayer);
			//遮罩层
			var adjustPlayerMask = document.createElement('div');
			adjustPlayerMask.className = 'adjust-player-mask';
			document.querySelector('#adjust-player').appendChild(adjustPlayerMask);
			//修复新番剧页面，设置界面不显示input控件
			if (matchURL.isNewBangumi()) {
				if (document.querySelector('#adjustPlayerFixNewBangumi') === null ) {
					var css = [
						'#adjust-player input[type="checkbox"] { -webkit-appearance: checkbox !important; -moz-appearance: checkbox !important; appearance: checkbox !important; }',
						'#adjust-player input[type="number"] { -webkit-appearance: textfield !important; -moz-appearance: menulist !important; appearance: textfield !important; }',
						'#adjust-player input[type="radio"] { -webkit-appearance: radio !important; -moz-appearance: radio !important; appearance: radio !important; }',
						'#adjust-player select { -webkit-appearance: menulist !important; -moz-appearance: menulist !important; appearance: menulist !important; }',
					];
					var node = document.createElement('style');
					node.type = 'text/css';
					node.id = 'adjustPlayerFixNewBangumi';
					node.appendChild(document.createTextNode(css.join('')));
					document.documentElement.appendChild(node);
				}
			}
		} catch (e) {
			console.log('addStyle：'+e);
		}
	}
	function createConfigBtn() {
		var isExist = document.querySelector('#adjust-player');
		if (isExist === null) {
			//添加设置窗口样式并创建容器
			addStyle();
			//创建设置按钮
			var configButton = document.createElement('div');
			configButton.id = 'adjust-player-config-btn';
			configButton.className = 'bgray-btn show';
			configButton.setAttribute("style","display: block;");
			configButton.innerHTML = '播放器调整';
			configButton.onclick = function () {
				configWindow.init();
			};
			var bgrayBtnWrap = document.querySelector('div.bgray-btn-wrap');
			bgrayBtnWrap.setAttribute("style","display: block;");
			bgrayBtnWrap.appendChild(configButton);
		}
	}
	var matchURL = {
		isVideoAV : function () {
			if (location.href.match(/video\/av\d*/g) !== null) { return true; } else { return false; }
		},
		isOldBangumi : function () {
			if (location.hostname === 'bangumi.bilibili.com') { return true; } else { return false; }
		},
		isWatchlater : function () {
			if (location.href.match(/watchlater\/#\/av\d*\/p\d*/g) !== null) { return true; } else { return false; }
		},
		isBangumiMovie : function() {
			if (location.href.match(/bangumi.bilibili.com\/movie\/\d*/g) !== null) { return true; } else { return false; }
		},
		isNewBangumi : function() {
			if (location.href.match(/bangumi\/play\/(ep|ss)\d*/g) !== null ) { return true; } else { return false; }
		}
	};
	function isBangumi(obj) {
		var iframePlayer = document.querySelector('iframe.bilibiliHtml5Player');
		if (matchURL.isOldBangumi() || matchURL.isNewBangumi() ) {
			if (iframePlayer !== null ) {
				return iframePlayer.contentWindow.document.body.querySelector(obj);
			} else {
				return document.querySelector(obj);
			}
		} else {
			return document.querySelector(obj);
		}
	}
	function isPlayer() {
		var flashPlayer = isBangumi('#bofqi object');
		var html5Player = isBangumi('.bilibili-player-video video');
		if (flashPlayer !== null) {
			return "flashPlayer";
		} else if (html5Player !== null) {
			return "html5Player";
		} else {
			return "unknownPlayer";
		}
	}
	function doClick(obj) {
		if (obj !== null) {
			if (obj.click) {
				obj.click();
			} else {
				var evt = document.createEvent('Event');
				evt.initEvent('click', true, true);
				obj.dispatchEvent(evt);
			}
		}
	}
	function contextMenuClick(element) {
		var ev;
		if (document.createEvent) {
			ev = new MouseEvent("contextmenu", {
				screenX: 0,
				screenY: 0,
				clientX: element.offsetLeft,
				clientY: element.offsetTop + element.offsetHeight,
				button: 2
			});
			element.dispatchEvent(ev);
		} else {
			ev = document.createEventObject();
			ev.screenX = 0;
			ev.screenY = 0;
			ev.clientX = element.offsetLeft;
			ev.clientY = element.offsetTop + element.offsetHeight;
			ev.button = 2;
			document.fireEvent('contextmenu', ev);
		}
	};
	function commentToString(f) {
		var s = f.toString().replace(/^[\s\S]*\/\*.*/, '').replace(/.*\*\/[\s\S]*$/, '').replace(/\r\n|\r|\n/g, '\n');
		return s;
	}
	function serialize(e){if(e&&"FORM"===e.nodeName){var t,s,n,l={},a=[];var list={};for(t=e.elements.length-1;t>=0;t-=1){if(""!==e.elements[t].name){var listName=e.elements[t].getAttribute("list");switch(e.elements[t].nodeName){case"INPUT":switch(e.elements[t].type){case"hidden":case"text":case"password":case"number":if(listName!==null){if(typeof e.elements[t].name!=="undefined"&&e.elements[t].value!==""){list[e.elements[t].name]=e.elements[t].value}break}l[e.elements[t].name]=e.elements[t].value;break;case"checkbox":case"radio":if(listName!==null){if(typeof e.elements[t].name!=="undefined"&&e.elements[t].value!==""){e.elements[t].checked&&(n="on"===e.elements[t].value?n=!0:field.value,list[e.elements[t].name]=n);l[listName]=list}break}e.elements[t].checked&&(n="on"===e.elements[t].value?n=!0:field.value,l[e.elements[t].name]=n)}break;case"TEXTAREA":if(listName!==null){if(typeof e.elements[t].name!=="undefined"&&e.elements[t].value!==""){list[e.elements[t].name]=e.elements[t].value}break}l[e.elements[t].name]=e.elements[t].value;break;case"SELECT":switch(e.elements[t].type){case"select-one":if(listName!==null){if(typeof e.elements[t].name!=="undefined"&&e.elements[t].value!==""){list[e.elements[t].name]=e.elements[t].value}break}l[e.elements[t].name]=e.elements[t].value;break;case"select-multiple":if(listName!==null){if(typeof e.elements[t].name!=="undefined"&&e.elements[t].value!==""){for(s=e.elements[t].options.length-1;s>=0;s-=1){e.elements[t].options[s].selected&&a.push(e.elements[t].options[s].value)}list[e.elements[t].name]=a.join()}break}for(s=e.elements[t].options.length-1;s>=0;s-=1){e.elements[t].options[s].selected&&a.push(e.elements[t].options[s].value)}l[e.elements[t].name]=a.join()}}}}return JSON.parse(JSON.stringify(l))}};
	function deserialize(e,t){if(e&&"FORM"===e.nodeName){var s,n,l,a,c,m=[];var isList;for(l in t){for(s=e.elements.length-1;s>=0;s-=1){if(e.elements[s].name===l||e.elements[s].getAttribute("list")===l){if(""===e.elements[s].name){continue}if(l===e.elements[s].getAttribute("list")){var list=t[l][e.elements[s].name];if(typeof list!=="undefined"){isList=t[l][e.elements[s].name]}else{isList=""}}else{isList=t[l]}switch(e.elements[s].nodeName){case"INPUT":switch(e.elements[s].type){case"hidden":case"text":case"password":case"number":e.elements[s].setAttribute("value",isList);break;case"checkbox":case"radio":!0===isList&&e.elements[s].setAttribute("checked","true")}break;case"TEXTAREA":e.elements[s].setAttribute("value",isList);break;case"SELECT":switch(e.elements[s].type){case"select-one":for(n=e.elements[s].options.length-1;n>=0;n-=1){c=e.elements[s].options[n],c.value===isList.toString()&&c.setAttribute("selected","true")}break;case"select-multiple":for(m=t[l].split(","),a=m.length-1;a>=0;a-=1){for(n=e.elements[s].options.length-1;n>=0;n-=1){c=e.elements[s].options[n],c.value===isList[m[a]].toString()&&c.setAttribute("selected","true")}}}}}}}}};
	function getkeyCode(k){var keyCodes={3:"break",8:"backspace / delete",9:"tab",12:"clear",13:"enter",16:"shift",17:"ctrl",18:"alt",19:"pause/break",20:"caps lock",27:"escape",28:"conversion",29:"non-conversion",32:"spacebar",33:"page up",34:"page down",35:"end",36:"home ",37:"left arrow ",38:"up arrow ",39:"right arrow",40:"down arrow ",41:"select",42:"print",43:"execute",44:"Print Screen",45:"insert ",46:"delete",48:"0",49:"1",50:"2",51:"3",52:"4",53:"5",54:"6",55:"7",56:"8",57:"9",58:":",59:"semicolon (firefox), equals",60:"<",61:"equals (firefox)",63:"?",64:"@ (firefox)",65:"a",66:"b",67:"c",68:"d",69:"e",70:"f",71:"g",72:"h",73:"i",74:"j",75:"k",76:"l",77:"m",78:"n",79:"o",80:"p",81:"q",82:"r",83:"s",84:"t",85:"u",86:"v",87:"w",88:"x",89:"y",90:"z",91:"Windows Key / Left ? / Chromebook Search key",92:"right window key ",93:"Windows Menu / Right ?",96:"numpad 0 ",97:"numpad 1 ",98:"numpad 2 ",99:"numpad 3 ",100:"numpad 4 ",101:"numpad 5 ",102:"numpad 6 ",103:"numpad 7 ",104:"numpad 8 ",105:"numpad 9 ",106:"multiply ",107:"add",108:"numpad period (firefox)",109:"subtract ",110:"decimal point",111:"divide ",112:"f1 ",113:"f2 ",114:"f3 ",115:"f4 ",116:"f5 ",117:"f6 ",118:"f7 ",119:"f8 ",120:"f9 ",121:"f10",122:"f11",123:"f12",124:"f13",125:"f14",126:"f15",127:"f16",128:"f17",129:"f18",130:"f19",131:"f20",132:"f21",133:"f22",134:"f23",135:"f24",144:"num lock ",145:"scroll lock",160:"^",161:"!",163:"#",164:"$",165:"ù",166:"page backward",167:"page forward",169:"closing paren (AZERTY)",170:"*",171:"~ + * key",173:"minus (firefox), mute/unmute",174:"decrease volume level",175:"increase volume level",176:"next",177:"previous",178:"stop",179:"play/pause",180:"e-mail",181:"mute/unmute (firefox)",182:"decrease volume level (firefox)",183:"increase volume level (firefox)",186:"semi-colon / ?",187:"equal sign ",188:"comma",189:"dash ",190:"period ",191:"forward slash / ?",192:"grave accent / ? / ?",193:"?, / or °",194:"numpad period (chrome)",219:"open bracket ",220:"back slash ",221:"close bracket / ?",222:"single quote / ?",223:"`",224:"left or right ? key (firefox)",225:"altgr",226:"< /git >",230:"GNOME Compose Key",231:"?",233:"XF86Forward",234:"XF86Back",240:"alphanumeric",242:"hiragana/katakana",243:"half-width/full-width",244:"kanji",255:"toggle touchpad"};return keyCodes[k]}; // keycodes https://github.com/wesbos/keycodes/blob/gh-pages/scripts.js
	function init(){
		if (typeof GM_getValue === 'function') {
			var firstrun = config.getValue('player_firstrun',true);
			var setting = config.read();
			adjustPlayer.init(firstrun,setting);
		} else {
			var firstrun = config.getValue('player_firstrun',true);
			var setting = config.read();
			Promise.all([firstrun, setting]).then(function(values){
				adjustPlayer.init(values[0],values[1]);
			});
		}
	}
	init();
}) ();
