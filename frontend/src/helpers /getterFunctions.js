
import dgnr8ABI from './../Config/abis/dgnr8.json'

import { getAddress } from './addressHelper';
import { getAccount, getUserBalance, getWeb3 } from './currentWalletHelper';
import contracts from './../Config/contracts'

import { ethers } from 'ethers';


export const getContract = async (address,ABI) => {
    try {
     let add=contracts.NFT
     
      let provider = new ethers.providers.Web3Provider(window.ethereum)

      let signer = provider.getSigner()


      let a = new ethers.Contract(address,ABI,signer);
      console.log("contract is------->",a);

        
        return a;
    }
    catch (e) {
        console.log(e)
    }

}





// export const getAllowance = async (tokenName, account) => {
//   try {
//     let web3 = await getWeb3();
//     let token = await getCrowdsaleContract();
//     let crowdsaleAddress = await getAddress(contracts.crowdsale);
//     let allowance = await token.methods
//       .allowance(account, crowdsaleAddress)
//       .call();
//     console.log(
//       "allowance",
//       await web3.utils.fromWei(allowance.toString(), "ether")
//     );
//     return await web3.utils.fromWei(allowance.toString(), "ether");
//   } catch (e) {
//     console.log(e);
//   }
// };

// export const checkIfApproved = async (inputAmount, tokenName, account) => {
//   try {
//     let allowance = await getAllowance(tokenName, account);
//     console.log("allowances", inputAmount, allowance);
//     if (Number(allowance) < Number(inputAmount)) {
//       console.log("false");
//       return false;
//     } else {
//       console.log("true");
//       return true;
//     }
//   } catch (e) {
//     console.log(e);
//   }
// };


