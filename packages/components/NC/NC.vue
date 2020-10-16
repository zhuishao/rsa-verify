<template>
  <div :class="['ec-panel', 'ec-wind', locale, visible ? 'active' : '']">
    <div class="ec-panel-ghost" @click="show"></div>
    <div class="ec-panel-box">
      <div class="ec-wrap">
        <canvas
          class="ec-canvas"
          width="260"
          height="160"
          id="ec-canvas-bg"
        ></canvas>
        <canvas
          class="ec-canvas-2"
          width="260"
          height="160"
          id="ec-canvas-thumb"
        ></canvas>
        <div :class="['img-loading', refreshing ? 'active' : '']"></div>
      </div>
      <div class="ec-panel">
        <input
          value="0"
          id="range-input"
          class="ec-range"
          type="range"
          min="0"
          max="220"
        />
        <div :class="['tip-show', tipShow?'active':'']"></div>
      </div>
      <div class="ec-panel-footer">
        <div class="ec-icon-close" @click="show"></div>
        <div class="ec-icon-refresh" @click="onRefresh"></div>
      </div>
    </div>
  </div>
</template>

<script>
import rsa from './func/rsa';
export default {
  name: 'NC',
  props: {
    imgPath: {
      type: String,
      default: '/',
    },
    publicKey: {
      type: String,
      default: 'null',
    },
    locale: {
      type: String,
      default: 'zh',
    }
  },
  data() {
    return {
      visible: false,
      imgIndex: 0,
      sx: 0,
      sy: 0,
      context2: null,
      canvas2: null,
      tipShow: true,
      // 是否正在刷新
      refreshing: false,
      t: null,
    };
  },
  created() {
    if (!window.requestAnimationFrame) {
      let lastTime = 0;
      window.requestAnimationFrame = (callback) => {
        const currTime = new Date().getTime();
        const timeToCall = Math.max(0, 16.7 - (currTime - lastTime));
        const id = window.setTimeout(() => {
          callback(currTime + timeToCall);
        }, timeToCall);
        lastTime = currTime + timeToCall;
        return id;
      };
    }
    if (!window.cancelAnimationFrame) {
      window.cancelAnimationFrame = (id) => {
        clearTimeout(id);
      };
    }
  },
  mounted() {
    const self = this;
    this.t = setInterval(() => {
      if (document.querySelector('#range-input:active')) {
        const val = document.getElementById('range-input').value;
        if (val !== 0) {
          self.tipShow = false;
        }
        self.drawThumb(val);
      }
    }, 20);
    document.getElementById('range-input').addEventListener('touchmove', () => {
      this.tipShow = false;
      self.drawThumb(document.getElementById('range-input').value);
    });
    document.querySelector('#range-input').addEventListener('change', (e) => {
      if (Math.abs(parseInt(e.target.value, 10) - this.sx) < 4) {
        self.showSuccess();
        // 匹配成功
      } else {
        // 匹配失败
        self.showError();
      }
      //
    });
    this.Init();
  },
  methods: {
    Init() {
      this.loadImage();
    },
    onRefresh() {
      this.loadImage();
    },
    showError() {
      document.querySelector('.ec-wrap').classList.add('error');
      setTimeout(() => {
        document.querySelector('.ec-wrap').classList.remove('error');
        this.resetRange();
        this.resetThumb();
      }, 1200);
    },
    showSuccess() {
      document.querySelector('.ec-wrap').classList.add('success');
      setTimeout(() => {
        document.querySelector('.ec-wrap').classList.remove('success');
        this.show();
        this.onRefresh();
        this.resetRange();
        this.$emit('onsuccess');
      }, 1200);
    },
    resetRange() {
      if (!document.getElementById('range-input')) {
        return;
      }
      const val = document.getElementById('range-input').value;
      if (parseInt(val, 10) > 0) {
        document.getElementById('range-input').value = parseInt(val, 10) - 6;
        requestAnimationFrame(this.resetRange);
      } else {
        this.tipShow = true;
      }
    },
    close() {
      this.visible = false;
    },
    resetThumb() {
      const canvas = document.getElementById('ec-canvas-thumb');
      const context = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(
        this.imageData,
        this.sx,
        this.sy,
        40,
        40,
        10,
        this.sy,
        40,
        40,
      );
    },
    show() {
      this.visible = !this.visible;
    },
    setCode(message) {
      if (this.publicKey !== 'null') {
        return rsa.setCodeExtra(message, this.publicKey);
      } else {
        return rsa.setCode(message);
      }
    },
    loadImage() {
      const img = new Image();
      const self = this;
      this.refreshing = true;
      img.onload = (e) => {
        self.imageData = e.target;
        const canvas = document.getElementById('ec-canvas-bg');
        const context = canvas.getContext('2d');
        // 图片绘制
        context.drawImage(self.imageData, 0, 0, 260, 160);
        // 然后获取中间100*100区域数据
        const sx = parseInt(Math.random() * 180, 10) + 40;
        const sy = parseInt(Math.random() * 80, 10) + 20;
        self.sx = sx;
        self.sy = sy;
        const imageData = context.getImageData(sx, sy, 40, 40);
        const { length } = imageData.data;
        for (let index = 0; index < length; index += 4) {
          // const r = imageData.data[index];
          // const g = imageData.data[index + 1];
          // const b = imageData.data[index + 2];
          // // 计算灰度
          // const gray = r * 0.299 + g * 0.587 + b * 0.114;
          imageData.data[index] = 255;
          imageData.data[index + 1] = 255;
          imageData.data[index + 2] = 255;
        }
        // 光晕
        context.shadowColor = 'gray';
        context.shadowBlur = 4;
        // 填充个淡淡的颜色，以示尊敬
        context.fillRect(sx, sy, 40, 40);

        // 更新新数据
        context.putImageData(imageData, sx, sy);
        self.canvas2 = document.getElementById('ec-canvas-thumb');
        self.context2 = self.canvas2.getContext('2d');
        self.context2.clearRect(0, 0, self.canvas2.width, self.canvas2.height);
        self.context2.drawImage(self.imageData, sx, sy, 40, 40, 0, sy, 40, 40);
        self.context2.shadowColor = 'yellow';
        self.context2.shadowBlur = 4;
        setTimeout(() => {
          self.refreshing = false;
        }, 500);
      };
      this.imageIndex = parseInt(Math.random() * 5, 10);
      img.src = `${this.imgPath}images/${this.imageIndex}.jpg`;
    },
    drawImage() {

    },
    drawThumb(x) {
      const canvas = document.getElementById('ec-canvas-thumb');
      const context = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(
        this.imageData,
        this.sx,
        this.sy,
        40,
        40,
        x,
        this.sy,
        40,
        40,
      );
    },
  },
  beforeDestroy() {
    clearInterval(this.t);
  },
};
</script>

