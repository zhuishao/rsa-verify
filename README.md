# 说明
### 可用版本0.1.7（无后端），0.2.3,0.3.5
该插件的作用是人机校验,适用于vue，支持中英国际化。方式是拖动下方滑块使拼图与上方缺失拼图对应，成功后会触发一个成功函数，为了防止被postman等软件暴力破解，附加了一个rsa加密功能，公钥需要自己找或后台给出。
![avatar](http://www.zhuishao.net/wp-content/uploads/2021/02/11831e49-c1e5-4aef-b874-1225551a3b05.gif)
# 如何引入

```
npm i -S rsa-verify
```

在main.js文件中引入

```
import RsaVerify from 'rsa-verify'
import 'rsa-verify/lib/rsa-verify.css'
Vue.use(RsaVerify);
```

或按需引入

```
import { NC } from 'rsa-verify'
import 'rsa-verify/lib/rsa-verify.css'

componnets:  {
	NC,
}
```

# 更新@0.1.7

1.小方块可以控制大小
2.白色的底变为有规则的灰度白底

考虑到每个公司使用的图片不一定会相同的原因，需要在项目中的public文件中加入images文件夹，并放入5张图片，图片名称为0.jpg，1.jpg，2.jpg，3.jpg，4.jpg。图片大小必须为宽260，高160。

# 重大更新@0.2.0

1.图片从前端生成改为从后端读取,因此调用逻辑也会变化
2.在visible从false->true时重新获取图片，不需要配置图片
# 更新@0.2.3
1.类样式在uniapp失效，由于input经过转换变成uni-input，修改类名

# 如何使用-@0.1.7及之前

```
<template>
  <div class="home">
    <button @click="openNC">点击测试</button>
    <n-c :imgPath="process.env.publicPath" :publicKey="publicKey" @onsuccess="verifySuccess" ref="nc"></n-c>
  </div>
</template>
```

```
export default {
  name: 'Home',
  data() {
    return {
      publicKey:'一串rsa公钥',
    };
  }
  methods:{
    openNC() {
      this.$refs.nc.show();
    },
    verifySuccess() {
      // 假设密码为password
      const changedPassword = this.$refs.nc.setCode(password);
      // 调用后台登录接口
      ...
    }
  }
}
```

### 模拟一次登录的使用0.1.7

1. 用户输入用户名密码
2. 唤起组件this.$refs.nc.show(),
3. 进行人机校验，失败会出现提示重新校验，成功触发函数onsucess
4. 在成功函数中写入你的方法给密码加密，调用登录接口等。

### 模拟一次登录的使用0.2.0及之后


# 如何使用0.2.0及之后

```
<div id="app">
    <button @click="show">click me</button>
    <n-c :locale="locale" :publicKey="publicKey" @onsuccess="handleSubmit" ref="nc"></n-c>
</div>
```

```
export default {
  name: 'Home',
  data() {
    return {
      publicKey:'一串rsa公钥',
    };
  }
  methods:{
    openNC() {
      this.$refs.nc.show('zhuishao');
    },
    handleSubmit(code) {
      // code为校验成功回传字段
      // 假设密码为password
      const changedPassword = this.$refs.nc.setCode(password);
      // 调用后台登录接口
      ...
    }
  }
}
```



## 执行逻辑@0.2.0

1. 从后端获取两张图片，一张是背景扣了一个方块，一张是方块
2. 拖动使方块与背景重合将加密用户名和加密拖动的距离发送给后端判断是否拖动成功（用户名对拖动结果不影响，因为要用户名给这个用户加点东西）返回一个code值，内部逻辑是this.$emit('onsuccess', data);
3. 登录时将data加入登录表单，可以使用this.$refs.nc.setCodeObj(obj)对象加密，或者this.$refs.nc.setCode(param) String加密。
## 后端需要做的操作@0.2.0及以后-2021/02/23
1. API中的url为后端的地址，后端处理的地址有两个generateCode?key=xxx 和checkCode?key=xxx&code=xxx&lang=xxx
2. 在这里完整的整理一下前后端交互逻辑首先是generateCode?key=xxx,看一下它的调用源码xhr.open('get',\`${this.encodeUrl}/generateCode?key=${encodeURIComponent(this.setCode(this.username))}\`);这个username是从API中this.$refs.nc.show(username='')来的，它与后端定义了一个字段，**必须要传**，且唯一性字段（每个人不同）。我是使用的登录表单中的username，这个字段的意义是让后端保存该字段，等后面进行校验时，校验接口还会传输这个字段，通过这样才能匹配完成图片校验的功能。那这个接口后端该返回的数据结构是  
![avatar](http://www.zhuishao.net/wp-content/uploads/2021/02/qi-ye-wei-xin-jie-tu-1614049417445.png)  主要是data中的内容，因为其他是定义好的数据结构，每个公司可能不同，图片可能刷不出来。  

```

data:{  

	h:48, // 图片距离顶部高度，范围是（0，160-size），size是小方块大小默认为50。  

	imgIndex: 0, // 目前没卵用  

	src1: 'base64小方块图片，大小50*50',  

	src2: 'base64背景图片，大小260*160，背景要扣个洞'，  

	w:null // 目前没卵用  

}  

``` 

 3.每次我们唤起人机校验或者刷新都会调用/generateCode接口，当我们拖动滑块至指定位置则会调用checkcode接口，源代码为xhr.open('get',\`${this.encodeUrl}/checkCode?key=${encodeURIComponent(this.setCode(this.username))}&code=${encodeURIComponent(this.setCode(this.thumbx))}&lang=${encodeURIComponent(this.locale)}\`)
4./generateCode接口需要传入的值分别是key，code，lang，key这个字段在this.$refs.nc.show('传入的字段'),code就是拖拽时的距离（自动生成），lang在组件中配置。后端需要传给前端的是验证是否成功的判断，结构固定（因为要取结构中的message做拖拽完成的提示）![avatar](http://www.zhuishao.net/wp-content/uploads/2021/02/qi-ye-wei-xin-jie-tu-16140655857686.png)
![avatar](http://www.zhuishao.net/wp-content/uploads/2021/02/qi-ye-wei-xin-jie-tu-16140657505734.png)  

5.当拖拽成功后会返回一串data代码，这串代码就是登陆过程的关键。具体流程是拖拽成功->this.$emit('onsuccess', data);->在组件中定义<n-c @onsuccess="handleSuccess"></n-c>->使用handleSuccess进行登录操作（同时把data传给后端校验）->登录成功逻辑。
 
## API

| 参数      | 说明                                                         | 类型     | 默认值 | 版本            |
| --------- | ------------------------------------------------------------ | -------- | ------ | --------------- |
| publicKey | rsa公钥，如不使用可不传入                                    | String   | ‘null’ |                 |
| url       | 后台接口地址，形式为http://xxx.com,有默认值，可不传。该地址用到了获取图片和校验。 | String   |        | 0.2.0           |
| imgPath   | 图片位置，可传配置process.env.publicPath                     | String   | './'   | 0.1.7及之前可用 |
| locale    | 国际化，提示语可传‘zh开头’,'en开头',zh为中文，en为英文       | String   | 'zh'   |                 |
| onsuccess | @onsuccess= "()=>{}",验证成功的回调函数                      | Function |        |                 |
| size      | 小方块的大小                                                 | Number   | 40     | 0.1.7及之前可用 |



加入ref=”nc“后可执行的操作

| 函数       | 说明                                                         | 用法                                                         |
| ---------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| show       | 使人机校验显示出来，需要传值username。获取的时候后台可以知道username以方便后续校验。 | this.$refs.nc.show(username)（@0.2.0） this.$refs.nc.show()(@0.1,7) |
| setCode    | rsa加密,返回值是加密后的密文                                 | this.$refs.nc.setCode(message)                               |
| setCodeObj | rsa加密,返回值是加密后的对象                                 | this.$refs.nc.setCodeObj(obj)                                |
| close      | 使人机校验隐藏(一般是成功后，点击X，人机校验外范围自动隐藏)  | this.$refs.nc.close()                                        |
