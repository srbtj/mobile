function MobileEvent(){
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
        if(attr === 'scale' || attr === 'scaleX' || attr === 'scaleY' || attr === 'scaleZ' ||
           attr === 'rotate' || attr === 'rotateX' || attr === 'rotateY' || attr === 'rotateZ' ||
           attr === 'translate' || attr === 'translateX' || attr === 'translateY' || attr === 'translateZ'
        ){
            return this.setCss(ele,attr,val);
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

new MobileEvent();