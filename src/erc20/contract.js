import Web3 from "web3";
import erc20 from "./ERC20.json";

const web3 = new Web3(window.ethereum);
const tokenAddress = "";
const contractToken = new web3.eth.Contract(erc20.abi, tokenAddress);

const allowance = (data, callback) => {
  let { address, tokenAddress } = data;
  contractToken.methods.allowance(address, tokenAddress).call((err, result) => {
    console.log("erc20 allowance", result, err);
    callback(result);
  });
};

const approve = (data, callback) => {
  let { address, to, max = 9876543, tokenAddress } = data;
  let limit = web3.utils.toWei(max.toString(), "ether");
  limit = web3.utils.toBN(limit);
  contractToken.methods
    .approve(tokenAddress, limit)
    .send({
      from: address,
    })
    .then((result) => {
      console.log("erc20 approve ok", result);
      callback(result);
    })
    .catch((err) => {
      console.log("erc20 approve err", err);
    });
};

const transfer = (data, callback) => {
  let nx = contract.methods.recharge(seasonId, rechargeId, amountCharge);
  nx.estimateGas({
    from: address,
    value: amountCharge,
  })
    .then((gasLimit) => {
      gasLimit = Math.ceil(gasLimit * 2);

      params.gasPrice = gasPrice;
      params.gasLimit = gasLimit;
      nx.send(params)
        .then((err, transactionHash) => {
          console.log("erc20 transfer ok", err, transactionHash);
        })
        .catch((err) => {
          console.log("erc20 transfer err", typeof err, err);
        });
    })
    .catch((err) => {
      console.log("gasLimit err", typeof err, err.message);
    });
};

export { allowance, approve, transfer };
