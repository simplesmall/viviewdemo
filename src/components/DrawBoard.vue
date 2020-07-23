<template>
  <!--编辑截图界面-->
  <div class="drawBoard">
    <input type="button" value="填入背景图" @click="setBackgroundImg(dataURL)">
    <div class="msgProfile">
      <div style="font-size:18px;display: inline-flex;align-items: center">图片编辑</div>
    </div>

    <div id="canvas1">
      <canvas id="canvas" width="680" height="700"></canvas>
    </div>
    <!--作为SVG的存放载体而存在-->
    <div id="tempCan" style="display: none"></div>
    <div class="block">
      <span class="demonstration">画笔粗细</span>
      <el-slider v-model="penSize" :min="1" :max="10"></el-slider>
    </div>
    <!--编辑工具-->
    <div id="editUtils">
      <el-color-picker class="mt-15" v-model="primaryColor" circle
                       @change="onChangeColor">
      </el-color-picker>
      <i class="el-icon-edit-outline tooltip" @click="text"><span class="tooltiptext">文字输入</span></i>
      <el-dropdown trigger="click">
        <span class="el-dropdown-link">
            <i class="el-icon-more"></i>
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item icon="el-icon-s-order" @click.native="arrow">箭头</el-dropdown-item>
          <el-dropdown-item icon="el-icon-minus" @click.native="line">直线</el-dropdown-item>
          <el-dropdown-item icon="el-icon-more-outline" @click.native="dottedline">虚线
          </el-dropdown-item>
          <el-dropdown-item icon="el-icon-search" @click.native="circle">圆</el-dropdown-item>
          <el-dropdown-item icon="el-icon-chat-round" @click.native="ellipse">椭圆
          </el-dropdown-item>
          <el-dropdown-item icon="el-icon-crop" @click.native="rect">长方形</el-dropdown-item>
          <el-dropdown-item icon="el-icon-caret-left" @click.native="equilateral">等边三角形
          </el-dropdown-item>
          <el-dropdown-item icon="el-icon-caret-top" @click.native="rightangle">正三角形
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <i class="el-icon-refresh-left tooltip" @click="setBack"><span class="tooltiptext">撤销</span>
      </i>
      <i class="el-icon-edit tooltip" @click="freedrawing"><span class="tooltiptext">涂鸦</span>
      </i>
      <i class="el-icon-zoom-in tooltip" @click="zoomIn"><span class="tooltiptext">放大</span> </i>
      <i class="el-icon-zoom-out tooltip" @click="zoomOut"><span class="tooltiptext">缩小</span>
      </i>
      <i class="el-icon-close tooltip" @click="closeCanvas"><span class="tooltiptext">关闭</span>
      </i>
      <i class="el-icon-download tooltip" @click="download"><span class="tooltiptext">下载</span>
      </i>
      <i class="el-icon-check tooltip" @click="send"><span class="tooltiptext">发送</span> </i>
    </div>
  </div>
</template>

