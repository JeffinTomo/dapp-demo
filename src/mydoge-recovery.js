import * as CryptoJS from 'crypto-js';

const WALLET = '@mydoge_WALLET';
const JSONFormatter = {
  stringify(cipherParams) {
    // create json object with ciphertext
    const jsonObj = {
      ct: cipherParams.ciphertext.toString(CryptoJS.enc.Base64),
    };
    // optionally add iv or salt
    if (cipherParams.iv) {
      jsonObj.iv = cipherParams.iv.toString();
    }
    if (cipherParams.salt) {
      jsonObj.s = cipherParams.salt.toString();
    }
    // stringify json object
    return JSON.stringify(jsonObj);
  },
  parse(jsonStr) {
    // parse json string
    const jsonObj = JSON.parse(jsonStr);
    // extract ciphertext from json object, and create cipher params object
    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.enc.Base64.parse(jsonObj.ct),
    });
    // optionally extract iv or salt
    if (jsonObj.iv) {
      cipherParams.iv = CryptoJS.enc.Hex.parse(jsonObj.iv);
    }
    if (jsonObj.s) {
      cipherParams.salt = CryptoJS.enc.Hex.parse(jsonObj.s);
    }

    return cipherParams;
  },
};

const getLocalValue = (key) => {
  return chrome.storage.local
    .get([key])
    .then((result) => {
      return result[key];
    })
    .catch(() => null);
};

const decrypt = ({ data, password }) => {
  try {
    const decrypted = CryptoJS.AES.decrypt(data, password, {
      format: JSONFormatter,
    });
    return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
  } catch (error) {
    return null;
  }
};

/*
const password = "Tomo@123456";
const words1 = "glad crack bid pepper timber shock inform random frozen able express axis";
*/
export const hasEoaAccounts = async()=>{
  const password = "Tomo@123456";
  // const wallet = await getLocalValue(WALLET);

  const wallet =  "{\"ct\":\"cBy2Rjj+JMI09al/M2MM+MzrVBOw+OWvA4F+XysUlpmVt2Styu9qrnpV8VN0oR2xyLwWzhwpjtwYC3cpIXvIMa1D0noi19o8m82SXaFW20mmINnUSJGFSxm9LEed6N87OqzqlMdAqNRn0bDtyAo5clreoLza/ordPHQ2ERYYx32Wgj16TwBB4kiAiiMj1m8blfA0JCk+PN0E+DYlctusX1x3EYhMRhSilB9de6GaXOnqWhFqqx66Abq4mJ6D9YFwauou7ofP5CnPNDY4Iv6ZSX9IBxaxBYn/EsAbPQFlgHLJS+s6tj93l3lc6YC/EA0s7Ulq8E9QiZGtZvg5D/9p604n+8dnmty943Os0glrVvMT1IkP8QkfCgDe2OA6IpLsdCc/PM2o/bzXGa9EraMhl/EYa5nN/qFXNm05Or6WuPOkjtIA/+KUJ0Mh8NNDpUt5\",\"iv\":\"ddb0ce9c027ff2f8d3646eeceb5224a5\",\"s\":\"a4fef00264ff9494\"}";

  const wallet2 = JSON.stringify({ "ct": "phIkF8krJxR0ViYYIU8xKp1ruQNM7f/IpsLfFQzumhTK5yrwp2UHUWmXa7DzN/2e3Dtr/abRbr1m/xMr0StRKZfHc8E11Emv9HJ5ZhPtG6pVwKR4049waDnjDb/cAETkwgg9HMu07C/87iKWFidqdLrf8MXfegRfeUYxNhbXB1ZEsVMnxZtQeDLepmNsvc3DCYuxJDE6rEAlC1oY3DP0+PlnF8YJXnZMTPnzO4lGCFhE8UZwQC48VQ5HsVBOp/0TGDJP+G3LqOpCDP16+xdVnZbiSVdOCnivlvB+BsMtX4ij0Glb4S3kitcxsA5P9xQZilLXaeduiDW9t+xoNCWzuLhsVOpApnXLX9NC8/S6Fxyk4cJW2MOIpthG2thjy8LgnzCANdT+3+s6Lwaa0y4P3QPP4EeUo1Gz+MplXzKQmBfUZbaHjeruqxbWBJYg69rl+BcnaQmY6jZcZ8m3cIydnZH4oly2X6/OL/LhdWzdsnbjFSQvuUVe4HzGOUtqNMbkuuGO9+x+Einh/ZFpyN34x4NxRsiPY/PAc7MMP88g4N3y4TIZOTGnNiVqRs5eGYDtF449KxFwrbDc09EkBSEFqjKqMis5E4X5KkOXRdWyDOnOMFB2XJ4uypngNEPl89F1", "iv": "da84a09d1e0d758e3a70f51dac061232", "s": "54d68415ff0c0687" });
  const decryptedWallet = decrypt({
    data: wallet2,
    password,
  });

  console.log({ password, wallet, wallet2 });
  console.log('result:', decryptedWallet, JSON.stringify(decryptedWallet));

  return decryptedWallet;
}

/*
{
  "phrase":"glad crack bid pepper timber shock inform random frozen able express axis",
  "root":"QQLQxkJgaTqkBeKRu3hd1kiwZtLUYLA7VGiSuKC2hr5qBxiJ11RD",
  "children":["QW8xwKKYY3HD2fbzDQddx276nYqX71VjQYhPY1guPxrefXungVmU"],
  "addresses":["DLsbf5qa5XKXGsMamvLUWeimmMKBnFMV7h"],
  "nicknames":{
    "DLsbf5qa5XKXGsMamvLUWeimmMKBnFMV7h":"Address 1"
  }
}
*/


/*
accounts = [{
  addressType: 2
  data: {
      mnemonic: 'caution fun ordinary squeeze expect bone undo dial define subway clean fiscal',
      xpriv: null,
      activeIndexes: [0],
      hdPath: "m/86'/0'/0'/0"
  },
  type: "HD Key Tree"
}]
*/
