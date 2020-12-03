import { JSEncrypt } from 'jsencrypt';

export default (() => {
  const publicKey = '-----BEGIN PUBLIC KEY-----\n' +
      'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA5k9/giqVwPiLgnUnr/wG\n' +
      '/plIY5H39fx8W1PSZDB/SfFpZ/4xBhUbX6uRqIxq7koHQXxbu8KQZISTXp11b7/1\n' +
      'egC2PxTDCCn4SszdYRDZdMAYsr1X6uy5pibv4LWnA5fTX10pxS1kzFFARgRWApdl\n' +
      'YlxpcEHnmUmWGEX+WeGAYLSqy98LXvLq2W//yAX28T9vRCs2ZEZqJov8r7CsugXy\n' +
      'eXkVlfB+zNjQdOp43cithVYkJQbxq/1KwGu8ZvF91YunwHEElNCcRnY2jtwCpgkD\n' +
      '3Ct+JHVSzWVzfBpi78xeb49UbnMnb60XkW0oXwFW1QKIG0x5swU1xql38DkRdXbP\n' +
      'EQIDAQAB\n' +
      '-----END PUBLIC KEY-----';
  const encrypt = new JSEncrypt();
  function setCode(message) {
    encrypt.setPublicKey(publicKey);
    return encrypt.encrypt(message);
  }
  function setCodeExtra(message, key) {
    encrypt.setPublicKey(key);
    return encrypt.encrypt(message);
  }
  function getCodeExtra(message, key) {
    encrypt.setPrivateKey(key);
    return encrypt.decrypt(message);
  }
  return {
    setCode,
    setCodeExtra,
    getCodeExtra,
  };
})();
