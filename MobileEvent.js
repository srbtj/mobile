/**
 *  事件处理类
 * **/
var EventHandler = {
    /**
     *
     * @param ele  添加事件的元素
     * @param type 事件类型
     * @param callback 回调
     */
    addHandler : function(ele,type,callback){

        if(ele.addEventListener){

            ele.addEventListener(type,callback,false);
        }else if(ele.attachEvent){

            ele.attachEvent('on' + type,callback);
        }else{

            ele['on'+type] = callback;
        }
    },
    removeHandler : function(ele,type,callback){

        if(ele.removeEventListener){

            ele.removeEventListener(type,callback,false);
        }else if(ele.detachEvent){

            ele.detachEvent('on' + type,callback);
        }else{
            ele['on' + type] = callback;
        }
    },
    getEvent : function(e){

        return e || window.event;
    }
};

/**
 *  设置 css 类
 * */
var CssHandler = {
    css : function(ele,attr,val){
        /**
         *  设置元素样式值
         *      css3 中 transform 的样式值 如果通过 currentStyle 或 getComputedStyle 获取时,
         *          返回的是 Matrix 矩阵
         * */
        val = parseFloat(val);
        if(attr === 'scale' || attr === 'scaleX' || attr === 'scaleY' || attr === 'scaleZ' ||
            attr === 'rotate' || attr === 'rotateX' || attr === 'rotateY' || attr === 'rotateZ' ||
            attr === 'translate' || attr === 'translateX' || attr === 'translateY' || attr === 'translateZ'
        ){

            return isNaN(val) ? this.setCss(ele,attr) : this.setCss(ele,attr,val);
        }

        if(arguments.length == 2){
            var val = this.getStyle(ele,attr);
            if(attr === 'opacity'){
                val = Math.round(val * 100);
            }
            return val;
        }else{
            switch (attr){
            /****
             * 只能为正值的属性
             */
                case 'width':
                case 'height':
                case 'paddingLeft':
                case 'paddingRight':
                case 'paddingTop':
                case 'paddingBottom':
                case 'borderLeft':
                case 'borderRight':
                case 'borderTop':
                case 'borderBottom':
                    val < 0 ? 0 : val;
                    ele.style[attr] = val + 'px';
                    break;
            /**
             * 正负值都可以的
             */
                case 'left':
                case 'top':
                case 'marginLeft':
                case 'marginRight':
                case 'marginTop':
                case 'marginBottom':
                    ele.style[attr] = val + 'px';
                    break;
            /***
             *  设置元素的透明度
             */
                case 'opacity':
                    if(val >=0 && val <=1){
                        val = val*100;
                    }
                    ele.style.filter = 'alpha(opacity:'+val+')';
                    ele.style.opacity = val / 100;
                    break;
            /***
             * 其它的情况
             */

                default :
                    ele.style[attr] = val;
                    break;
            }
        }
    },
    setCss : function(ele,attr,val){

        var obj = ele['$transform'] ? ele['$transform'] : ele['$transform'] = {};
        /***
         *  获取属性对应的值
         */
        if(arguments.length == 2){
            var val = obj[attr];
            if(!val){
                val = 0;
                obj[attr] = val;
            }
            return val;
        }else{
            var str = '';
            /** 保存当前属性的值 **/
            obj[attr] = val;
            /** 设置属性对应的值 **/
            for(var a in obj){

                switch(a){ /** transform : rotate(30deg)**/
                    case 'rotate':
                    case 'rotateX':
                    case 'rotateY':
                    case 'rotateZ':
                        str = a + '(' + obj[a] + 'deg)';
                        break;

                    case 'translate':
                    case 'translateX':
                    case 'translateY':
                    case 'translateZ':
                        str = a + '(' + obj[a] + 'px)';
                        break;

                    case 'scale':
                    case 'scaleX':
                    case 'scaleY':
                    case 'scaleZ':
                        str = a + '(' + obj[a] + ')';
                        break;
                }

                ele.style.WebkitTransform = ele.style.MozTransform = ele.msTransform = ele.style.transform = str;
            }
        }
    },
    getStyle : function(obj,attr){
        return obj.currentStyle ? obj.currentStyle[attr] : getComputedStyle(obj,null)[attr];
    }
};


