import { Injectable } from '@angular/core';
import Web3 from 'web3';
import { ethers } from "ethers";

import { HttpHeaders, HttpClient } from '@angular/common/http';

import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { env } from 'process';
import { map } from 'rxjs/operators';
import { BehaviorSubject, Observable, throwError } from 'rxjs';

declare let window: any;
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  web3: any;
  

  userAccount: any;
  URL: any = environment.URL;
  private behave = new BehaviorSubject<Object>('');
  setBehaviorView(behave: object) {
    this.behave.next(behave);
  }

  /** Get Behavior for user registraion */
  getBehaviorView(): Observable<object> {
    return this.behave.asObservable();
  }

  constructor(private route: ActivatedRoute, private http: HttpClient, private toaster: ToastrService, private router: Router,) {
    if (window.ethereum) {

      window.web3 = new Web3(window.ethereum);
      this.web3 = new Web3(window.web3.currentProvider);

      

      // window.web3 = new Web3(Web3.givenProvider);
      // this.web3 = new Web3(Web3.givenProvider);

      // window.web3 = new Web3(window.Web3.givenProvider);

      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length) {
          if (this.userAccount != accounts[0]) {

            if (localStorage.removeItem('Authorization') != null) {

            }
            this.userAccount = accounts[0];
            window.location.reload();
          }

        }
        // window.location.reload();
      });

      window.ethereum.on('chainChanged', function () {
        localStorage.setItem('connected','false');
        if (localStorage.removeItem('Authorization') != null) {

        }
        // logout();
        else
          window.location.href = '/';
      });
    }
    // Legacy dapp browsers...
    else if (window.web3) {

      // commented for future use
    }
    // Non-dapp browsers...
    else {
      this.toaster.error('Non-Ethereum browser detected. You should consider trying MetaMask!')
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }

  }

  getNetworkName() {
    if (window.ethereum && window.ethereum.chainId) {

      let obj: any = {};
      console.log(window.ethereum.chainId)
      if (window.ethereum.chainId == "0x1") {
        obj.network_name = environment.main;
      }
      if (window.ethereum.chainId == "0x3") {
        obj.network_name = environment.rops;
      }
      if (window.ethereum.chainId == "0x4") {
        obj.network_name = environment.rinkeby;
      }
      if (window.ethereum.chainId == "0x5") {
        obj.network_name = environment.Goerli;
      }
      if (window.ethereum.chainId == "0x2a") {
        obj.network_name = environment.Kovan;
      }
      if (window.ethereum.chainId == '0x61') {
        obj.network_name = environment.bscTestnet;
      }
      if (window.ethereum.chainId == '0x38') {
        obj.network_name = environment.bscMainnet;
      }
      if (window.ethereum.chainId == '0x13881') {
        obj.network_name = "Matic(Polygon) Mumbai Testnet";
      }
      if (window.ethereum.chainId == '0x89') {
        obj.network_name = "Matic(Polygon) Mumbai Mainnet";
      }
      this.setBehaviorView({ ...this.getBehaviorView(), ...obj });
      return obj.network_name;
    }
  }

  async connect() {
    if (window.ethereum) {
      // commented for future use
      return new Promise((resolve, reject) => {

        let temp = window.ethereum.enable();
        // web3.eth.accounts.create();
        if (temp) {
          resolve(temp)
        } else {
          reject(temp);
        }

      })
    } else {
      this.toaster.error('No account found! Make sure the Ethereum client is configured properly. ', 'Error!')
      return 'error'
    }
  }

  // --dn
  async exportInstance(SCAddress: any, ABI: any) {

      let provider = new ethers.providers.Web3Provider(window.ethereum)

      let signer = provider.getSigner()

      let a = new ethers.Contract(SCAddress, ABI, signer);
      

    
    if (a) {
     
      return a;
    } else {
      return {};
    }
  }


  async export() {
    let connect=localStorage.getItem('connected')
    if(connect=='true'){
      if (window.ethereum) {
        return new Promise(async (resolve, reject) => {
          
          try {
            // check if the chain to connect to is installed
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: Web3.utils.toHex(environment.chainId) }], // chainId must be in hexadecimal numbers
            });
          } catch (error) {
            // This error code indicates that the chain has not been added to MetaMask
            // if it is not, then install it into the user MetaMask
            if (error.code === 4902) {
              try {
                let networkdata:any=[];
                switch(Web3.utils.toHex(environment.chainId))
                {
                  case "0x13881":
                    networkdata = [
                      {
                        chainId: "0x13881", // 80001
                        chainName: "Matic(Polygon) Mumbai Testnet",
                        nativeCurrency: { name: "tMATIC", symbol: "tMATIC", decimals: 18 },
                        rpcUrls: ["https://polygon-mumbai.g.alchemy.com/v2/Z9Pn3WcHAkLtb7oVQO4EtySOKgEwoG5R"],
                        blockExplorerUrls: ["https://mumbai.polygonscan.com/"]
                      },
                    ];
                    break;
                  case "0x89":
                    networkdata = [
                      {
                        chainId: "0x89", // 137
                        chainName: "Matic(Polygon) Mumbai Mainnet",
                        nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
                        rpcUrls: ["https://polygon-rpc.com/"],
                        blockExplorerUrls: ["https://polygonscan.com/"],
                      }
                    ];
                    break;
  
                  case "0x61":
                    networkdata = [
                      {
                        chainId: "0x61", // 137
                        chainName: "BSC Testnet",
                        nativeCurrency: { name: "BSC", symbol: "BSC", decimals: 18 },
                        rpcUrls: ["https://data-seed-prebsc-2-s3.binance.org:8545/"],
                        blockExplorerUrls: ["https://testnet.bscscan.com"],
                      }
                    ];
                  default:
                    break;
                }
  
                await window.ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: networkdata
                });
              } catch (addError) { 
                console.error(addError);
              }
            }else if (error.code === 4001){
              this.toaster.error("Please switch to correct network." , 'Error!');
              resolve([]);
            }else{
              console.error(error);
              return;
            }
          }
  
          /*********** Testtt () */
  
          let accounts: any = await window.ethereum.request({ method: 'eth_requestAccounts' }).then((data: any) => {
            if (data && data.length) {
              return data;
            }
          }).catch(async (err: any) => {
            if (err && err.code == 4001) {
              this.toaster.error(err['message'], 'Error!');
            }
            
          });
  
          if (accounts && accounts.length) {
            window.web3.eth.defaultAccount = accounts[0];
            let obj: any = {};
            obj.wallet_address = accounts[0];
            this.setBehaviorView({ ...this.getBehaviorView(), ...obj });
  
            resolve(accounts[0])
          } else {
            resolve([]);
          }
        })
      } else {
        this.toaster.error('No account found! Make sure the Ethereum client is configured properly. ', 'Error!')
      }
    }
   
  }

  getBalance(contractInstance: any, userWalletAccount: any) {
    return new Promise(async (resolve, reject) => {
      if (!userWalletAccount) {
        this.toaster.error('Metamask/Wallet connection failed.', 'Error!');
        return;
      }
      let result = await contractInstance.methods.balanceOf(userWalletAccount).call({
        from: userWalletAccount
      });

      if (result) {
        result = await Web3.utils.fromWei(`${result}`);
        resolve(result);
      } else {
        reject('err');
      }

    });

  }

  // 
  getHeaders() {
    let t: any = localStorage.getItem('Authorization');
    return t && t != undefined ? t : '';
  }
  checkuseraddress(address: any) {
    return this.http.post(this.URL + '/auth/checkuseraddress', { sWalletAddress: address });
  }

  getprofile() {
    return this.http.get(this.URL + '/user/profile', { headers: { 'Authorization': this.getHeaders() } });
  }

  updateProfile(data: any) {
    return this.http.put(this.URL + '/user/updateProfile', data, { headers: { 'Authorization': this.getHeaders() } });
  }


  async login(type: any, from: any, toaster: any,userStatus:any) {
    if(userStatus=='deactivated'){
      this.toaster.error("Admin Has Deactivated Your Account")
      
      return
    }
    const that = this;
    if (window.ethereum) {

      const timestamp = new Date().getTime();
      const message = `${environment.sitename} uses this cryptographic signature in place of a password, verifying that you are the owner of this Ethereum address - ${timestamp}`;

      console.log(window.web3.utils.fromUtf8(message));

      window.web3.currentProvider.sendAsync({
        method: 'personal_sign',
        params: [message, from],
        from: from,
      }, async function (err: any, signature: any) {
        // console.log('---------------------<<M',result);
        // console.log('---------------------<<err',err)
        if (err && err == null || err == undefined) {
          if (signature['result']) {
            if (type == "signin") {
              await that.http.post(that.URL + '/auth/login', {
                sWalletAddress: from,
                sMessage: message,
                sSignature: signature['result']
              }).subscribe((result: any) => {
                if (result && result['data']) {

                  localStorage.setItem('Authorization', result.data.token);
                  localStorage.setItem('sWalletAddress', result.data.sWalletAddress);
                  localStorage.setItem('userId',result.data.userId);
                  toaster.success('Sign in successfully.', 'Success!');
                  that.onClickRefresh();
                  return;
                }
              }, (err) => {
                if (err) {
               
               
                  toaster.error(err.error);

                }
              });
            }
            if (type == "signup") {
              that.http.post(that.URL + '/auth/register', {
                sWalletAddress: from,
                sMessage: message,
                sSignature: signature['result']
              }).subscribe((result: any) => {
                if (result && result['data']) {
                  toaster.success('Sign up successfully.', 'Success!');

                  localStorage.setItem('Authorization', result.data.token);
                  localStorage.setItem('sWalletAddress', result.data.sWalletAddress);
                  that.onClickRefresh();

                }
              }, (err) => {
                if (err) {
                  toaster.error('There is some issue with sign up', 'Error!');

                }
              });
            }
          }
        } else {
          toaster.error(err['message'], 'Error!');
        }

        // window.web3.eth.personal.sign(message, from, function (err: any, signature: any) {
        // console.log('--------signature-----', signature);
        // console.log('--------err-----', err)

      })
    }
    // return this.http.post(this.URL + '/auth/checkuseraddress', {sWalletAddress:address});
  }


  getCollectionList() {
    return this.http.get(this.URL + '/nft/collectionlist', {headers: { 'Authorization': this.getHeaders() } });
  }
  getCollectionInfo(data: any) {
    return this.http.post(this.URL + '/nft/getCollectionInfo', data, { headers: { 'Authorization':  this.getHeaders() } });
  }
  allCollectionWiseList(data: any) {
    return this.http.post(this.URL + '/nft/allCollectionWiseList', data, { headers: { 'Authorization':  this.getHeaders() } });
  }

  getCategories() {
    return this.http.get(this.URL + '/user/categories', { headers: { 'Authorization': this.getHeaders() } });
  }

  getColoboraterList() {
    return this.http.get(this.URL + '/user/getCollaboratorList', { headers: { 'Authorization': this.getHeaders() } });
  }

  createCollection(data: any) {
    
    const headers= new HttpHeaders()
  .set('Authorization',this.getHeaders());
 
      console.log("data---->",data);
    return this.http.post(this.URL + '/nft/createCollection', data, { headers:headers });
  }


  createOrder(data: any) {
    
    const headers= new HttpHeaders()
  .set('Authorization',this.getHeaders());
 
    console.log("data---->",data);
    return this.http.post(this.URL + '/order/createOrder', data, { headers:headers });
  }

  createCollaborator(data: any) {
    return this.http.post(this.URL + '/user/addCollaborator', data, { headers: { 'Authorization': this.getHeaders() } });
  }

  updateCollectionToken(id: any) {
    return this.http.get(this.URL + '/nft/updateCollectionToken/' + id, { headers: { 'Authorization': this.getHeaders() } });
  }

  createNFT(data: any) {
    return this.http.post(this.URL + '/nft/create', data, { headers: { 'Authorization': this.getHeaders() } });
  }
  updateNFTOrder(data:any){
    return this.http.put(this.URL + '/nft/updateNftOrder',data,{headers:{'Authorization': this.getHeaders() }})
  }

  uploadData(data: any) {

    let fd = new FormData();
    fd.append('nftFile',data)
    return this.http.post(this.URL + '/nft/uploadImage', fd, { headers: { 'Authorization': this.getHeaders() } });
  }

  setTransactionHash(data: any) {
    return this.http.post(this.URL + '/nft/setTransactionHash', data, { headers: { 'Authorization': this.getHeaders() } });
  }

  nftListing(data: any) {
    return this.http.post(this.URL + '/nft/nftListing', data, { headers: { 'Authorization': this.getHeaders() } });
  }
  myCollectionList(data: any) {
    return this.http.post(this.URL + '/nft/myCollectionList', data, { headers: { 'Authorization': this.getHeaders() } });
  }
  

  viewnft(id: any) {
    return this.http.get(this.URL + '/nft/viewnft/' + id, { headers: { 'Authorization': this.getHeaders() } });
  }

  viewnftOwner(id: any) {
    return this.http.get(this.URL + '/nft/viewnftOwner/' + id, { headers: { 'Authorization': this.getHeaders() } });
  }

  viewselectednftOwner(id: any) {
    return this.http.get(this.URL + '/nft/viewselectednftOwner/' + id, { headers: { 'Authorization': this.getHeaders() } });
  }

  getAllnftOwner(id: any) {
    return this.http.get(this.URL + '/nft/getAllnftOwner/' + id, { headers: { 'Authorization': this.getHeaders() } });
  }


  getAllAuctionbids(id: any) {
    return this.http.get(this.URL + '/bid/getAllAuctionbids/' + id, { headers: { 'Authorization': this.getHeaders() } });
  }
  getAuctionBidsHistory(id: any, data: any) {
    return this.http.post(this.URL + '/bid/getAuctionBidsHistory/' + id, data, { headers: { 'Authorization': this.getHeaders() } });
  }
  getCurrentAuctionBids(id: any) {
    return this.http.get(this.URL + '/bid/getCurrentAuctionBids/' + id, { headers: { 'Authorization': this.getHeaders() } });
  }
  getSelectedAuctionBids(id: any, owner: any) {
    return this.http.get(this.URL + '/bid/getSelectedAuctionBids/' + id +'/'+owner , { headers: { 'Authorization': this.getHeaders() } });
  }
  getCurrentAuctionBidsList(id: any) {
    return this.http.get(this.URL + '/bid/getCurrentAuctionBidsList/' + id, { headers: { 'Authorization': this.getHeaders() } });
  }
  removeAuctionBidRecords(data:any){
    return this.http.post(this.URL + '/bid/removeAuctionBidRecords',data,{headers:{'Authorization': this.getHeaders() }})
  }
  rejectAuctionBidRecords(data:any){
    return this.http.post(this.URL + '/bid/rejectAuctionBidRecords',data,{headers:{'Authorization': this.getHeaders() }})
  }
  rejectAuctionbid(data:any) {
    return this.http.post(this.URL + '/bid/rejectAuctionbid',data,{headers:{'Authorization': this.getHeaders() }})
  }
  acceptAuctionbid(data:any) {
    return this.http.post(this.URL + '/bid/acceptAuctionbid',data,{headers:{'Authorization': this.getHeaders() }})
  }




  bidHistory(id: any, data: any) {
    return this.http.post(this.URL + '/bid/history/' + id, data, { headers: { 'Authorization': this.getHeaders() } });
  }
  tokenHistory(id: any, data: any) {
    return this.http.post(this.URL + '/bid/tokenHistory/' + id, data, { headers: { 'Authorization': this.getHeaders() } });
  }
  bidByUser(data: any) {
    return this.http.post(this.URL + '/bid/bidByUser', data, { headers: { 'Authorization': this.getHeaders() } });
  }
  landingPage() {
    return this.http.get(this.URL + '/nft/landing', { headers: { 'Authorization': this.getHeaders() } });
  }
  nftMYListing(data: any) {
    return this.http.post(this.URL + '/nft/mynftlist', data, { headers: { 'Authorization': this.getHeaders() } });
  }

  nftMYCreatedListing(data: any) {
    return this.http.post(this.URL + '/nft/nftMYCreatedListing', data, { headers: { 'Authorization': this.getHeaders() } });
  }

  nftmyNFTOnSaleListing(data: any) {
    return this.http.post(this.URL + '/nft/nftmyNFTOnSaleListing', data, { headers: { 'Authorization': this.getHeaders() } });
  }

  nftmyNFTPurchasedListing(data: any) {
    return this.http.post(this.URL + '/nft/nftmyNFTPurchasedListing', data, { headers: { 'Authorization': this.getHeaders() } });
  }

  bidCreate(data: any) {
    return this.http.post(this.URL + '/bid/create', data, { headers: { 'Authorization': this.getHeaders() } });
  }
  //Transfer NFT API
  transfer(data: any) {
    return this.http.post(this.URL + '/bid/transfer', data, { headers: { 'Authorization': this.getHeaders() } });
  }

  //Get Banner
  getBanner() {
    return this.http.get(this.URL + '/nft/getBanner', { headers: { 'Authorization': this.getHeaders() } });
  }
  
  //Get Faq Data
  getFaqData() {
    return this.http.get(this.URL + '/user/getFAQsData');
  }
  
  toggleBidStatus(data: any) {
    return this.http.post(this.URL + '/bid/toggleBidStatus', data, { headers: { 'Authorization': this.getHeaders() } });
  }

  profileDetail(data: any) {
    return this.http.post(this.URL + '/user/profileDetail', data, { headers: { 'Authorization': this.getHeaders() } });
  }
  profileWithNfts(data: any) {
    return this.http.post(this.URL + '/user/profileWithNfts', data, { headers: { 'Authorization': this.getHeaders() } });
  }

  allUserDetails(data: any) {
    return this.http.post(this.URL + '/user/allDetails', data, { headers: { 'Authorization': this.getHeaders() } });
  }

  follow(data: any) {
    return this.http.post(this.URL + '/user/follow', data, { headers: { 'Authorization': this.getHeaders() } });
  }
  like(data: any) {
    return this.http.post(this.URL + '/nft/like', data, { headers: { 'Authorization': this.getHeaders() } });
  }

  // nNFTId: 6120eba598b61743cf49a43f
  // sSellingType: Auction
  toggleSellingType(data: any) {
    return this.http.put(this.URL + '/nft/toggleSellingType', data, { headers: { 'Authorization': this.getHeaders() } });
  }
  updateBasePrice(data: any) {
    return this.http.put(this.URL + '/nft/updateBasePrice', data, { headers: { 'Authorization': this.getHeaders() } });
  }
  
  //add newsletter emails
  addNewsLetterEmails(data:any){
    return this.http.post(this.URL + '/user/addNewsLetterEmails',data)
  }

  
  onClickRefresh() {
    window.location.reload();
  }
}