<style scoped>
  input[type='range'].ec-range {
  margin: 3.24% 3.24% 5.39%;
  width: 93.52%;
}
.ec-canvas {
  margin: 0 auto;
  display: block;
}
.ec-canvas-2 {
  position: absolute;
  width: 260px;
  height: 160px;
  top: 0;
  left: 0;
  right: 0;
  margin: auto;
  overflow: hidden;
}
.ec-wrap::before {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 20px;
  width: 260px;
  margin-left: auto;
  margin-right: auto;
  transform: translateY(20px);
  color: white;
  text-indent: 1rem;
  background-color: rgb(222, 113, 91);
  transition: transform 0.3s;
}
.zh .ec-wrap::before {
  content: "拖动滑块将悬浮图像正确拼合";
}
.en .ec-wrap::before {
  content: "Position incorrect";
}
.zh .ec-wrap::after {
  content: "验证成功";
}
.en .ec-wrap::after {
  content: "successful authentication";
}
.ec-wrap.error::before {
  transform: translateY(0);
  transition: transform 0.3s;
}
.ec-wrap::after {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 20px;
  width: 260px;
  margin-left: auto;
  margin-right: auto;
  transform: translateY(20px);
  color: white;
  text-indent: 1rem;
  background-color: rgb(94, 191, 112);
  transition: transform 0.3s;
}
.ec-wrap.success::after {
  transform: translateY(0);
  transition: transform 0.3s;
}
[class*="-ms-"]:before {
  opacity: 0.15;
}
input[type="range"] {
  box-sizing: border-box;
  overflow: visible;
  -webkit-appearance: none;
  height: 4em;
  padding: 0 0.5em;
  border-radius: 0.625em;
  /* Firefox & Chrome/ Opera need this,
   otherwise font-size is smaller */

  background: transparent;
  font-size: 1em;
  /* wish I could style this asshole */

  cursor: pointer;
}
input[type="range"]::-webkit-slider-runnable-track {
  -webkit-appearance: none;
  /* because IE */

  border: none;
  height: 2.5em;
  border-radius: 6.25em;
  background: #ddd;
}
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  /* weird shit, Chrome */

  margin-top: -0.55em;
  border: none;
  width: 3.5em;
  height: 3.5em;
  border-radius: 50%;
  box-shadow: 0 0.25em 0.25em #b2b2b2, 0 0.25em 0.5em #b2b2b2,
    inset 0 -0.125em 0.125em #949494, inset 0 0 0 0.25em #bbb,
    inset 0 1px 0.125em 0.25em #676767;
  background-image: url(images/sprite.1.0.0.png);
  background-size: 393.93939%;
  background-position: 0 7.5292%;
}
input[type="range"]:active::-webkit-slider-thumb {
  -webkit-appearance: none;
  /* weird shit, Chrome */
  background-image: url(images/sprite.1.0.0.png);
  background-size: 393.93939%;
  background-position: 0 20.8%;
}
input[type="range"]::-moz-range-track {
  /* fix Firefox WTF */

  z-index: -1;
  /* because IE */

  border: none;
  width: 25em;
  height: 2.5em;
  border-radius: 6.25em;
  background: #ddd;
}
input[type="range"]::-moz-range-thumb {
  -webkit-appearance: none;
  /* weird shit, Chrome */

  margin-top: -0.55em;
  border: none;
  width: 3.5em;
  height: 3.5em;
  border-radius: 50%;
  box-shadow: 0 0.25em 0.25em #b2b2b2, 0 0.25em 0.5em #b2b2b2,
    inset 0 -0.125em 0.125em #949494, inset 0 0 0 0.25em #bbb,
    inset 0 1px 0.125em 0.25em #676767;
  background-image: url(images/sprite.1.0.0.png);
  background-size: 393.93939%;
  background-position: 0 7.5292%;
}
input[type="range"]:active::-moz-range-thumb {
  background-image: url(images/sprite.1.0.0.png);
  background-size: 393.93939%;
  background-position: 0 20.8%;
}
input[type="range"]::-ms-track {
  /* because IE */

  border: none;
  width: 25em;
  height: 2.5em;
  border-radius: 6.25em;
  background: #ddd;
  color: transparent;
}
input[type="range"]::-ms-thumb {
  -webkit-appearance: none;
  /* weird shit, Chrome */

  margin-top: -0.55em;
  border: none;
  width: 3.5em;
  height: 3.5em;
  border-radius: 50%;
  box-shadow: 0 0.25em 0.25em #b2b2b2, 0 0.25em 0.5em #b2b2b2,
    inset 0 -0.125em 0.125em #949494, inset 0 0 0 0.25em #bbb,
    inset 0 1px 0.125em 0.25em #676767;
  background-image: url(images/sprite.1.0.0.png);
  background-size: 393.93939%;
  background-position: 0 7.5292%;
}
input[type="range"]:active::-ms-thumb {
  background-image: url(images/sprite.1.0.0.png);
  background-size: 393.93939%;
  background-position: 0 20.8%;
}
input[type="range"]::-ms-fill-lower,
input[type="range"]::-ms-fill-upper {
  background: transparent;
}
input[type="range"]::-ms-tooltip {
  display: none;
}
input[type="range"]:focus {
  outline: none;
  box-shadow: inset 0 1px 0.25em #eee;
}
.ec-panel {
  position: relative;
}
.ec-panel.ec-wind {
  position: fixed;
  z-index: 2147483647;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
  transition: all 0.5s;
  visibility: hidden;
  opacity: 0;
}
.ec-panel.ec-wind.active {
  visibility: visible;
  opacity: 1;
  transition: all 0.5s;
}
.ec-panel.ec-wind .ec-panel-ghost {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  opacity: 0.6;
  background-color: rgb(0, 0, 0);
}
.ec-panel .ec-panel-box {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 278px;
  height: 285px;
  margin-left: -139px;
  margin-top: -143px;
  box-shadow: 0 1px 8px rgba(128, 128, 128, 0.3);
  border: 1px solid #d1d1d1;
  border-radius: 2px;
  overflow: hidden;
  background-color: white;
  transition: width 0.5s ease, height 0.5s ease;
}
.ec-wrap {
  margin-top: 3.237%;
  position: relative;
  overflow: hidden;
}
.ec-panel-footer {
  display: flex;
  padding-left: 15px;
  padding-top: 10px;
  margin-top: -5px;
  border-top: 1px solid #eeeeee;
}
.ec-panel-footer :not(:first-child) {
  margin-left: 12px;
}
.ec-icon-close {
  width: 19px;
  height: 19px;
  cursor: pointer;
  background-image: url(images/sprite.1.0.0.png);
  overflow: hidden;
  background-size: 1300%;
  background-position: 0 31.64983%;
}
.ec-icon-refresh {
  width: 19px;
  height: 19px;
  cursor: pointer;
  background-image: url(images/sprite.1.0.0.png);
  overflow: hidden;
  background-size: 1300%;
  background-position: 0 86.86869%;
}
.img-loading {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  opacity: 0;
  background-image: url(images/loading.gif);
  background-size: cover;
  background-position: center;
  transition: opacity 0.3s;
}
.img-loading.active {
  opacity: 1;
}
  .tip-show{
    font-size:14px;
    position: absolute;
    top:0;
    bottom:0;
    right: 0;
    left: 70px;
    color: #88949d;
    line-height: 56px;
  }
  .tip-show::before{
    left: 7px;
    top: 9px;
  }
  .zh .tip-show::before {
    position: absolute;
    opacity: 0;
    content: '拖动左边滑块完成上方拼图';
    transition: opacity .3s;
  }
  .en .tip-show::before {
    position: absolute;
    opacity: 0;
    content: 'Drag the left slider';
    transition: opacity .3s;
  }
  .tip-show.active::before{
    opacity: 1;
  }
</style>
