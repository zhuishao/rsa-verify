# 说明

该插件的作用是人机校验,适用于vue，支持中英国际化。方式是拖动下方滑块使拼图与上方缺失拼图对应，成功后会触发一个成功函数，为了防止被postman等软件暴力破解，附加了一个rsa加密功能，公钥需要自己找或后台给出。

# 如何引入

```
npm i rsa-verify
```

在main.js文件中引入

```
import RsaVerify from 'rsa-verify'
import 'rsa-verify/lib/rsa-verify.css'
Vue.use(RsaVerify);
```

考虑到每个公司使用的图片不一定会相同的原因，需要在项目中的public文件中加入images文件夹，并放入5张图片，图片名称为0.jpg，1.jpg，2.jpg，3.jpg，4.jpg。图片大小必须为宽260，高160。

# 如何使用

```
<template>
  <div class="home">
    <button @click="openNC">点击测试</button>
    <n-c :publicKey="publicKey" @onsuccess="verifySuccess" ref="nc"></n-c>
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

### 模拟一次登录的使用

1. 用户输入用户名密码
2. 唤起组件this.$refs.nc.show(),
3. 进行人机校验，失败会出现提示重新校验，成功触发函数onsucess
4. 在成功函数中写入你的方法给密码加密，调用登录接口等。

## API

| 参数      | 说明                                    | 类型     | 默认值 | 版本 |
| --------- | --------------------------------------- | -------- | ------ | ---- |
| publicKey | rsa公钥，如不使用可不传入               | String   | ‘null’ |      |
| locale    | 国际化，提示语可传‘zh’,'en',zh为中文，en为英文             | String   | 'zh'   |      |
| onsuccess | @onsuccess= "()=>{}",验证成功的回调函数 | Function |        |      |

加入ref=”nc“后可执行的操作

| 函数    | 说明                         | 用法                        |
| ------- | ---------------------------- | --------------------------- |
| show    | 使人机校验显示出来           | this.$refs.show()           |
| setCode | rsa加密,返回值是加密后的密文 | this.$refs.setCode(message) |
| close   | 使人机校验隐藏               | this.$refs.close()          |

