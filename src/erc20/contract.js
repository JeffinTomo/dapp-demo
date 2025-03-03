import { parseGwei, parseEther, toHex } from "viem";

import Web3 from "web3";
import erc20 from "./ERC20.json";

const web3 = new Web3(window.mydoge.ethereum);

//https://base.blockscout.com/token/0xAC1Bd2486aAf3B5C0fc3Fd868558b082a531B2B4
const tokenAddress = "0xAC1Bd2486aAf3B5C0fc3Fd868558b082a531B2B4";

const contractToken = new web3.eth.Contract(erc20.abi, tokenAddress);

const getBalance = async (address) => {
  let balance = await contractToken.methods.balanceOf(address).call();
  return balance;
};

//decreaseAllowance
//increaseAllowance
const allowance = async (address) => {
  let res = await contractToken.methods.allowance(tokenAddress, address).call();
  return res;
};

const increaseAllowance = async (address, amount) => {
  let res = await contractToken.methods
    .increaseAllowance(address, amount)
    .call();
  return res;
};

const approve = (data, callback) => {
  let { address, max = 9876543 } = data;
  let limit = parseEther(max.toString());
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

const transfer = async (provider, data) => {
  let { address, to } = data;
  let value = parseGwei("1");
  let rawTx = {
    from: address,
    to: to,
    value: 0,
    data: contractToken.methods.transfer(to, toHex(value)).encodeABI(),
  };
  let res = await provider.request({
    method: "eth_sendTransaction",
    params: [rawTx],
  });
  return res;
};

export { getBalance, allowance, approve, transfer };
