import { JSEncrypt } from 'jsencrypt';

export default (() => {
  const publicKey = '-----BEGIN PUBLIC KEY-----MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCSt8oXwgpeM9aOaThHB6UQy8oVC3UBRMDaiScaXRk15xDhHv/PCBgg9ZH02OmiLMH8SGnw4g7AJ3ESGbIYQDb5ufsWrpGhcigaRYm80xVCY2EwyIeLNMsYjdKiOdTHKcBvMpFncXwlsC0MVcUuOlBF5+k8EC8kqI1fka11bbpn4QIDAQAB-----END PUBLIC KEY-----';
  const encrypt = new JSEncrypt();
  function setCode(message) {
    encrypt.setPublicKey(publicKey);
    return encrypt.encrypt(message);
  }
  function setCodeExtra(message, key) {
    encrypt.setPublicKey(key);
    return encrypt.encrypt(message);
  }
  return {
    setCode,
    setCodeExtra,
  };
})();