<script>
  import {fabric} from "fabric";
  import {svgAsPngUri} from 'save-svg-as-png'

  export default {
    name: "DrawBoard",
    props:['dataURL'],
    data() {
      return {
        show:false,
        outputFileURL:'',
        canvas:null,
        drawType: null,   //绘制类型
        drawingObject: null,  //当前绘制对象
        moveCount: 1, // 绘制移动计数器
        tempJson: null,
        textbox: null,
        mouseTo: {},
        mouseFrom: {},
        doDrawing: false, // 绘制状态
        //################
        primaryColor: 'red',  //画笔颜色
        penSize: 2,        //笔触宽度
        canvasZoom: 1,     //缩放比例
        canvasObj: {},
      }
    },
    methods: {
      initCanvas() {
        console.log("Init canvas when trigger.....")
        this.canvas = new fabric.Canvas("canvas", {
          isDrawingMode: true,
          skipTargetFind: true,
          selectable: true,
          selection: false,
          backgroundColor: 'rgb(255,255,255)', // 背景色,
        });
        this.canvas.setWidth(680)
        this.canvas.setHeight(700)

        this.canvas.setZoom(this.canvasZoom); //设置画板缩放比例

        this.canvas.freeDrawingBrush.color = this.primaryColor; //设置自由绘颜色
        this.canvas.freeDrawingBrush.width = this.penSize;

        this.canvas.on("mouse:down", (options) => {
          var xy = this.transformMouse(options.e.offsetX, options.e.offsetY);
          this.mouseFrom.x = xy.x;
          this.mouseFrom.y = xy.y;
          this.doDrawing = true;
        })
        this.canvas.on("mouse:up", (options) => {
          var xy = this.transformMouse(options.e.offsetX, options.e.offsetY);
          this.mouseTo.x = xy.x;
          this.mouseTo.y = xy.y;
          this.drawingObject = null;
          this.moveCount = 1;
          this.doDrawing = false;
        });
        this.canvas.on("mouse:move", (options) => {
          if (this.moveCount % 2 && !this.doDrawing) {
            //减少绘制频率
            return;
          }
          this.moveCount++;
          var xy = this.transformMouse(options.e.offsetX, options.e.offsetY);
          this.mouseTo.x = xy.x;
          this.mouseTo.y = xy.y;
          this.drawing();
        });
        // 滚动鼠标实现画布的缩放
        /*this.canvas.on('mouse:wheel',(opt)=>{
            var delta = opt.e.deltaY;
            var zoom = this.canvas.getZoom();
            zoom *= 0.999 ** delta;
            if (zoom > 10) zoom = 10;
            if (zoom < 0.2) zoom = 0.2;
            this.canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
            opt.e.preventDefault();
            opt.e.stopPropagation();
        });*/
      },
      setBackgroundImg(dataURL) {
        console.log("setBackgroundImg CANVAS IS RUNNING")

        this.canvas.setBackgroundColor('rgb(255,255,255)');

        this.canvas.setBackgroundImage(dataURL,
          this.canvas.renderAll.bind(this.canvas), {
            // scaleY: this.canvas.height / 680,
            // scaleX: this.canvas.width / 700,
            originX: 'left',
            originY: 'top'
          });
      },
      exitEditing() {
        console.log("退出编辑")
        if (this.textbox) {
          this.textbox.exitEditing()
        }
      },
      // 关闭编辑界面
      closeCanvas() {
        this.clearCanvas(0);

      },
      onChangeColor() {
        // 获取当前激活对象
        const o = this.canvas.getActiveObject()
        if (o) {
          console.log('this.color', this.primaryColor)
          o.set('fill', this.primaryColor)
          this.canvas.renderAll()
        }
      },
      //坐标转换
      transformMouse(mouseX, mouseY) {
        return {x: mouseX / this.canvasZoom, y: mouseY / this.canvasZoom};
      },
      //绘画方法
      drawing() {
        if (this.drawingObject) {
          this.canvas.remove(this.drawingObject);
        }
        var canvasObject = null;
        switch (this.drawType) {
          case "freeDrawing":
            if (this.textbox) {
              this.textbox.enterEditing();
              this.canvas.isDrawingMode = true;
              this.canvas.freeDrawingBrush.color = this.primaryColor
            }
            break;
          case 'arrow': //箭头
            this.exitEditing()
            canvasObject = new fabric.Path(this.drawArrow(this.mouseFrom.x, this.mouseFrom.y, this.mouseTo.x, this.mouseTo.y, 30, 30), {
              stroke: this.primaryColor,
              fill: "rgba(255,255,255,0)",
              strokeWidth: this.penSize
            });
            break;
          case "line": //直线
            this.exitEditing()

            canvasObject = new fabric.Line([this.mouseFrom.x, this.mouseFrom.y, this.mouseTo.x, this.mouseTo.y], {
              stroke: this.primaryColor,
              strokeWidth: this.penSize
            });
            break;
          case "dottedline": //虚线
            this.exitEditing()

            canvasObject = new fabric.Line([this.mouseFrom.x, this.mouseFrom.y, this.mouseTo.x, this.mouseTo.y], {
              strokeDashArray: [3, 1],
              stroke: this.primaryColor,
              strokeWidth: this.penSize
            });
            break;
          case "circle": //正圆
            this.exitEditing()

            var left = this.mouseFrom.x,
              top = this.mouseFrom.y;
            var radius = Math.sqrt((this.mouseTo.x - left) * (this.mouseTo.x - left) + (this.mouseTo.y - top) * (this.mouseTo.y - top)) / 2;
            canvasObject = new fabric.Circle({
              left: left,
              top: top,
              stroke: this.primaryColor,
              fill: "rgba(255, 255, 255, 0)",
              radius: radius,
              strokeWidth: this.penSize
            });
            break;
          case "rectangle": //长方形
            this.exitEditing()

            var path =
              "M " +
              this.mouseFrom.x +
              " " +
              this.mouseFrom.y +
              " L " +
              this.mouseTo.x +
              " " +
              this.mouseFrom.y +
              " L " +
              this.mouseTo.x +
              " " +
              this.mouseTo.y +
              " L " +
              this.mouseFrom.x +
              " " +
              this.mouseTo.y +
              " L " +
              this.mouseFrom.x +
              " " +
              this.mouseFrom.y +
              " z";
            canvasObject = new fabric.Path(path, {
              left: left,
              top: top,
              stroke: this.primaryColor,
              strokeWidth: this.penSize,
              fill: "rgba(255, 255, 255, 0)"
            });
            //也可以使用fabric.Rect
            break;
          case "rightangle": //直角三角形
            this.exitEditing()

            var localpath = "M " + this.mouseFrom.x + " " + this.mouseFrom.y + " L " + this.mouseFrom.x + " " + this.mouseTo.y + " L " + this.mouseTo.x + " " + this.mouseTo.y + " z";
            canvasObject = new fabric.Path(localpath, {
              left: left,
              top: top,
              stroke: this.primaryColor,
              strokeWidth: this.penSize,
              fill: "rgba(255, 255, 255, 0)"
            });
            break;
          case "ellipse": //椭圆
            this.exitEditing()

            var localleft = this.mouseFrom.x, localtop = this.mouseFrom.y;
            var localradius = Math.sqrt((this.mouseTo.x - left) * (this.mouseTo.x - left) + (this.mouseTo.y - top) * (this.mouseTo.y - top)) / 2;
            canvasObject = new fabric.Ellipse({
              left: localleft,
              top: localtop,
              stroke: this.primaryColor,
              fill: "rgba(255, 255, 255, 0)",
              originX: "center",
              originY: "center",
              rx: Math.abs(localleft - this.mouseTo.x),
              ry: Math.abs(localtop - this.mouseTo.y),
              strokeWidth: this.penSize
            });
            break;
          case "text":
            this.textbox = new fabric.Textbox("", {
              left: this.mouseFrom.x,
              top: this.mouseFrom.y,
              width: 150,
              fontSize: 18,
              borderColor: "#2c2c2c",
              fill: this.primaryColor,
              hasControls: false
            });
            this.canvas.add(this.textbox);
            this.textbox.enterEditing();
            // this.textbox.hiddenTextarea.focus();

            /*this.canvas.on('mouse:down', (opt) => {
                console.log('this.activeIndex', this.activeIndex)
                const pos = opt.absolutePointer
                // 执行文字操作
                const isText = () => {
                    if (this.activeIndex === null) {
                        // 如果当前没有选中元素，点击空白处添加文字
                        this.addText(this.canvas, this.primaryColor, pos)
                    } else {
                        // 获取当前激活对象
                        const o = this.canvas.getActiveObject()
                        if (!o) {
                            this.activeIndex = null
                        }
                    }
                }
                switch (this.operation) {
                    case 'text':
                        isText();
                        break
                    default:
                        isText()
                }
            })*/

            /*var text = new fabric.IText('', {
                strokeWidth:2,
                borderColor: '#cc66c6', // 激活状态时的边框颜色
                editingBorderColor: '#ff0000', // 文本对象的边框颜色，当它处于编辑模式时
                left: this.mouseFrom.x,
                top: this.mouseFrom.y -10,
                transparentCorners: true,
                fontSize: 16,
                fill: this.primaryColor || '#ff0000',
                padding: 5,
                cornerSize: 5, // Size of object's controlling corners
                cornerColor: '#ff0000',
                rotatingPointOffset: 20, // Offset for object's controlling rotating point
                lockScalingFlip: true, // 不能通过缩放为负值来翻转对象
                lockUniScaling: true // 对象非均匀缩放被锁定
            })
            text.id = this.objCount
            // 绑定选中事件
            text.on('selected', () => {
                this.activeIndex = text.id
                this.isSelect = true
            })
            this.canvas.add(text).setActiveObject(text) // 添加文字到画布上，并将文字置为激活状态
            text.enterEditing() // 将文字置为编辑状态*/

            // this.onMouseDown(this.canvas) // 绑定点击新增文字事件
            break;
          case "equilateral": //等边三角形
            this.exitEditing()

            var height = this.mouseTo.y - this.mouseFrom.y;
            canvasObject = new fabric.Triangle({
              top: this.mouseFrom.y,
              left: this.mouseFrom.x,
              width: Math.sqrt(Math.pow(height, 2) + Math.pow(height / 2.0, 2)),
              height: height,
              stroke: this.primaryColor,
              strokeWidth: this.penSize,
              fill: "rgba(255,255,255,0)"
            });
            break;
          default:
            if (this.textbox) {
              this.textbox.enterEditing()
            }
            break;
        }
        if (canvasObject) {
          // canvasObject.index = getCanvasObjectIndex();
          this.canvas.add(canvasObject); //.setActiveObject(canvasObject)
          this.drawingObject = canvasObject;
        }
      },
      // 箭头
      arrow() {
        this.canvas.isDrawingMode = false;
        this.drawType = 'arrow';

        this.canvas.skipTargetFind = true; //画板元素不能被选中
        this.canvas.selection = false; //画板不显示选中
      },
      //绘制箭头方法
      drawArrow(fromX, fromY, toX, toY, theta, headlen) {
        theta = typeof theta != "undefined" ? theta : 30;
        headlen = typeof theta != "undefined" ? headlen : 10;
        // 计算各角度和对应的P2,P3坐标
        var angle = Math.atan2(fromY - toY, fromX - toX) * 180 / Math.PI,
          angle1 = (angle + theta) * Math.PI / 180,
          angle2 = (angle - theta) * Math.PI / 180,
          topX = headlen * Math.cos(angle1),
          topY = headlen * Math.sin(angle1),
          botX = headlen * Math.cos(angle2),
          botY = headlen * Math.sin(angle2);
        var arrowX = fromX - topX,
          arrowY = fromY - topY;
        var path = " M " + fromX + " " + fromY;
        path += " L " + toX + " " + toY;
        arrowX = toX + topX;
        arrowY = toY + topY;
        path += " M " + arrowX + " " + arrowY;
        path += " L " + toX + " " + toY;
        arrowX = toX + botX;
        arrowY = toY + botY;
        path += " L " + arrowX + " " + arrowY;
        return path;
      },
      // 直线段
      line() {
        this.canvas.isDrawingMode = false;
        this.drawType = 'line';
      },
      // 虚线
      dottedline() {
        this.canvas.isDrawingMode = false;
        this.drawType = 'dottedline';
      },
      // 圆
      circle() {
        console.log('circle ....')
        this.canvas.isDrawingMode = false;
        this.drawType = 'circle';
      },
      // 长方形
      rect() {
        this.canvas.isDrawingMode = false;
        this.drawType = 'rectangle'
      },
      // 正三角形
      rightangle() {
        this.canvas.isDrawingMode = false;
        this.drawType = 'rightangle'
      },
      // 椭圆
      ellipse() {
        this.canvas.isDrawingMode = false;
        this.drawType = 'ellipse'
      },
      // 文字
      text() {
        this.canvas.isDrawingMode = false;
        this.drawType = 'text'
      },
      // 等边三角形
      equilateral() {
        this.canvas.isDrawingMode = false;
        this.drawType = 'equilateral'
      },
      // 自由画笔
      freedrawing() {
        this.canvas.isDrawingMode = true;
        this.canvas.freeDrawingBrush.color = this.primaryColor
        this.drawType = 'freeDrawing'
      },


      zoomIn() {
        this.canvasZoom += 1;
        this.canvas.renderAll()
        this.canvas.isDrawingMode = false;
      },
      zoomOut() {
        this.canvasZoom -= 1;
        console.log("zoomOut")
      },
      // 回退一步
      setBack() {
        console.log(this.canvas.toJSON())
        if (this.canvas.toJSON().objects.length > 0) {
          console.log("回退一次")
          this.tempJson = this.canvas.toJSON()
          this.tempJson.objects.pop()
          this.canvas.loadFromJSON(this.tempJson, this.canvas.renderAll.bind(this.canvas));
        }
      },
      // 格式化时间
      formatDateTime(date) {
        var y = date.getFullYear();
        var m = date.getMonth() + 1;
        m = m < 10 ? ('0' + m) : m;
        var d = date.getDate();
        d = d < 10 ? ('0' + d) : d;
        var h = date.getHours();
        h = h < 10 ? ('0' + h) : h;
        var minute = date.getMinutes();
        minute = minute < 10 ? ('0' + minute) : minute;
        var second = date.getSeconds();
        second = second < 10 ? ('0' + second) : second;
        return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second;
      },
      // 将canvas内容绘制成SVG存放在隐藏的div中
      toSVG() {
        var newCanvas = document.getElementById('tempCan')
        newCanvas.innerHTML = this.canvas.toSVG();
      },
      // 清空画布上的指定内容
      clearCanvas() {
        console.log("CLEAR CANVAS IS RUNNING")
        this.canvas.clear()
      },
      // 下载编辑好的图片到本地
      download() {
        this.toSVG()

        /*svgAsDataUri(document.querySelector('svg')).then(uri=>{
            this.uri = uri
            console.log(this.uri)
        })*/

        svgAsPngUri(document.querySelector('svg')).then(uri => {
          var file = this.dataURLtoFile(uri, 'test.png');
          console.log(file);
          var i = URL.createObjectURL(file);
          var a = document.createElement("a");
          a.style = 'display: none',
            a.href = i,
            // a.download = this.$store.state.tempSession.tempObj.to + '_' + this.formatDateTime(new Date()) + ".png",
            a.download = '现在是测试' + '_' + this.formatDateTime(new Date()) + ".png",
            a.click()
        })
      },
      // 将编辑好的图片发送给对方
      send() {
        this.toSVG()
        // saveSvgAsPng(document.querySelector('svg'), "svg-png.png")
        svgAsPngUri(document.querySelector('svg')).then(uri => {
          var file = this.dataURLtoFile(uri, 'Edited.png');
          // console.log(file);
          this.outputFileURL = file;
          console.log(this.outputFileURL)
          this.$emit('outputFileURL',this.outputFileURL)

          // 发送消息之后将画布置空
          this.clearCanvas()

          /*let nim = this.$store.state.nim
          nim.previewFile({
            type: 'image',
            dataURL: uri,
            fastPass: '{"w":200,"h":110,"md5":"xxxxxxxxx"}',
            uploadprogress: (obj) => {
              console.log('文件总大小: ' + obj.total + 'bytes');
              console.log('已经上传的大小: ' + obj.loaded + 'bytes');
              console.log('上传进度: ' + obj.percentage);
              console.log('上传进度文本: ' + obj.percentageText);
            },
            done: (error, file) => {
              console.log('上传image' + (!error ? '成功' : '失败'));
              // show file to the user
              if (!error) {
                var msg = nim.sendFile({
                  scene: 'p2p',
                  // 编辑好的图片只能发送给当前视频对端用户
                  to: this.$store.state.tempSession.tempObj.to,
                  file: file,
                  done: (error, obj) => {
                    console.log("发送图片 " + (!error ? '成功' : '失败'), error, obj);
                  }
                });
                console.log('正在发送p2p image消息, id=' + msg.idClient);
                this.pushMsg(msg);
                for (let i = 0; i < this.$store.state.data.sessions.length; i++) {
                  if (this.$store.state.data.sessions[i].to == msg.to) {
                    this.$store.commit('setTempSession', {
                      key: 'tempObj',
                      val: this.$store.state.data.sessions[i]
                    });
                    this.$store.commit('setTempSession', {
                      key: 'tempMsgs',
                      val: this.$store.state.data.msgs[this.$store.state.data.sessions[i].id]
                    });
                    console.log("抓住发送消息只螃蟹.....")
                  }
                }
                document.getElementById("file").value = null
                this.$forceUpdate()
              }
            }
          });*/
        })
      },
      dataURLtoFile(dataurl, filename) {
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
          bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, {type: mime}); // file 类型
      },
    },
    watch: {
      dataURL:function(val){
        this.show = true;
        console.log("画板里面收到父组件的dataURL")
        this.setBackgroundImg(val)
      },
      canvasZoom(val) {
        if (val > 0) {
          this.canvas.setZoom(val);
          console.log("Zoom has been changed... ")
          this.canvas.renderAll()
        } else {
          this.canvasZoom = 1
        }
      },
      penSize(val) {
        this.penSize = val
        this.canvas.renderAll()
      },
    },
    mounted() {
      this.initCanvas()
    }
  }
