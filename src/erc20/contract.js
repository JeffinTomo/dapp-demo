import { parseGwei, parseEther, toHex, erc20Abi } from "viem";

import Web3 from "web3";

let web3 = new Web3(window?.mydoge?.ethereum);
let tokenAddress = "";
let contractToken = null;

const init = (provider, address) => {
  web3 = new Web3(provider);
  tokenAddress = address;
  contractToken = new web3.eth.Contract(erc20Abi, tokenAddress);
  console.log(contractToken.methods);
};

const getBalance = async (address) => {
  let balance = await contractToken.methods.balanceOf(address).call();
  return balance;
};

//decreaseAllowance
//increaseAllowance
const allowance = async (address) => {
  let res = await contractToken.methods.allowance(address, tokenAddress).call();
  return res;
};

const increaseAllowance = async (address, amount) => {
  let res = await contractToken.methods
    .increaseAllowance(address, amount)
    .call();
  return res;
};

const approve = async (data) => {
  let { address, amount } = data;
  let limit = parseEther(amount.toString());
  let res = contractToken.methods.approve(tokenAddress, limit).send({
    from: address,
  });
  return res;
};

const transfer = async (data) => {
  let { address, to, amount } = data;
  let value = parseEther(amount.toString());
  let res = contractToken.methods.transfer(to, value).send({
    from: address,
  });
  return res;
};

export { init, getBalance, allowance, approve, transfer };
