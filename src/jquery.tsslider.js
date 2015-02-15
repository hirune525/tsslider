
(function($){
  'use strict';

  var tsslider, slider;

  tsslider = function(options){
    var defaults, setting;

    defaults = {
      width        : 550,   // slider width
      height       : 400,   // slider height
      imageWidth   : 550,   // image width
      imageHeight  : 400,   // image height
      speed        : 300,   // slide speed
      func         : null
    }

    setting = $.extend(defaults, options);

    slider.initModule(this, setting);

    return this;
  }

  slider = (function() {
    var settingMap,
        stateMap = {
          count      : 0,
          animating  : false, // スライドアニメーションの状態
          touchPoint : null   // タッチしたX座標
        },
        jqueryMap = {
          $container  : null,
          $sliders    : null
        },
        initStyle,
        initSlide,
        initModule,
        next, prev,
        moveSlide,
        touchStartHandler, 
        touchMoveHandler, 
        touchEndHandler,
        clickHandler;

    initStyle = function(){

      // container style
      jqueryMap.$container.css({
        'position' : 'relative',
        'width'    : settingMap.width,
        'height'   : settingMap.height,
        'overflow' : 'hidden'   // コンテナをはみ出した部分は非表示
      });

      // slide container style
      // prepare area for each slide plus two　slide  
      jqueryMap.$sliders.css({
        'position'     : 'absolute',
        'top'          : 0,
        'left'         : 0,
        'width'        : settingMap.imageWidth * (stateMap.count + 2),
        'margin-left'  : -settingMap.imageWidth   // スライドの次要素を隠す
      });

      // slide style
      jqueryMap.$sliders.find('.ts-slide').each(function(idx, elem){
        $(elem).css({
          'position' : 'relative',
          'width'    : settingMap.imageWidth,
          'height'   : settingMap.imageHeight,
          'float'    : 'left'
        });
      });

      // image style
      jqueryMap.$sliders.find('ts-image').each(function(idx, elem){
        $(elem).css({
          'width'  : settingMap.imageWidth,
          'height' : settingMap.imageHeight
        });
      });
      
    }

    /*
     * スライドの初期化
     * 一番前の要素を一番最後に追加
     * 一番後ろの要素を一番前に追加
     */
    initSlide = function(){
      var firstSlide, lastSlide;

      firstSlide = jqueryMap.$sliders.find('.ts-slide:first-child').clone(true);
      lastSlide  = jqueryMap.$sliders.find('.ts-slide:last-child').clone(true);

      jqueryMap.$sliders.prepend(lastSlide);
      jqueryMap.$sliders.append(firstSlide);

      jqueryMap.$sliders.find('.ts-slide').each(function(idx,elem){
        $(elem).on('dragstart',function(){return false;});
      });

    }

    next = function() {
      moveSlide('positive');
    }

    prev = function() {
      moveSlide('negative');
    }

    moveSlide = function(directive) {
      var d1, d2;

      if (stateMap.animating) { return false; }

      stateMap.animating = true;

      d1 = directive === 'negative' ? '+' : '-';
      d2 = directive === 'negative' ? '-' : '+';

      jqueryMap
        .$sliders
        .stop(true,false)
        .animate(
          {
            'left' : d1 + "=" + settingMap.imageWidth,
          }, 
          settingMap.speed,
          function(){
            if ( directive === 'negative' ){
              jqueryMap.$sliders.find('.ts-slide:last-child').remove();
              jqueryMap.$sliders.prepend(
                  jqueryMap.$sliders.find('.ts-slide:nth-last-child(2)').clone(true)
              );
            } else {
              jqueryMap.$sliders.find('.ts-slide:first-child').remove();
              jqueryMap.$sliders.append(
                  jqueryMap.$sliders.find('.ts-slide:nth-child(2)').clone(true)
              );
            }
            jqueryMap.$sliders.css({'left': d2 + "=" + settingMap.imageWidth})

            stateMap.animating = false;

            if ( settingMap.func ) {
              settingMap.func(jqueryMap.$sliders.find('.ts-slide:nth-child(2)'));
            }

          }
        );

      return false;
    }

    clickHandler = function(evt) {
      var clickPoint = evt.pageX - jqueryMap.$container.offset().left,
          containerCenter  = settingMap.width / 2;
      if (containerCenter > clickPoint) {
        prev();
      }
      else {
        next();
      }
    }

    touchStartHandler = function(evt) {
      stateMap.touchPoint = evt.pageX;
      return true;
    }

    touchMoveHandler = function(evt) {
      var presentX;

      if (!stateMap.touchPoint) return true;
      
      evt.preventDefault();
      presentX = evt.pageX;

      if (stateMap.touchPoint < presentX ) {
        prev();
      }
      else if (stateMap.touchPoint > presentX ) {
        next();
      }

      stateMap.touchPoint = presentX;

      return true;
    }

    touchEndHandler = function(evt) {
      stateMap.touchPoint = null;
      return true;
    }

    initModule = function($container, setting) {
      
      // Setting
      settingMap = setting;

      // Setting jQuery Object
      jqueryMap.$container  = $container;
      jqueryMap.$sliders    = $container.find('.ts-sliders');

      // Setting State
      stateMap.count = jqueryMap.$sliders.find('.ts-slide').length;

      // initialize style
      initStyle();

      // initialize slide
      initSlide();

      // add event
      var supportTouch = 'ontouchend' in document;
      var _TOUCHSTART = supportTouch ? 'touchstart' : 'mousedown';
      var _TOUCHMOVE = supportTouch ? 'touchmove' : 'mousemove';
      var _TOUCHEND = supportTouch ? 'touchend' : 'mouseup';
      
      // touch event
      jqueryMap.$container.on(_TOUCHSTART, touchStartHandler);
      jqueryMap.$container.on(_TOUCHMOVE, touchMoveHandler);
      jqueryMap.$container.on(_TOUCHEND, touchEndHandler);
      jqueryMap.$container.on('mouseout', touchEndHandler);

      // click event
      jqueryMap.$container.on('click', clickHandler);

    }

    return {
      initModule : initModule,
    }

  }());

  $.fn.tsslider = tsslider;

})(jQuery);


