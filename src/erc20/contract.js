import { parseGwei, parseEther, parseUnits, formatUnits, toHex, erc20Abi } from "viem";

import Web3 from "web3";

let web3 = new Web3(window?.mydoge?.ethereum);
let tokenAddress = "";
let contractToken = null;

const init = (provider, address) => {
  web3 = new Web3(provider);
  tokenAddress = address;
  contractToken = new web3.eth.Contract(erc20Abi, tokenAddress);
  // console.log(contractToken.methods);
  return contractToken;
};

const getBalance = async (address) => {
  const balance = await contractToken.methods.balanceOf(address).call();
  return balance;
};

//decreaseAllowance
//increaseAllowance
const allowance = async (address) => {
  const res = await contractToken.methods.allowance(address, tokenAddress).call();
  return res;
};

const increaseAllowance = async (address, amount) => {
  const res = await contractToken.methods
    .increaseAllowance(address, amount)
    .call();
  return res;
};

const approve = async (data) => {
  const decimals = await contractToken.methods.decimals().call();
  const { address, amount } = data;
  const limit = parseUnits(amount.toString(), Number(decimals));
  const res = contractToken.methods.approve(tokenAddress, limit).send({
    from: address,
  });
  return res;
};

const transfer = async (data) => {
  const decimals = await contractToken.methods.decimals().call();
  const { address, to, amount } = data;
  console.log('transfer', data);
  const value = parseUnits(amount.toString(), Number(decimals));
  const res = contractToken.methods.transfer(to, value).send({
    from: address,
  });
  return res;
};

export { init, getBalance, allowance, approve, transfer };