function MobileEvent(obj){
    var root = this;
    root.obj = obj;
    /** 为元素绑定相应的事件 **/
    for(var i=0;i<this.obj.length;i++){
        root.obj[i].startTouch = { x : 0, y : 0};
        root.obj[i].isMove = false;
        root.obj[i].index = i;
        EventHandler.addHandler(this.obj[i],'touchstart',function(e){
            root.touchStart(e,this.index);
        });
        EventHandler.addHandler(this.obj[i],'touchmove',function(e){
           this.isMove = true;
        });
        EventHandler.addHandler(this.obj[i],'touchend',function(e){
            root.touchEnd(e,this.index);
        })
    }
    this.initial();
};

MobileEvent.prototype = {
    constructor : MobileEvent,
    initial : function(){
        this.$html = document.querySelector('html');
        this.bindEvents();
    },
    bindEvents : function(){
        this.setHtmlSize();
        this.preventMouseMoveEvent();
        this.orientationChange();
        this.onResize();
        //this.setMetaVal();
    },
    /**
     *  设置 html 字体大小
     */
    setHtmlSize : function(){
        var width = this.$html.getBoundingClientRect().width;
        /** 暂时默认设计图尺寸为 640px **/
        this.$html.style.fontSize = width / 16 + 'px';
    },
    /***
     *  阻止事件默认行为
     */
    preventMouseMoveEvent : function(){
        document.addEventListener('touchmove',function(e){
            e.preventDefault();
        },false);
    },
    setMetaVal : function(){
        var pixel = window.devicePixelRatio;
        var iScale = 1 / pixel;
        var str = '<meta name="viewport" content="width=device-width,initial-scale='+iScale+', maximum-scale='+iScale+', user-scalable=no">';
        document.querySelector('head').innerHTML += str;
        //document.write('<meta name="viewport" content="width=device-width,initial-scale='+iScale+', maximum-scale='+iScale+', user-scalable=no">');
    },
    /** 横竖屏切换事件 */
    orientationChange : function(){
        var _this = this;
        EventHandler.addHandler(window,'orientationchange',function(){
            _this.setHtmlSize();
        });
    },
    /** 改变屏幕分辨率时 **/
    onResize : function(){
        var _this = this;
        EventHandler.addHandler(window,'resize',function(){
            _this.setHtmlSize();
        })
    },
    touchStart : function(e,index){
        var target = e.changedTouches[0];
        /** 获取点击时位置 **/
        this.obj[index].startTouch = {
            x : target.pageX,
            y : target.pageY
        };
        this.obj[index].isMove = false;
    },
    touchEnd : function(e,index){
        /** 获取差值 **/
        var target = e.changedTouches[0];
        var disX = target.pageX - this.obj[index].startTouch.x,
            disY = target.pageY - this.obj[index].startTouch.y;

        if(disX != 0 || disY != 0){

            /** 移动事件**/
            if(this.swipe){
                this.swipe.call(this.obj[index]);
            }
            /** 左移 **/
            if(disX < -10 && this.swipeRight){
                this.swipeRight.call(this.obj[index]);
            }
            /** 右移 **/
            if(disX > 10 && this.swipeLeft){
                this.swipeLeft.call(this.obj[index]);
            }
            /** 上移 **/
            if(disY < -10 && this.swipeTop){
                this.swipeTop.call(this.obj[index]);
            }
            /** 下移 **/
            if(disY > 10 && this.swipeBottom){
                this.swipeBottom.call(this.obj[index]);
            }
        }
        /** 用户点击事件 **/
        if(!this.obj[index].isMove && this.tap){
            this.tap.call(this.obj[index]);
        }
    },
    tap : function(fn){
        this.tap = fn;
    },
    swipe : function(fn){
        this.swipe = fn;
    },
    swipeRight : function(fn){
        this.swipeRight = fn;
    },
    swipeLeft : function(fn){
        this.swipeLeft = fn;
    },
    swipeTop : function(fn){
        this.swipeTop = fn;
    },
    swipeBottom : function(fn){
        this.swipeBottom = fn;
    }
};


/***
 *  根据不同的设置尺寸,设置 html 大小
 */
var htmlSize = {
    "480" : function(obj,width){
        return obj.style.fontSize = width / 16 + 'px';
    },
    "640" : function(obj,width){
        return obj.style.fontSize = width / 16 + 'px';
    },
    "750" : function(obj,width){
        return obj.style.fontSize = width / 15 + 'px';
    }
};


//new MobileEvent();

///** 外界访问的接口 */
function mobile(obj){

    var result;
    if(typeof obj === 'string'){
        result = document.querySelectorAll(obj);
    }

    if(typeof result.length === 'number'){

        return new MobileEvent(result);
    }

    return new MobileEvent([result]);
}