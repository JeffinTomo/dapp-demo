function convertToHex(str) {
  var hex = '';
  for (var i = 0; i < str.length; i++) {
    hex += '' + str.charCodeAt(i).toString(16);
  }
  return hex;
}

async function payWithWeb3(options) {
  var button = document.querySelector("#" + options.buttonId);
  if (!options.buttonId || !button) {
    return;
  }

  button.addEventListener("click", async () => {
    try {
      var provider = window.ethereum;
      if (!provider) {
        alert("请安装 evm 插件钱包");
        return
      }

      var res = await provider.request({ method: "eth_requestAccounts" });

      var address = res[0];

      provider.request({
        method: "eth_sendTransaction",
        params: [{
          to: options.to,
          value: options.value || "0",
          from: address,
          data: convertToHex("reward for " + window.location.pathname)
        }],
      });
    } catch (error) {
      console.log("error", error);
    }
  });
}
(async function () {
  $(".gh-copyright").append("<button id='pay-with-web3'>打赏 ~0.0002 ETH</button>");
  await payWithWeb3({
    buttonId: "pay-with-web3",
    to: "0xcD1666A42bB8B4e9af27D01ba1C52268554a5630",
    value: "1000000000000",
  });
})();