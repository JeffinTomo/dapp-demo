var CryptoJS = require('crypto-js');
function _interopDefault(e) { return e && e.__esModule ? e : { default: e }; }

var CryptoJS__default = /*#__PURE__*/_interopDefault(CryptoJS);

function generateSignature(config) {
  // const timestamp = Math.floor(Date.now() / 1e3).toString();
  const timestamp = "1747725945";
  const method = config.method.toUpperCase();
  let data = config.data ? config.data : {};
  if (method === "GET") {
    data = JSON.stringify({ key: "value" });
  } else {
    if (typeof data !== "string") {
      data = JSON.stringify(data);
    }
  }
  console.log('aaaaaaaa', data);
  console.log('aaaaaaaa', method, config.url, timestamp, data, config.apiKey, config.apiSecret, config.salt);
  const message = [method, config.url, timestamp, data, config.apiKey, config.apiSecret, config.salt].join("");
  if (config.debug) {
    console.log("Signature debug:", message);
  }
  console.log('aaaaaaaa message', message);
  const message2 = `POST/wallet/test1747725945{
    "chainIndex": 195,
    "callData": "0x",
    "gasLimitParam": {
        "from": "TTWBUyNBFshkEgBJ2hMzXLuvY6tHrHoYaU",
        "to": "TT67aSyGdPc9V1ZvewwHnT4nZcge3kM6kG",
        "value": "1444999"
    },
    "addressList": [
        "TTWBUyNBFshkEgBJ2hMzXLuvY6tHrHoYaU"
    ]
}j7sjxxdv5iaqnq69ull0t1rbcc3y6yx57bk63t810l3czi7b6vvd6gpxlqsq8ypeTomo@2025!@#`;
  const signature = CryptoJS__default.default.SHA256(message2).toString();
  return { signature, timestamp };
}


const API_KEY = "j7sjxxdv5iaqnq69ull0t1rbcc3y6yx5";
const API_SECRET = "7bk63t810l3czi7b6vvd6gpxlqsq8ype";
const SALT = "Tomo@2025!@#";
const aaaa = generateSignature({
  method: "POST",
  url: "/wallet/test",
  data: {
    chainIndex: 195,
    callData: "0x",
    gasLimitParam: {
      "from": "TTWBUyNBFshkEgBJ2hMzXLuvY6tHrHoYaU",
      "to": "TT67aSyGdPc9V1ZvewwHnT4nZcge3kM6kG",
      "value": "1444999"
    },
    "addressList": [
      "TTWBUyNBFshkEgBJ2hMzXLuvY6tHrHoYaU"
    ]
  },
  apiKey: API_KEY,
  apiSecret: API_SECRET,
  salt: SALT,
});
console.log('aaaaaaaa', aaaa);