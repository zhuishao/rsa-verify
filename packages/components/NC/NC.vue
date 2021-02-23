<template>
  <div :class="['ec-panel', 'ec-wind', locale.indexOf('zh')===-1?'en':'zh', visible ? 'active' : '']">
    <div class="ec-panel-ghost" @click="show"></div>
    <div class="ec-panel-box">
      <div class="ec-wrap">
        <canvas
          class="ec-canvas"
          width="260"
          height="160"
          id="ec-canvas-bg"
        ></canvas>
        <img :src="src1" width="50" height="50" class="ec-image-thumb"/>
<!--        <canvas-->
<!--          class="ec-canvas-2"-->
<!--          width="260"-->
<!--          height="160"-->
<!--          id="ec-canvas-thumb"-->
<!--        ></canvas>-->
        <div :class="['img-loading', refreshing ? 'active' : '']"></div>
        <div class="ec-error-tips">{{errormsg}}</div>
      </div>
      <div class="ec-panel">
        <input
          value="0"
          id="range-input"
          class="ec-range"
          type="range"
          min="0"
          max="209"
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
    },
    url: {
      type: String,
      default: 'http://10.43.188.158:8080',
    },
    size: {
      type: Number,
      default: 50,
    }
  },
  data() {
    return {
      visible: false,
      imgIndex: 0,
      sx: 0,
      thumbx: 0,
      sy: 0,
      username: '',
      context2: null,
      canvas2: null,
      tipShow: true,
      errormsg: '',
      // 是否正在刷新
      refreshing: false,
      imageThumbData: null,
      src1: null,
      src2: null,
      t: null,
    };
  },
  computed: {
    encodeUrl() {
      return this.url.replace(/\/$/,'');
    }
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
    document.querySelector('#range-input').addEventListener('change', () => {
      this.verify().then((req) => {
        if (req.meta.success) {
          self.showSuccess(req.content.data);
        } else {
          self.showError(req.meta.message);
        }
      }, err => {
        if (err.meta.message) {
          self.showError(err.error);
        } else {
          self.showError('服务器错误');
        }
      });
    });
  },
  methods: {
    onRefresh() {
      this.loadImage();
    },
    showError(msg) {
      this.errormsg = msg;
      this.$nextTick(() => {
        document.querySelector('.ec-error-tips').classList.add('error');
      })
      setTimeout(() => {
        document.querySelector('.ec-error-tips').classList.remove('error');
        this.resetRange();
        // this.resetThumb();
      }, 1200);
      setTimeout(() => {
        this.onRefresh();
      }, 1350);
    },
    showSuccess(data) {
      document.querySelector('.ec-wrap').classList.add('success');
      setTimeout(() => {
        document.querySelector('.ec-wrap').classList.remove('success');
        this.show();
        this.resetRange();
        this.$emit('onsuccess', data);
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
        this.imageThumbData,
        this.sx,
        this.sy,
        this.size,
        this.size,
        10,
        this.sy,
        this.size,
        this.size,
      );
    },
    show(username = '') {
      this.username = username;
      if (!this.visible) {
        this.onRefresh();
      }
      this.visible = !this.visible;
    },
    setCode(message) {
      if (this.publicKey !== 'null') {
        return rsa.setCodeExtra(message, this.publicKey);
      } else {
        return rsa.setCode(message);
      }
    },
    setCodeObj(obj) {
      if (Object.prototype.toString.call(obj).indexOf("Object")!==-1) {
        Object.keys(obj).forEach(item => {
          obj[item] = this.setCode(obj[item]);
        })
      }
      return obj;
    },
    loadImage() {
      const img = new Image();
      const imgThumb = new Image();
      const self = this;
      this.refreshing = true;
      img.onload = (e) => {
        const canvas = document.getElementById('ec-canvas-bg');
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, 260, 160);
        // 图片绘制
        context.drawImage(e.target, 0, 0, 260, 160);
        setTimeout(() => {
          self.refreshing = false;
        }, 200);

      };
      this.getImageUrl().then((req) => {
        const response = req.content.data;
        this.sy = response.h;
        // this.sx = req.x;
        img.src = response.src2;
        imgThumb.src = response.src1;
        this.src1 = imgThumb.src;
        this.src2 = img.src;
        const style = document.querySelector('.ec-image-thumb').style;
        style.setProperty('--sx', 0);
        style.setProperty('--sy', response.h);
      })
    },
    verify() {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('get',`${this.encodeUrl}/checkCode?key=${encodeURIComponent(this.setCode(this.username))}&code=${encodeURIComponent(this.setCode(this.thumbx))}&lang=${encodeURIComponent(this.locale)}`);
        xhr.onreadystatechange = function () {
          switch (xhr.readyState) {
            case 4:
              if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
                resolve(JSON.parse(xhr.response));
              } else {
                reject(JSON.parse(xhr.response));
              }
              break;
          }
        }
        xhr.send();
      })
    },
    getImageUrl() {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('get',`${this.encodeUrl}/generateCode?key=${encodeURIComponent(this.setCode(this.username))}`);
        xhr.onreadystatechange = function () {
          switch (xhr.readyState) {
            case 4:
              if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
                resolve(JSON.parse(xhr.response));
              } else {
                reject(false);
              }
              break;
          }
        }
        xhr.send();
      })
    },
    drawThumb(x) {
      this.thumbx = x;
      document.querySelector('.ec-image-thumb').style.setProperty('--sx', x);
    },
  },
  beforeDestroy() {
    clearInterval(this.t);
  },
};
</script>

<style scoped>
  .ec-range {
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
.ec-error-tips{
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
  .ec-error-tips.error {
    transform: translateY(0);
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
.ec-range {
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
.ec-range::-webkit-slider-runnable-track {
  -webkit-appearance: none;
  /* because IE */

  border: none;
  height: 2.5em;
  border-radius: 6.25em;
  background: #ddd;
}
.ec-range::-webkit-slider-thumb {
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
.ec-range:active::-webkit-slider-thumb {
  -webkit-appearance: none;
  /* weird shit, Chrome */
  background-image: url(images/sprite.1.0.0.png);
  background-size: 393.93939%;
  background-position: 0 20.8%;
}
.ec-range::-moz-range-track {
  /* fix Firefox WTF */

  z-index: -1;
  /* because IE */

  border: none;
  width: 25em;
  height: 2.5em;
  border-radius: 6.25em;
  background: #ddd;
}
.ec-range::-moz-range-thumb {
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
.ec-range:active::-moz-range-thumb {
  background-image: url(images/sprite.1.0.0.png);
  background-size: 393.93939%;
  background-position: 0 20.8%;
}
.ec-range::-ms-track {
  /* because IE */

  border: none;
  width: 25em;
  height: 2.5em;
  border-radius: 6.25em;
  background: #ddd;
  color: transparent;
}
.ec-range::-ms-thumb {
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
.ec-range:active::-ms-thumb {
  background-image: url(images/sprite.1.0.0.png);
  background-size: 393.93939%;
  background-position: 0 20.8%;
}
.ec-range::-ms-fill-lower,
.ec-range::-ms-fill-upper {
  background: transparent;
}
.ec-range::-ms-tooltip {
  display: none;
}
.ec-range:focus {
  outline: none;
  box-shadow: inset 0 1px 0.25em #eee;
}
.ec-panel {
  font-size: 14px;
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
.ec-image-thumb{
  position:absolute;
  left: 9px;
  top: 0;
  --sx: 0;
  --sy: 0;
  transform: translate(calc(var(--sx) * 1px), calc(var(--sy) * 1px));
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