</script>

<style scoped>
  .tooltip {
    position: relative;
    display: inline-block;
  }

  .tooltip .tooltiptext {
    font-size: 12px;
    visibility: hidden;
    width: 70px;
    background-color: rgba(0, 0, 0, 0.5);
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 5px 0;

    /* 定位 */
    position: absolute;
    z-index: 1;
    top: 100%;
    left: 50%;
    margin-left: -31px;
  }

  .tooltip:hover .tooltiptext {
    visibility: visible;
  }

  #editUtils {
    height: 42px;
    background-color: #efefef;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    justify-items: center;
    text-align: center;
    line-height: 100%;
    font-size: 32px;
    /* 解决IE flex evenly 兼容性问题:
        将元素中的evenly显示方法改为space-between显示
        在父元素上添加::before,::after{content:'',display:block }
    */
    /*justify-content: space-evenly;*/
  }

  #editUtils::before,
  #editUtils::after {
    content: '';
    display: block;
  }

  #canvas1 {
    display: flex;
    justify-content: center;
    margin: 10px auto;
    width: 680px;
    height: 700px;
    /*background-color: whitesmoke;*/
  }

  .msgProfile {
    width: 100%;
    line-height: 40px;
    align-items: center;
    background: #f5f5f5;
    /*margin-bottom: auto;*/
    border-bottom: solid #e7e7e7 1px;
    border-radius: 5px 5px 0 0;
  }

  .drawBoard {
    display: flex;
    flex-direction: column;
    /*height: 86vh;*/
    height: 100%;
    /*width: 49%;*/
    width: 680px;
    background-color: #F5F5F5;
    border-radius: 5px 5px 5px 5px;
  }
</style>
