
import contracts from "../Config/contracts";
import { getContract } from './getterFunctions'
import dgnr8ABI from '../Config/abis/dgnr8.json'
// import BigNumber from 'bignumber.js';

export const deploySimpleErc721 = async (name,symbol,imgLink,royalty) => {
    console.log("function is called");

    const delay = ms => new Promise(res => setTimeout(res, ms));

    let cont=await getContract(contracts.NFT,dgnr8ABI)

    if(cont){
        
        let res = await cont.deploySimpleERC721(name,symbol,imgLink,royalty);
        if(res){
            await delay(35000);
            console.log("res is-------->",res.hash)
            return res.hash;
        }
       
       
    }
    

}

export const deploySimpleErc1155 = async (imgLink,royalty) => {
    console.log("function is called");

    const delay = ms => new Promise(res => setTimeout(res, ms));

    let cont=await getContract(contracts.NFT,dgnr8ABI)

    if(cont){
        
        let res = await cont.deploySimpleERC1155(imgLink,royalty);
        if(res){
            await delay(35000);
            console.log("res is-------->",res.hash)
            return res.hash;
        }
       
       
    }
    

}




