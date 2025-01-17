// import crypto from "crypto";
// import { encryptor } from '@metamask/browser-passworder';
// const crypto = require('crypto');

const encryptor = require('browser-passworder')

const password = "Tomo@123456";

const words1 = "glad crack bid pepper timber shock inform random frozen able express axis";
const words2 = "caution fun ordinary squeeze expect bone undo dial define subway clean fiscal";

const booted = '{"data":"CyJIkc9hVVNqHZ5diNhlOZGWRxHMow==","iv":"SogVeNzKo/AgdQXS4VuZ/A==","salt":"5f1r7SU2XdeW3k4h6XJ3fKmoYP+62E2otxx0gTQDfCg="}';
const vault = '{"data":"HVUhdWTPKzxXILlKtLGvuHYDd1iNjVvPZRnQovhCaCD+GDt3HxG6wlRlpMDAr5pAAOKR+TdsIOo3nvuZaoyxeXwbxSMJAbccezkVRNulC2aAc/d9jtYoq4w52R9+aNdvEqIeB3XF/IH20abcZURQ+hmkvVekJAcFgSJ8R04aDE2bp9x0Suxi9PhhJ/dFXCM5u3Y5o425hO7Hn/g0c1hCoyXL6Z3u3SxI7tCiRXM8f2N0LEoYiyNNbnvVRmujX7ZCXLfiXOdtViSt1tjVqYf8djPavFTYWDPMkFO1ZHgnO22JhN9IFaGMAQiBdHFYMWn6ohelz2AGI3QciobE2qunVAPsO8Cw0UnhMXdY7sLdNy2hrMqM+dyoxmYYsYCmcCgwTtHAufr0bPNDBIM62wYV4uZhpI0TDfFzQ3pGjIquUj9+AI3wgMcITQwezJSlHJUjj8PAwBfEP+a1CcyiqsbDgcBZwWoOypcQSy6wVgPskickC6DSPkjDyzy/7vuAlkXjXCewJNmbR9PBUYUWrgNRtkfasqtoyVA=","iv":"1Kq2Ha6OG/hydOALGVkZ1w==","salt":"hFEZzZULYOp266WUjeEDDLPujJFeSB+I1Nbqaar/K2M="}';

export const getVaultDecrypt = async() =>{
  console.log(password, vault)
  let vaultDecrypt = await encryptor.decrypt(password, vault);
  console.log(vaultDecrypt)
  return vaultDecrypt;
}
