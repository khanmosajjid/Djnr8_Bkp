import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { error } from 'jquery';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { parse } from 'path';
import { environment } from 'src/environments/environment';
import { ApiService } from '../api.service';
import { ScriptLoaderService } from '../script-loader.service';

import dgnr8ABI from '../../environments/Config/abis/dgnr8.json';

import extendedERC721 from '../../environments/Config/abis/extendedERC721.json'
import simpleERC721ABI from '../../environments/Config/abis/simpleERC721.json';
import simpleERC1155ABI from '../../environments/Config/abis/simpleERC1155.json';
import marketPlaceABI from '../../environments/Config/abis/marketplace.json';
import erc20 from '../../environments/Config/abis/erc20.json';
import BigNumber from 'bignumber.js';

import transakSDK from '@transak/transak-sdk';

import { ethers } from 'ethers';

import contracts from '../../environments/Config/contracts';
import { sign } from 'crypto';
import Web3 from 'web3';
import { EtherscanProvider } from '@ethersproject/providers';
import { truncateSync } from 'fs';
import {windowWhen} from 'rxjs/operators';

declare let window: any;
declare let $: any;

@Component({
  selector: 'app-nft-detail',
  templateUrl: './nft-detail.component.html',
  styleUrls: ['./nft-detail.component.css'],
})
export class NFTDetailComponent implements OnInit, OnDestroy {
  


  textMessage:any; 
  msgHideAndShow:any;
  userStatus:any;
  profileData:any;
  isActive:any=1;
 

  NFTData: any = {};
  NFTOwnerData: any = {};
  SelectedNFTOwnerData: any = {};
  historyData: any = [];
  tokenHistoryData: any = [];
  interVal: any;
  collaboratorList: any = [];

  bidForm: any;
  submitted1: Boolean = false;

  transferForm: any;
  submitted2: Boolean = false;

  buyForm: any;
  saleForm: any;
  saleType: any = 'Fixed Sale';
  // transferForm:any;
  submitted3: Boolean = false;

  changePriceForm: any;
  submitted4: Boolean = false;

  timedAuctionForm: any;
  submitted5: Boolean = false;

  isLogin: any = false;
  sellingType: any = '';
  id: any;
  account: any;
  marketPlace: any;
  sellerSign: any = [];
  buyerOrder: any = [];
  tokenType: Boolean = false;

  NFTBase_Price: any = 0;

  NFTprice: any;

  ShowBuyBtnERC1155: Boolean = false;
  NFTAllOwnerData: any;
  CurrentUserID: any = '';
  currentOwnerPrice: any = '';
  currentOwnerTime: any;
  currentOwnerQty: any = '';
  buyFormOwner: any;
  QntLeftForSale: any;

  currentOwnersaccount: any = '';
  currentOwnersOrder: any = '';
  currOwnerTotalQuantity: any = '';
  currOwnerSignature: any;
  currentOwnerSalt: any;
  currentOwnerSaleType: any = 0;
  nftownertblID: any = 0;

  //seller Order

  nftCurrentOwner: any = 0;

  nftTypeSaleAuction: any = '';

  // Auction Data
  ShowAuctionBids: Boolean = false;
  nftAllAuctionBidsdata: any = [];
  nftCurrentAuctionBids: any = [];
  nftCurrentAuctionBidsList: any = [];
  nftBidAmt: any = 0;
  nftBidQty: any = 0;
  nftERC721Type: Boolean = false;
  nftSelectedOwner: any = '';

  sellerOrder: any = [];
  NFTAuctionType: any = [];
  connect:any=false;


  /************ Put on Marketplace Popup Checks ********** */

  isShowPopup: boolean = false;
  isEnablePopup: boolean = true;
  isSignaturePopupClass: string = 'checkiconDefault';
  isApprovePopupClass: string = 'checkiconDefault';
  isPutOnSalePopupClass: string = 'checkiconDefault';
  isCompletedPopupClass: string = 'checkiconDefault';
  resetPopUpClass() {
    this.isEnablePopup = false;
  }
  closePopup() {
    this.onClickRefresh();
  }

  /************ Put on Marketplace Popup Checks ********** */

  isShowPopupCancel: boolean = false;
  isEnablePopupCancel: boolean = true;
  isCancelPopupClass: string = 'checkiconDefault';
  isRemovePopupClass: string = 'checkiconDefault';
  isCancelCompletedPopupClass: string = 'checkiconDefault';

  resetCancelPopUpClass() {
    this.isEnablePopupCancel = false;
  }

  /************ Buy NFT Popup Checks ********** */

  isShowBuyNFTPopup: boolean = false;
  isBuyNFTEnablePopup: boolean = true;
  isBuyNFTCreateOrder: string = 'checkiconDefault';
  isBuyNFTCompletedPopupClass: string = 'checkiconDefault';

  resetBuyNFTPopUpClass() {
    this.isBuyNFTEnablePopup = false;
  }

  /************ Create Bid NFT Popup Checks ********** */

  isShowBidNFTPopup: boolean = false;
  isBidNFTEnablePopup: boolean = true;
  isBidNFTApprove: string = 'checkiconDefault';
  isBidNFTSign:string = 'checkiconDefault';
  isBidNFTCreateBid: string = 'checkiconDefault';

  resetBidNFTPopUpClass() {
    this.isBidNFTEnablePopup = false;
  }

/************ Accept Bid NFT Popup Checks ********** */

isShowAcceptBidNFTPopup: boolean = false;
isAcceptBidNFTEnablePopup: boolean = true;
isAcceptBidNFTSign:string = 'checkiconDefault';
isAcceptBidNFTCompleteOrder:string = 'checkiconDefault';
isAcceptBidNFTApprove: string = 'checkiconDefault';
isAcceptBidNFTCreateBid: string = 'checkiconDefault';

resetAcceptBidNFTPopUpClass() {
  this.isAcceptBidNFTEnablePopup = false;
}

  auct_time: any = {
    mins: 0,
    secs: 0,
    hours: 0,
  };
  showObj: any = {
    wallet_address: localStorage.getItem('sWalletAddress'),
    showBidCurrent: 'show',
    showTransferCurrent: 'hide',
    showBuyCurrent: 'show',
  };
  constructor(
    private _formBuilder: FormBuilder,
    private _script: ScriptLoaderService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private _route: ActivatedRoute,
    private toaster: ToastrService,
    private apiService: ApiService
  ) {
    if(!window.ethereum){
      this.toaster.error('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
   }

  ngOnDestroy() {
    clearInterval(this.interVal);
    var magnificPopup = $.magnificPopup.instance;
    // save instance in magnificPopup variable
    magnificPopup.close();
  }

  async ngOnInit() {
    let scripts: string[] = [];
   
    scripts = [
      '../../assets/js/jquery-3.5.1.min.js',
      '../../assets/js/bootstrap.bundle.min.js',
      '../../assets/js/owl.carousel.min.js',
      '../../assets/js/jquery.magnific-popup.min.js',
      '../../assets/js/select2.min.js',
      '../../assets/js/smooth-scrollbar.js',
      '../../assets/js/jquery.countdown.min.js',
      '../../assets/js/main.js',
    ];
    
    await this.apiService.getprofile().subscribe((res: any) => {

      if (res && res['data']) {
        this.profileData = res['data'];
        this.userStatus=this.profileData.sStatus;
        if(this.profileData.sStatus ==='deactivated'){
          this.toaster.error("Your Account is deactivated by Admin")
          return;
        };
      
       
      
       
      }

    }, (err: any) => {

    });

    this._script.loadScripts('app-nft-detail', scripts).then(function () { });
    this.buildBidForm();
    this.buildTransferForm();
    this.buildBUYForm(0);
    this.buildSALEForm();
    this.buildCHANGEPRICEForm();
    this.buildTIMEDAUCTIONForm();
    let connect:any=localStorage.getItem('connected')
    if(connect=='true'){
      this.connect=true
       this.account = await this.apiService.connect();
    }else{
      
      this.connect=false;
    }
   
    if(connect!=null){
      
      let contract = await this.apiService.exportInstance(
        contracts.MARKETPLACE,
        marketPlaceABI.abi
      );
      this.marketPlace = contract;
    }
   


    let id = this._route.snapshot.params['id'];
    if (id && id != null && id != undefined && id != '') {
      await this.getNFTViewData(id);
      await this.getNFTOwnerData(id);
     let nftall= await this.getNFTOwnerAllData(id);
     

      await this.getBidHistory(id);

      await this.getnftAllAuctionBidsdata(id);
      await this.getnftCurrentAuctionBids(id);
      await this.getCurrentAuctionBidsList(id);
      
      if (
        localStorage.getItem('Authorization') &&
        localStorage.getItem('Authorization') != null
      ) {
        this.isLogin = true;
      
     
        await this.getColoboraterList();
      }
    } else {
      this.toaster.info('There is some issue with route.');
      this.router.navigate(['']);
    }
  }

  buildCHANGEPRICEForm() {
    this.changePriceForm = this._formBuilder.group({
      nBasePrice: ['', [Validators.required]],
    });
  }
  buildTIMEDAUCTIONForm() {
    this.timedAuctionForm = this._formBuilder.group({
      type: ['Auction', [Validators.required]],
      days: ['', []],
    });
  }

  buildBidForm() {
    this.bidForm = this._formBuilder.group({
      nQuantity: ['1', [Validators.required]],
      nBidPrice: ['', [Validators.required]],
    });
  }

  buildTransferForm() {
    this.transferForm = this._formBuilder.group({
      nQuantity: ['1', [Validators.required]],
      oRecipient: ['', [Validators.required, Validators.pattern('^0x[a-fA-F0-9]{40}$')]],
    });
  }
  buildBUYForm(price) {
    this.buyForm = this._formBuilder.group({
      nQuantity: ['1', [Validators.required]],
      nBidPrice: [{ value: price, disabled: true }, [Validators.required]],
    });
  }

  buildBUYFormOwner(price, quantity) {
    this.buyFormOwner = this._formBuilder.group({
      nQuantity: [quantity, [Validators.required]],
      nBidPrice: [{ value: price, disabled: true }, [Validators.required]],
    });
  }

  buildSALEForm() {
    this.saleForm = this._formBuilder.group({
      nQuantity: ['1', [Validators.required]],
      orderPrice: ['', [Validators.required]],
      eAuctionType: ['Fixed Sale', [Validators.required]],
    });
  }

  toTypedOrder(
    account,
    tokenAddress,
    id,
    quantity,
    listingType,
    paymentTokenAddress,
    valueToPay,
    deadline,
    bundleTokens,
    bundleTokensQuantity,
    salt
  ) {
    const domain = {
      chainId: 80001,
      name: 'Decrypt Marketplace',
      verifyingContract: contracts.MARKETPLACE,
      version: '1',
    };

    const types = {
      Order: [
        { name: 'user', type: 'address' },
        { name: 'tokenAddress', type: 'address' },
        { name: 'tokenId', type: 'uint256' },
        { name: 'quantity', type: 'uint256' },
        { name: 'listingType', type: 'uint256' },
        { name: 'paymentToken', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'deadline', type: 'uint256' },
        { name: 'bundleTokens', type: 'uint256[]' },
        { name: 'bundleTokensQuantity', type: 'uint256[]' },
        { name: 'salt', type: 'uint256' },
      ],
    };

    const value = {
      user: account,
      tokenAddress: tokenAddress,
      tokenId: id,
      quantity: quantity,
      listingType: listingType,
      paymentToken: paymentTokenAddress,
      value: valueToPay,
      deadline: deadline,
      bundleTokens: bundleTokens,
      bundleTokensQuantity: bundleTokensQuantity,
      salt: salt,
    };

    return { domain, types, value };
  }

  //GETTING SIGNATURE FUNCTION

  async getSignature(signer, args) {
    const order = this.toTypedOrder.apply(null, args);
    let provider = new ethers.providers.Web3Provider(window.ethereum);

    const signer1 = provider.getSigner();

    const signedTypedHash = await signer1._signTypedData(
      order.domain,
      order.types,
      order.value
    );

    const sig = ethers.utils.splitSignature(signedTypedHash);

    return [sig.v, sig.r, sig.s];
  }

  getColoboraterList() {
    this.apiService.getColoboraterList().subscribe(
      (res: any) => {
        if (res && res['data']) {
          this.collaboratorList = res['data'];
        }
      },
      (err: any) => { }
    );
  }



  copyInputMessage(inputElement:any) {  
   
    let text=this.NFTData.sCollection
    navigator.clipboard.writeText(text).then().catch(e => console.error(e));
    this.toaster.success("Copied!")    
  } 


 

  onClickRadio(type: any) {
    this.saleType = type;

    if (type == 'Auction' || 'Fixed Sale') {
      // this.saleForm.controls['nBasePrice'].clearValidators();
      // this.saleForm.controls['nBasePrice'].updateValueAndValidity();
    } else {
      // this.saleForm.controls['nBasePrice'].setValidators([
      //   Validators.required,
      // ]);
      // this.saleForm.controls['nBasePrice'].updateValueAndValidity();
    }
  }

  getNFTViewData(id: any) {
    
    this.apiService.viewnft(id).subscribe(
      async (data: any) => {
        if (data && data['data']) {
          let res = await data['data'];

          this.NFTData = res;

          console.log("this is nft data ----->",this.NFTData)

          this.nftERC721Type = this.NFTData.erc721;
       

          this.CurrentUserID = res.loggedinUserId;
        
          if (res.erc721) {
            this.tokenType = true;
           
          } else {
            this.tokenType = false;
            this.ShowBuyBtnERC1155 = true;
            
          }
      

        
          

          if (this.NFTData.nTokenID && this.NFTData.nTokenID != undefined) {
            // tokenHistoryData
            let history=this.getTokenHistory(this.NFTData.nTokenID);
            
          }

          // token
          // tokenHistory  nTokenID
        } else {
        }
      },
      (error) => {
        if (error) {
        }
      }
    );
  }

  getselectedNFTOwnerData(id: any) {
   

    this.apiService.viewselectednftOwner(id).subscribe(
      async (data: any) => {
        if (data && data['data']) {
          let res = await data['data'];

          this.SelectedNFTOwnerData = res;
          
          this.nftCurrentOwner = this.SelectedNFTOwnerData[0]['oNFTOwnerDetails'][0]['_id'];
          this.nftTypeSaleAuction = this.SelectedNFTOwnerData[0]['eAuctionType'];
        

          if (
            (this.SelectedNFTOwnerData.oCurrentOwner &&
              this.SelectedNFTOwnerData.oCurrentOwner.sWalletAddress ==
              this.showObj.wallet_address) ||
            this.SelectedNFTOwnerData.eAuctionType == 'Fixed Sale'
          ) {
            this.showObj.showBidCurrent = 'hide';
          }
          if (
            this.SelectedNFTOwnerData.oCurrentOwner &&
            this.SelectedNFTOwnerData.oCurrentOwner.sWalletAddress ==
            this.showObj.wallet_address
          ) {
            this.showObj.showTransferCurrent = 'show';
          }

          if (
            (this.SelectedNFTOwnerData.eAuctionType == 'Auction' ||
              this.SelectedNFTOwnerData.eAuctionType == '' ||
              (this.SelectedNFTOwnerData.oCurrentOwner &&
                this.SelectedNFTOwnerData.oCurrentOwner.sWalletAddress ==
                this.showObj.wallet_address)) &&
            this.SelectedNFTOwnerData.sTransactionStatus == 1
          ) {
            this.showObj.showBuyCurrent = 'hide';
            this.ShowAuctionBids = true;
          }

          if (
            this.SelectedNFTOwnerData.auction_end_date != undefined &&
            this.SelectedNFTOwnerData.auction_end_date != null &&
            this.SelectedNFTOwnerData.auction_end_date &&
            this.SelectedNFTOwnerData.auction_end_date != ''
          ) {
            this.interVal = setInterval(async () => {
              let currentStarttime: any = new Date().getTime();
              let endDate: any = new Date(
                this.SelectedNFTOwnerData.auction_end_date
              ).getTime();

              let diff = parseInt(endDate) - parseInt(currentStarttime);
              if (diff && diff != undefined && diff != null && diff > 0) {
                await this.ConvertSectoDay(diff / 1000);
              }
            }, 2000);
          }

          if (
            this.SelectedNFTOwnerData.nBasePrice &&
            this.SelectedNFTOwnerData.nBasePrice != undefined
          ) {
            this.NFTBase_Price =
              this.SelectedNFTOwnerData.nBasePrice['$numberDecimal'];
            if (this.nftTypeSaleAuction == 'Fixed Sale') {
              if (
                this.nftBidAmt <
                this.SelectedNFTOwnerData.nBasePrice['$numberDecimal']
              ) {
                this.nftBidAmt =
                  this.SelectedNFTOwnerData.nBasePrice['$numberDecimal'];
              }
            }
            await this.buildSALEForm();
            this.buyForm.patchValue({
              nBidPrice: this.SelectedNFTOwnerData.nBasePrice['$numberDecimal'],
            });
          }
        } else {
        }
      },
      (error) => {
        if (error) {
        }
      }
    );
  }

  getselectedNftbids(nftID: any, ownerId: any) {
   
    this.nftBidAmt = 0;
    this.nftBidQty = 0;
    this.apiService.getSelectedAuctionBids(nftID, ownerId).subscribe(
      async (data: any) => {
        if (data && data['data']) {
          let res = await data['data'];
          if (res.length > 0) {
            
            if (res[0].nBidPrice && res[0].nBidPrice != 'undefined') {
             
              this.nftBidAmt = res[0].nBidPrice['$numberDecimal'];
              this.nftBidQty = res[0].nQuantity;
            }
           
          }
        }
      },
      (error) => { }
    );
  }

  async getNFTOwnerData(id: any) {
   

   await this.apiService.viewnftOwner(id).subscribe(
      async (data: any) => {
        if (data && data['data']) {
          let res = await data['data'];

          this.NFTOwnerData = res;
          
            console.log("nft owner data is---->",this.NFTOwnerData)
         
          this.nftCurrentOwner = this.NFTOwnerData.oCurrentOwner._id;
          this.nftTypeSaleAuction = this.NFTOwnerData.eAuctionType;

          

          if (
            (this.NFTOwnerData.oCurrentOwner &&
              this.NFTOwnerData.oCurrentOwner.sWalletAddress ==
              this.showObj.wallet_address) ||
            this.NFTOwnerData.eAuctionType == 'Fixed Sale'
          ) {
            this.showObj.showBidCurrent = 'hide';
          }
          if (
            this.NFTOwnerData.oCurrentOwner &&
            this.NFTOwnerData.oCurrentOwner.sWalletAddress ==
            this.showObj.wallet_address
          ) {
            this.showObj.showTransferCurrent = 'show';
          }

          if (
            (this.NFTOwnerData.eAuctionType == 'Auction' ||
              this.NFTOwnerData.eAuctionType == '' ||
              (this.NFTOwnerData.oCurrentOwner &&
                this.NFTOwnerData.oCurrentOwner.sWalletAddress ==
                this.showObj.wallet_address)) &&
            this.NFTOwnerData.sTransactionStatus == 1
          ) {
            this.showObj.showBuyCurrent = 'hide';
            this.ShowAuctionBids = true;
          }

          if (
            this.NFTOwnerData.auction_end_date != undefined &&
            this.NFTOwnerData.auction_end_date != null &&
            this.NFTOwnerData.auction_end_date &&
            this.NFTOwnerData.auction_end_date != ''
          ) {
            this.interVal = setInterval(async () => {
              let currentStarttime: any = new Date().getTime();
              let endDate: any = new Date(
                this.NFTOwnerData.auction_end_date
              ).getTime();

              let diff = parseInt(endDate) - parseInt(currentStarttime);
              if (diff && diff != undefined && diff != null && diff > 0) {
                await this.ConvertSectoDay(diff / 1000);
              }
            }, 2000);
          }

          if (
            this.NFTOwnerData.nBasePrice &&
            this.NFTOwnerData.nBasePrice != undefined
          ) {
            this.NFTBase_Price = this.NFTOwnerData.nBasePrice['$numberDecimal'];
            if (this.nftTypeSaleAuction == 'Fixed Sale') {
              if (
                this.nftBidAmt < this.NFTOwnerData.nBasePrice['$numberDecimal']
              ) {
                this.nftBidAmt = this.NFTOwnerData.nBasePrice['$numberDecimal'];
              }
            }
            await this.buildSALEForm();
            this.buyForm.patchValue({
              nBidPrice: this.NFTOwnerData.nBasePrice['$numberDecimal'],
            });
          }
        } else {
        }
      },
      (error) => {
        if (error) {
        }
      }
    );
  }

  priceValidation(event:any){
    
    const charCode = (event.which) ? event.which : event.keyCode;
   
  
    if (charCode == 46) {
     
      return true;
    }
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
 
  }

  async getNFTOwnerAllData(id: any) {
  
    await this.apiService.getAllnftOwner(id).subscribe(
      async (data: any=[]) => {
        if (data && data['data']) {
          let res = await data['data'];
         
          this.NFTAllOwnerData = res;
          console.log("nft all owner data is--->",this.NFTAllOwnerData)
          
          let isAuction = 0;
          let isSalesType = 0;
          res.forEach(function (val) {
         
            if(val.eAuctionType == "Auction"){
              isAuction = 1;
            }
            if(val.eAuctionType == "Fixed Sale"){
              isSalesType = 1;
            }
          }); 
          if(isAuction == 1 && isSalesType == 1){
            this.NFTAuctionType = "Auction|Fixed Sale";
          }else if(isAuction == 1){
            this.NFTAuctionType = "Auction";
          }else if(isSalesType == 1){
            this.NFTAuctionType = "Fixed Sale";
          }else{
            this.NFTAuctionType = "-";
          }
          

        } else {
        }
      },
      (error) => { }
    );
  }

  getTokenHistory(id: any) {
    this.apiService.tokenHistory(id, {}).subscribe(
      async (data: any) => {
       
        if (data && data['data']) {
          let res = await data['data'];
          this.tokenHistoryData = res['data'];
        } else {
        }
      },
      (error) => {
        if (error) {
        }
      }
    );
  }

  getBidHistory(id: any) {
    this.apiService.bidHistory(id, {}).subscribe(
      async (data: any) => {
        
        if (data && data['data']) {
          let res = await data['data'];
          this.historyData = res['data'];
        } else {
        }
      },
      (error) => {
        if (error) {
        }
      }
    );
  }

  
  checkBuyQNT(e: any) {
   
    let selownerQty = parseInt(this.SelectedNFTOwnerData[0]['nQuantity'])-parseInt(this.SelectedNFTOwnerData[0]['nQuantityLeft']);
    
    if (e.target.value) {
      if (parseInt(e.target.value) <= selownerQty) {
        this.bidForm.patchValue({ nQuantity: parseInt(e.target.value) });
      } else {
        this.bidForm.patchValue({ nQuantity: '' });
        this.toaster.info('Quantity exceeding NFT quantity.');
      }
    } else {
      this.bidForm.patchValue({ nQuantity: '' });
    }
  }
  checkBuyQNTT(e: any) {
    if (e.target.value) {
      if (parseInt(e.target.value) <= parseInt(this.NFTOwnerData.nQuantity)) {
        this.transferForm.patchValue({ nQuantity: parseInt(e.target.value) });
      } else {
        this.transferForm.patchValue({ nQuantity: '' });
        this.toaster.info('Amount exceeding NFT quantity.');
      }
    } else {
      this.transferForm.patchValue({ nQuantity: '' });
    }
  }
  checkBuyBQNTPutOnSale(e: any) {
    if (e.target.value) {
      if (parseFloat(e.target.value) <= parseInt(this.NFTOwnerData.nQuantity)) {
      } else {
        this.saleForm.patchValue({ nQuantity: '' });
        this.toaster.info('Quantity exceeding NFT Available quantity.');
      }
    } else {
      this.saleForm.patchValue({ nQuantity: '' });
    }
  }

  checkBuyBQNT(e: any) {
    if (e.target.value) {
      if (parseFloat(e.target.value) <= parseInt(this.NFTData.nQuantity)) {
      } else {
        this.buyForm.patchValue({ nQuantity: '' });
        this.toaster.info('Amount exceeding NFT quantity.');
      }
    } else {
      this.buyForm.patchValue({ nQuantity: '' });
    }
  }

  checkBuyBQNTOwner(e: any, price) {
    if (e.target.value) {
      if (parseFloat(e.target.value) <= parseInt(price)) {
      } else {
        this.buyForm.patchValue({ nQuantity: '' });
        this.toaster.info('Amount exceeding NFT quantity.');
      }
    } else {
      this.buyForm.patchValue({ nQuantity: '' });
    }
  }
  // nQuantity: ['', [Validators.required]],
  // nBidPrice: ['', [Validators.required]],

  clearInput(e:any){

  }

  checkBidPrice(e: any) {
    
    let selOwnerPrice = parseFloat(this.SelectedNFTOwnerData[0]['nBasePrice'].$numberDecimal);
    
    if (e.target.value) {
      if ( parseFloat(e.target.value) >= parseFloat(this.nftBidAmt) && parseFloat(e.target.value) >= selOwnerPrice ) {
        this.bidForm.patchValue({ nBidPrice: parseFloat(e.target.value) });
      } else {
        this.bidForm.patchValue({ nBidPrice: '' });
        if(this.nftBidAmt === 0){
          this.toaster.info('Bid Amount Must be greater than or Equal to ' + selOwnerPrice);
        }else{
          this.toaster.info('Bid Amount Must be greater than or Equal to ' + this.nftBidAmt);
        }
        
      }
    } else {
      this.bidForm.patchValue({ nBidPrice: '' });
    }
  }

  getnftAllAuctionBidsdata(id: any) {
   
    this.apiService.getAuctionBidsHistory(id, {}).subscribe(
      async (data: any) => {
      
        if (data && data['data']) {
          let res = await data['data'];
       
          this.nftAllAuctionBidsdata = res['data'];
        }
      },
      (error) => { }
    );

  
  }
  getCurrentAuctionBidsList(id: any) {
  
    this.apiService.getCurrentAuctionBidsList(id).subscribe(
      async (data: any) => {
        if (data && data['data']) {
          let res = await data['data'];
          
          this.nftCurrentAuctionBidsList = res;
        }
      },
      (error) => { }
    );
  }
  getnftCurrentAuctionBids(id: any) {
  
    this.apiService.getCurrentAuctionBids(id).subscribe(
      async (data: any) => {
        if (data && data['data']) {
          let res = await data['data'];
         
          this.nftCurrentAuctionBids = res;
          if (
            this.nftCurrentAuctionBids &&
            this.nftCurrentAuctionBids[0] &&
            this.nftCurrentAuctionBids[0].nBidPrice &&
            this.nftCurrentAuctionBids[0].nBidPrice != 'undefined'
          ) {
           
            if (
              this.nftBidAmt <
              this.nftCurrentAuctionBids[0].nBidPrice['$numberDecimal']
            ) {
              this.nftBidAmt =
                this.nftCurrentAuctionBids[0].nBidPrice['$numberDecimal'];
            }
            if (this.nftBidQty < this.nftCurrentAuctionBids[0].nQuantity) {
              this.nftBidQty = this.nftCurrentAuctionBids[0].nQuantity;
            }
          }
      
        }
      },
      (error) => { }
    );
  }

  //NFT BUY
  async buyNft() {
    
   
//checking owner of nft

let type=this.NFTData;

if (type.erc721) {
  let cAddress=this.sellerOrder[1];
  var NFTinstance: any = await this.apiService.exportInstance(
    cAddress,
     extendedERC721.abi
  );
  console.log("extended erc721 instance is----------->",NFTinstance)

} else {

  
}

    
   
    const options = {
      from: this.account[0],
      gasPrice: 10000000000,
      gasLimit: 9000000,
      value: this.buyerOrder[6],
    };

    let sellerSign = [
      this.sellerSign[0],
      this.sellerSign[1],
      this.sellerSign[2],
    ];

  
    try {
      let completeOrder = await this.marketPlace.completeOrder(
        this.sellerOrder,
        sellerSign,
        this.buyerOrder,
        sellerSign,
        options
      );

      let result = await completeOrder.wait();
    
      if (result === '') {
       
      }
      return result;
    } catch (e) {
     
      return e;
    }
  }

  async putOnAuctionNFT() {
    try {
      var erc20Contract: any = await this.apiService.exportInstance(
        contracts.ERC20,
        erc20
      );
    

      let uBalance=await erc20Contract.balanceOf(this.account[0]);
     
      let a=uBalance.toString();

      

     
      let allowwance = await erc20Contract.allowance(
        this.account[0],
        contracts.MARKETPLACE
      );
      allowwance = allowwance.toString();
      let userBalance=new BigNumber(parseInt(a,10))
      .dividedBy(new BigNumber(10).exponentiatedBy(18)).toString();
      

      let res = new BigNumber(allowwance)
        .dividedBy(new BigNumber(10).exponentiatedBy(18))
        .toString();
    
      let userApprovalAmmount = parseInt(res, 10);
     

      let nftAmmount = new BigNumber(parseInt(this.buyerOrder[6], 10))
        .dividedBy(new BigNumber(10).exponentiatedBy(18))
        .toString();

      let ammountToPay = parseFloat(nftAmmount);

  

      let uBalanceInWallet=parseFloat(userBalance);

      if(uBalanceInWallet<ammountToPay){
        this.toaster.error("Insufficient Balance");
        this.isBidNFTApprove = "errorIcon";
        this.resetBidNFTPopUpClass();
        return 0;
      }


      if (userApprovalAmmount < ammountToPay) {
      
        let approve = await erc20Contract.approve(
          contracts.MARKETPLACE,
          '100000000000000000000000000000000000'
        );

        
        this.isBidNFTApprove = "checkiconCompleted";
        return approve;
      }
      
      return allowwance;
    } catch (error) {
      this.toaster['error'](
        error.code == 4001
          ? 'You Denied MetaMask Transaction Signature'
          : 'Something Went Wrong!'
      );
      this.isBidNFTApprove = "errorIcon";
      
    }
  }

  //REMOVE FROM SALE
  async removeFromSale() {
  
    try {
      let transactionStatus:any;
      let id = this._route.snapshot.params['id'];
      
    if (id && id != null && id != undefined && id != ''){
      await this.apiService.viewnftOwner(id).subscribe(async (data:any)=>{
        if (data && data['data']) {
          let res = await data['data'];
          
       
          transactionStatus=res.sTransactionStatus
          if(res.sTransactionStatus===-2){
          
            this.toaster.error("This NFT is suspended by admin")
            this.isShowPopupCancel=false
            this.onClickRefresh()
            return;
          }
        }
      })
    }
    
      
  if(transactionStatus===-2){
    this.toaster.error("This NFT is suspended by admin")
    this.isShowPopupCancel=false
    return;
  }
      
    
      
      await this.apiService.getprofile().subscribe((res: any) => {

        if (res && res['data']) {
          this.profileData = res['data'];
        
          if(this.profileData.sStatus ==='deactivated'){
            this.isActive=false
            this.toaster.error("Your Account is deactivated by Admin")
            this.isShowPopupCancel=false
            return;
          };
          if(this.profileData.sStatus ==='blocked'){
            this.isActive=false
            this.toaster.error("Your Account is Temporarily suspended by Admin")
            this.isShowPopupCancel=false
            return;
          };
          this.userStatus=this.profileData.sStatus;
        
        
         
        }
  
      }, (err: any) => {
          
      });
      if(this.isActive==false){
        return;
      }
    
     
      this.isShowPopupCancel = true;
      let res1 = this.saleForm.value;
      

      let res = this.NFTOwnerData;

      let type = this.NFTData;

      let SellerOrder = Object.assign({}, res.sOrder);
      let Signature = res.sSignature;

      

      let nftContract = res.sOrder[1];

      let newSellerOrder = Object.values(SellerOrder);
     

      let sOrder: any = [];

      for (const key in SellerOrder) {
        let index = parseInt(key);

        switch (index) {
          case 0:
            if (type.erc721) {
              sOrder.push(SellerOrder[key]);
            } else {
              sOrder.push(SellerOrder[key]);
            }
            break;

          case 1:
            sOrder.push(SellerOrder[key]);
            break;

          case 3:
            if (type.erc721 === true) {
              sOrder.push(SellerOrder[key]);
            } else {
              sOrder.push(SellerOrder[key]);
            }
            break;

          case 5:
            sOrder.push(SellerOrder[key]);
            break;

          case 6:
            this.NFTprice = SellerOrder[key];
            if (type.erc721 === true) {
              sOrder.push(SellerOrder[key]);
            } else {
              sOrder.push(SellerOrder[key]);
            }
            break;

          case 8:
            sOrder.push([]);
            break;

          case 9:
            sOrder.push([]);
            break;

          default:
            sOrder.push(parseInt(SellerOrder[key]));
        }
      }

      let sellerSign = [Signature[0], Signature[1], Signature[2]];
     
      this.isCancelPopupClass = 'clockloader';
      //let cancelOrder = await this.marketPlace.cancelOrder(sOrder, sellerSign);
      let cancelOrder: any;
      try {
        if(this.profileData.sStatus ==='blocked'){
          this.isCancelPopupClass = 'errorIcon';
        this.resetCancelPopUpClass();
          return;
        }
        cancelOrder = await this.marketPlace.cancelOrder(sOrder, sellerSign);

      } catch (error) {
        this.toaster['error'](
          error.code == 4001 ? 'You Denied MetaMask Transaction Signature' : 'Something Went Wrong!'
        );
        this.isCancelPopupClass = 'errorIcon';
        this.resetCancelPopUpClass();
        return;
      }
     
      this.isCancelPopupClass = 'checkiconCompleted';
      this.isRemovePopupClass = 'clockloader';
      let qntyOnSale = this.NFTOwnerData.nQuantity - this.NFTOwnerData.nQuantityLeft;

      let data = {
        _id: this.NFTData._id,
        eAuctionType: "Unlockable",
        nftownerID: this.NFTOwnerData._id,
        sTransactionStatus: -99,
        sOrder: newSellerOrder,
        sSignature: Signature,
        nBasePrice: 0.01,
        putOnSaleQty: -qntyOnSale,
        erc721: type.erc721,
        nftID: res.nftId,
        oCurrentOwner: res.oCurrentOwner._id,
        action:"removeonsale",
      };

      if (
        localStorage.getItem('Authorization') &&
        localStorage.getItem('Authorization') != null
      ) {
        let res1 = await this.apiService.updateNFTOrder(data).subscribe(
          async (transData: any) => {
          
            this.isPutOnSalePopupClass = 'checkiconCompleted';
            this.isCompletedPopupClass = 'checkiconCompleted';
            if (
              transData &&
              transData['message'] &&
              transData['message'] == 'Order Created success'
            ) {
              this.toaster.success('NFT REMOVE FROM SALE .', 'Success!');
              this.isRemovePopupClass = 'checkiconCompleted';
              this.resetCancelPopUpClass();
              // this.onClickRefresh();
            }
          },
          (err: any) => {
            if (err) {
             
              err = err['error'];
              if (err) {
                this.toaster.error(err['message'], 'Error!');
              }
            }
            this.isCancelPopupClass = 'errorIcon';
            this.resetCancelPopUpClass();
            return;
          }
        );
      } else {
        // this.router.navigate(['']);
        this.isShowPopupCancel = false;
        this.toaster.error('Please sign in first.', 'Error');
      }

      //smart contract functionality
    } catch (e) {
      this.toaster.error("Something Went Wrong!!")
     }
  }

  //TRANSFER

  async transferNFT() {
    let collection = this.NFTData.sCollection;
    try {
      if (this.NFTData.erc721) {
        let erc721Contract = await this.apiService.exportInstance(
          collection,
          simpleERC721ABI.abi
        );
       
      } else {
        let erc1155Contract = await this.apiService.exportInstance(
          collection,
          simpleERC1155ABI.abi
        );
        
      }
    } catch (error) {
      
      this.toaster['error'](
        error.code == 4001
          ? 'You Denied MetaMask Transaction Signature'
          : 'Something Went Wrong!'
      );
    }
  }

  async onClickSubmitBID() {
    if (
      localStorage.getItem('Authorization') &&
      localStorage.getItem('Authorization') != null
    ) {
      let connect=localStorage.getItem('connected');
      if(connect=='false'){
        this.toaster.error("Connect Your Metamask")
        return;
      }
      this.isShowBidNFTPopup = true;
      this.submitted1 = true;
      if (this.bidForm.invalid) {
        
        this.isShowBidNFTPopup = false;
        return;
      } else {
        
        let res1 = this.bidForm.value;
        if (parseInt(res1.nQuantity) < parseInt(this.nftBidQty)) {
          this.toaster.info('Quantity must be greater than ' + this.nftBidQty);
          this.resetBidNFTPopUpClass();
          return;
        }

        if (
          parseInt(res1.nQuantity) == parseInt(this.nftBidQty) &&
          parseFloat(res1.nBidPrice) == parseFloat(this.nftBidAmt)
        ) {
         
          this.toaster.info('Please update Qty/Price  ');
          this.resetBidNFTPopUpClass();
          return;
        }

        //creating order for BidType selling

        let res = this.SelectedNFTOwnerData;
        let res2 = this.NFTData;
        let SellerOrder = Object.assign({}, res[0]['sOrder']);

        for (const key in SellerOrder) {
          let index = parseInt(key);
         

          switch (index) {
            case 0:
              if (res.erc721) {
                this.sellerOrder.push(SellerOrder[key]);
                this.buyerOrder.push(this.account[0]);
                break;
              } else {
                this.sellerOrder.push(this.currentOwnersaccount);
                this.buyerOrder.push(this.account[0]);
                break;
              }
            case 1:
              this.sellerOrder.push(SellerOrder[key]);
              this.buyerOrder.push(SellerOrder[key]);
              break;
            case 3:
              let q = SellerOrder[key];
              let sellerQuantity = parseInt(q, 10);
              this.sellerOrder.push(sellerQuantity);
             
              let bQuant = this.bidForm.value.nQuantity;
              let quantity = parseInt(bQuant, 10);

              this.buyerOrder.push(quantity);
              break;
            case 5:
              this.sellerOrder.push(SellerOrder[key]);
              this.buyerOrder.push(SellerOrder[key]);
              break;
            case 6:
              this.NFTprice = SellerOrder[key];
              if (res2.erc721) {
                let price = this.bidForm.value.nBidPrice.toString();
                let sPrice = SellerOrder[key].toString();
               

                this.sellerOrder.push(SellerOrder[key]);
                this.buyerOrder.push(ethers.utils.parseEther(price).toString());
              } else {
                let Quant = parseInt(this.bidForm.value.nQuantity, 10);
                this.NFTprice = this.currentOwnersOrder;
                let price = this.bidForm.value.nBidPrice;

                let totalAmmount = (price * Quant).toString();
             
                this.buyerOrder.push(
                  ethers.utils.parseEther(totalAmmount).toString()
                );

                this.sellerOrder.push(this.currentOwnersOrder);
              }
              break;
            case 8:
              this.sellerOrder.push([]);
              this.buyerOrder.push([]);
              break;
            case 9:
              this.sellerOrder.push([]);
              this.buyerOrder.push([]);
              break;
            default:
              this.sellerOrder.push(parseInt(SellerOrder[key]));
              this.buyerOrder.push(parseInt(SellerOrder[key]));
          }
        }
      
        // let buyerSignature = await this.getSignature( this.account[0], this.buyerOrder );
        this.isBidNFTSign = 'clockloader';
        let buyerSignature: any;
        try {
          
          buyerSignature = await this.getSignature( this.account[0], this.buyerOrder );
         
        } catch (error) {
         
          this.toaster['error']( error.code == 4001 ? 'You Denied MetaMask Transaction Signature' : 'Something Went Wrong!' );
          this.isBidNFTSign = 'errorIcon';
          this.resetBidNFTPopUpClass();
          return;
        }
        this.isBidNFTSign ="checkiconCompleted";
       

        
        
        if (
          parseFloat(res1.nBidPrice) >=
          parseFloat(this.SelectedNFTOwnerData[0]['nBasePrice'].$numberDecimal)
        ) {
          // let price: any = parseFloat(res1.nBidPrice) * parseFloat(res1.nQuantity);

          let price: any = parseFloat(res1.nBidPrice);
          if (this.NFTData.erc721 === true) {
            price = parseFloat(res1.nBidPrice);
          }

         
          let obj = {
            oRecipient: this.nftSelectedOwner,
            eBidStatus:
              this.SelectedNFTOwnerData['eAuctionType'] == 'Fixed Sale'
                ? 'Sold'
                : 'Bid',
            nBidPrice: parseFloat(price),
            nQuantity: res1.nQuantity,
            oNFTId: this.NFTData['_id'],
            sTransactionHash: '',
            sTransactionStatus: 1,
            nTokenID:parseInt(SellerOrder[2],10),
            buyerSignature: buyerSignature,
            buyerOrder: this.buyerOrder,
            sOwnerEmail:
              this.SelectedNFTOwnerData.oCurrentOwner &&
                this.SelectedNFTOwnerData.oCurrentOwner.sEmail &&
                this.SelectedNFTOwnerData.oCurrentOwner.sEmail != undefined
                ? this.SelectedNFTOwnerData.oCurrentOwner.sEmail
                : '-',
          };
          var ERC20instance: any = await this.apiService.exportInstance(
            contracts.ERC20,
            erc20
          );
          
          if (ERC20instance && ERC20instance != undefined) {
            // this.spinner.hide();

            try {
              this.isBidNFTApprove = "clockloader";
              let res2 = await this.putOnAuctionNFT();
             
              if(res2 != 0){
                // let blockNumber = await window.web3.currentProvider.getBlockNumber();

              // window.web3.currentProvider.getBlock(blockNumber).then((result) => {console.log("Rressu",result)});

              var web3 = new Web3(
                'https://polygon-mumbai.g.alchemy.com/v2/kkTx-ajifJW76PdLgXFlRK01nv04F-0F'
              );
              let blockNumber = await web3.eth.getBlockNumber();
              let hash;
              await web3.eth.getBlock(blockNumber).then((result) => {
                hash = result.hash;
              });

             
              obj['sTransactionHash'] = hash;
              this.isBidNFTApprove = "checkiconCompleted";
              this.isBidNFTCreateBid = "clockloader";
              await this.apiService
                .bidCreate(obj)
                .subscribe(async (transData: any) => {
                  if (transData && transData['data']) {
                    this.toaster.success('Bid placed successfully', 'Success!');
                    // var magnificPopup = $.magnificPopup.instance;
                    // // save instance in magnificPopup variable
                    // magnificPopup.close();
                    // this.router.navigate(['/my-profile'])
                    // await this.router.navigate(['/my-profile'], {
                    //   relativeTo: this._route,
                    //   queryParams: {
                    //     tab: 'bid',
                    //   },
                    // });
                    

                    // this.onClickRefresh();
                  } else {
                    this.toaster.success(transData['message'], 'Success!');
                  }
                  this.isBidNFTCreateBid = "checkiconCompleted";
                  this.resetBidNFTPopUpClass();
                });
              }
            } catch (error) {
             

              this.toaster['error'](
                error.code == 4001
                  ? 'You Denied MetaMask Transaction Signature'
                  : 'Something Went Wrong!'
              );
              this.isBidNFTCreateBid = "errorIcon";
            }
          } else {
            this.resetBidNFTPopUpClass();
            this.toaster.error(
              'There is something issue with NFT address.',
              'Error!'
            );
          }
        } else {
          this.resetBidNFTPopUpClass();

          this.bidForm.patchValue({ nBidPrice: '' });
          this.toaster.info(
            'Please enter minimum & greater then minimum Bid amount.',
            'Error!'
          );
        }
      }
    } else {
      // this.router.navigate(['']);
      this.toaster.error('Please sign in first.');
    }
  }

  //REMOVE FROM SALE

  async onClickCancelBid() {
    try {
      this.spinner.show();
      
      let data = {
        oNFTId: this.NFTData['_id'],
      };
      await this.apiService
        .removeAuctionBidRecords(data)
        .subscribe((res: any) => {
          this.spinner.hide();
          this.toaster.success('Bid Cancelled successfully', 'Success!');
          this.onClickRefresh();
        });
    } catch (error) {
      this.spinner.hide();
      this.toaster['error']('Something Went Wrong!');
    }
  }

  async onClickRejectBid(oBidder) {
    try {
      this.spinner.show();
      
      let data = {
        oNFTId: this.NFTData['_id'],
        oBidder: oBidder,
      };
      await this.apiService
        .rejectAuctionBidRecords(data)
        .subscribe((res: any) => {
          this.spinner.hide();
          this.toaster.success('Bid Rejected successfully', 'Success!');
          this.onClickRefresh();
        });
    } catch (error) {
      this.spinner.hide();
      this.toaster['error']('Something Went Wrong!');
    }
  }

  onClickRefresh() {
    window.location.reload();
  }

  //BUY NFT

  async onClickSubmitTransfer() {
    if (
      localStorage.getItem('Authorization') &&
      localStorage.getItem('Authorization') != null
    ) {
      if(this.profileData.sStatus ==='deactivated'){
        this.isActive=false;
        this.toaster.error("Your account is deactivated by Admin")
       };
       if(this.isActive==false){
        return;
      }
      this.spinner.show();
      this.submitted2 = true;
    
      if (this.transferForm.invalid) {
       
        this.spinner.hide();
        
      } else {
        let res = this.transferForm.value;
    
        let TransferQty = 0;
        if (this.NFTData.erc721) {
          TransferQty = 1;
        }else{
          TransferQty = res.nQuantity
        }
        let nTokenID =parseInt(this.NFTData.sOrder[2],10)
        let obj = {
          oRecipientWalletAddress: res.oRecipient,
          eBidStatus: 'Transfer',
          nBidPrice: '0',
          nQuantity: TransferQty,
          oNFTId: this.NFTData['_id'],
          sTransactionHash: '',
          nTokenID: nTokenID,
          erc721:this.NFTData.erc721,
        };
       
        var collection = this.NFTData.sCollection;
        var NFTinstance: any;
        var hash:any
        try {
          let transfer
          if (this.NFTData.erc721) {
            NFTinstance = await this.apiService.exportInstance( collection, simpleERC721ABI.abi );
            
            let owner=await NFTinstance.ownerOf(nTokenID);
            
            transfer=await NFTinstance.transferFrom(this.account[0],res.oRecipient,nTokenID);
          } else {
            NFTinstance = await this.apiService.exportInstance( collection, simpleERC1155ABI.abi );
 
            
            transfer=await NFTinstance.safeTransferFrom(this.account[0],res.oRecipient,nTokenID,TransferQty,[]);;

          }
         
          
         

               hash=transfer.hash
              
        } catch (error) {
          
          this.toaster['error'](
            error.code == 4001
              ? 'You Denied MetaMask Transaction Signature'
              : 'Something Went Wrong!'
          );
        }





        var NFTinstance: any = await this.apiService.exportInstance(
          environment.NFTaddress,
          environment.NFTabi
        );
        if (NFTinstance && NFTinstance != undefined) {
          this.spinner.hide();
          this.spinner.show();
          let collection = this.NFTData.sCollection;
    
    
          
            try{
              obj['sTransactionHash'] = hash;

              await this.apiService
                .transfer(obj)
                .subscribe(async (transData: any) => {
                  this.spinner.hide();
                  if (transData && transData['data']) {
                    this.toaster.success(
                      'NFT Transferred Successfully',
                      'Success!'
                    );
                    this.router.navigate(['']);
                    this.onClickRefresh();
                  } else {
                    this.toaster.success(transData['message'], 'Success!');
                  }
                });
            }catch(error){
              this.spinner.hide();

              this.toaster['error'](
                error.code == 4001
                  ? 'You Denied MetaMask Transaction Signature'
                  : 'Something Went Wrong!'
              );
            };
        } else {
          this.spinner.hide();
          this.toaster.error(
            'There is something issue with NFT address.',
            'Error!'
          );
        }
      }
    } else {
      // this.router.navigate(['']);
      this.toaster.error('Please sign in first.');
    }
  }

  async onClickSubmitBUY() {
    if (
      localStorage.getItem('Authorization') &&
      localStorage.getItem('Authorization') != null
    ) {
      
      let connect=localStorage.getItem('connected');
      if(connect=='false'){
        this.toaster.error("Connect Your Metamask")
        return;
      }
      
      this.isShowBuyNFTPopup = true;
      this.submitted3 = true;
      let id = this._route.snapshot.params['id'];
      // let res:any= await this.getNFTViewData(id)
      let res = this.NFTOwnerData;
     
      
      let SellerOrder = Object.assign({}, res.sOrder);
     

      let type = this.NFTData;

      

     
      if (Object.keys(SellerOrder).length === 0 && type.erc721 === false) {
        let res = this.NFTData;
        let SellerOrder = Object.assign({}, res.sOrder);
        for (const key in SellerOrder) {
          let index = parseInt(key);
         

          switch (index) {
            case 0:
              if (type.erc721) {
                this.sellerOrder.push(SellerOrder[key]);
                this.buyerOrder.push(this.account[0]);
                break;
              } else {
                this.sellerOrder.push(this.currentOwnersaccount);
                this.buyerOrder.push(this.account[0]);
                break;
              }
            case 1:
              this.sellerOrder.push(SellerOrder[key]);
              this.buyerOrder.push(SellerOrder[key]);
              break;
            case 3:
              if (type.erc721 === true) {
                let q = SellerOrder[key];
                let sellerQuantity = parseInt(q, 10);
                this.sellerOrder.push(sellerQuantity);

                this.buyerOrder.push(sellerQuantity);
              } else {
                let q = this.currOwnerTotalQuantity;
                let sellerQuantity = parseInt(q, 10);
                this.sellerOrder.push(sellerQuantity);
                
                let bQuant = this.buyForm.value.nQuantity;
                let quantity = parseInt(bQuant, 10);

                this.buyerOrder.push(quantity);
              }
              break;
            case 4:
             
              this.sellerOrder.push(parseInt(this.currentOwnerSaleType));
              this.buyerOrder.push(parseInt(this.currentOwnerSaleType));
              break;
            case 5:
              if (this.currentOwnerSaleType == 1) {
                this.sellerOrder.push(
                  '0xE47cd1c32F45E90d87dd74102Ee41529a6F30372'
                );
                this.buyerOrder.push(
                  '0xE47cd1c32F45E90d87dd74102Ee41529a6F30372'
                );
              } else {
                this.sellerOrder.push(
                  '0x0000000000000000000000000000000000000000'
                );
                this.buyerOrder.push(
                  '0x0000000000000000000000000000000000000000'
                );
              }
              break;
            case 6:
              this.NFTprice = SellerOrder[key];
              if (type.erc721 === true) {
                this.sellerOrder.push(SellerOrder[key]);
                this.buyerOrder.push(SellerOrder[key]);
              } else {
                let Quant = this.buyForm.value.nQuantity;
                this.NFTprice = this.currentOwnersOrder;
                let price = parseFloat(this.currentOwnerPrice);

                let totalAmmount = (price * Quant).toString();
                
                this.buyerOrder.push(
                  ethers.utils.parseEther(totalAmmount).toString()
                );

                this.sellerOrder.push(this.currentOwnersOrder);
              }

              break;

            case 7:
             
              if (type.erc721 === true) {
                this.sellerOrder.push(SellerOrder[key]);
                this.buyerOrder.push(SellerOrder[key]);
              } else {
                this.buyerOrder.push(this.currentOwnerTime);

                this.sellerOrder.push(this.currentOwnerTime);
              }

              break;
            case 8:
              this.sellerOrder.push([]);
              this.buyerOrder.push([]);
              break;
            case 9:
              this.sellerOrder.push([]);
              this.buyerOrder.push([]);
              break;
              
              case 10:
                
                if (type.erc721 === true) {
                  this.sellerOrder.push(parseInt(SellerOrder[key]));
                  this.buyerOrder.push(parseInt(SellerOrder[key]));
                } else {
                  
                  this.sellerOrder.push(this.currentOwnerSalt);
                  this.buyerOrder.push(this.currentOwnerSalt);
                }
    
                break;
            default:
              this.sellerOrder.push(parseInt(SellerOrder[key]));
              this.buyerOrder.push(parseInt(SellerOrder[key]));
          }
        }
      }

      for (const key in SellerOrder) {
        let index = parseInt(key);
       

        switch (index) {
          case 0:
            if (type.erc721) {
              this.sellerOrder.push(SellerOrder[key]);
              this.buyerOrder.push(this.account[0]);
              break;
            } else {
              this.sellerOrder.push(this.currentOwnersaccount);
              this.buyerOrder.push(this.account[0]);
              break;
            }
          case 1:
            this.sellerOrder.push(SellerOrder[key]);
            this.buyerOrder.push(SellerOrder[key]);
            break;
          case 3:
            if (type.erc721 === true) {
              let q = SellerOrder[key];
              let sellerQuantity = parseInt(q, 10);
              this.sellerOrder.push(sellerQuantity);

              this.buyerOrder.push(sellerQuantity);
            } else {
              let q = this.currOwnerTotalQuantity;
              let sellerQuantity = parseInt(q, 10);
              this.sellerOrder.push(sellerQuantity);
              
              let bQuant = this.buyForm.value.nQuantity;
              let quantity = parseInt(bQuant, 10);

              this.buyerOrder.push(quantity);
            }
            break;

          case 4:
            
            this.sellerOrder.push(parseInt(this.currentOwnerSaleType));
            this.buyerOrder.push(parseInt(this.currentOwnerSaleType));
            break;

          case 5:
            if (this.currentOwnerSaleType == 1) {
              this.sellerOrder.push(
                '0xE47cd1c32F45E90d87dd74102Ee41529a6F30372'
              );
              this.buyerOrder.push(
                '0xE47cd1c32F45E90d87dd74102Ee41529a6F30372'
              );
            } else {
              
              this.sellerOrder.push(
                '0x0000000000000000000000000000000000000000'
              );
              this.buyerOrder.push(
                '0x0000000000000000000000000000000000000000'
              );
            }

            break;
          case 6:
            this.NFTprice = SellerOrder[key];
            if (type.erc721 === true) {
              this.sellerOrder.push(SellerOrder[key]);
              this.buyerOrder.push(SellerOrder[key]);
            } else {
              let Quant = this.buyForm.value.nQuantity;
              this.NFTprice = this.currentOwnersOrder;
              let price = parseFloat(this.currentOwnerPrice);

              let totalAmmount = (price * Quant).toString();
             
              this.buyerOrder.push(
                ethers.utils.parseEther(totalAmmount).toString()
              );

              this.sellerOrder.push(this.currentOwnersOrder);
            }

            break;
          case 7:
            this.NFTprice = SellerOrder[key];
            if (type.erc721 === true) {
              this.sellerOrder.push(SellerOrder[key]);
              this.buyerOrder.push(SellerOrder[key]);
            } else {
              let time = parseInt(this.currentOwnerTime, 10);
              
              this.buyerOrder.push(time);

              this.sellerOrder.push(time);
            }

            break;
          case 8:
            this.sellerOrder.push([]);
            this.buyerOrder.push([]);
            break;
          case 9:
            this.sellerOrder.push([]);
            this.buyerOrder.push([]);
            break;
          case 10:
          
            if (type.erc721 === true) {
              this.sellerOrder.push(parseInt(SellerOrder[key]));
              this.buyerOrder.push(parseInt(SellerOrder[key]));
            } else {
              
              this.sellerOrder.push(this.currentOwnerSalt);
              this.buyerOrder.push(this.currentOwnerSalt);
            }

            break;
          default:
            this.sellerOrder.push(parseInt(SellerOrder[key]));
            this.buyerOrder.push(parseInt(SellerOrder[key]));
        }
      }

      let sign: any;
      if (type.erc721 === false) {
        sign = this.currOwnerSignature;
      } else {
        sign = this.NFTData.sSignature;
      }
      this.sellerSign = sign;
      let v = this.sellerSign[0];
      v = parseInt(v, 10);

      this.sellerSign[0] = v;

     

      if (this.buyForm.invalid) {
        this.isShowBuyNFTPopup = false;
        return;
      } else {
        let res = this.buyForm.value;
        

        res.nBidPrice = parseFloat(this.NFTData.nBasePrice['$numberDecimal']);
        let nTokenID =
          (await this.NFTData.nTokenID) && this.NFTData.nTokenID != undefined
            ? this.NFTData.nTokenID
            : 1;
        // let price: any = parseFloat(res.nBidPrice) * parseFloat(res.nQuantity);
        let price: any = parseFloat(res.nBidPrice);

        var NFTinstance: any = await this.apiService.exportInstance(
          environment.NFTaddress,
          environment.NFTabi
        );
        if (NFTinstance && NFTinstance != undefined) {
          this.isBuyNFTCreateOrder = "clockloader";
          let res1 = await this.buyNft();
          

          if (res1.status === 1) {
            this.isBuyNFTCreateOrder="checkiconCompleted";
            this.isBuyNFTCompletedPopupClass = "clockloader"; 
            let obj;
            if (type.erc721 === true) {
              obj = {
                oRecipient: this.NFTData['oCurrentOwner']['_id'],
                eBidStatus:
                  this.NFTData['eAuctionType'] == 'Fixed Sale'
                    ? 'Sold'
                    : 'Bid',
                nBidPrice: parseFloat(price),
                nQuantity: res.nQuantity,
                oNFTId: this.NFTData['_id'],
                sTransactionHash: '',
                nTokenID: nTokenID,
                sTransactionStatus: -99,
                sOwnerEmail:
                  this.NFTData.oCurrentOwner &&
                    this.NFTData.oCurrentOwner.sEmail &&
                    this.NFTData.oCurrentOwner.sEmail != undefined
                    ? this.NFTData.oCurrentOwner.sEmail
                    : '-',
                erc721: this.NFTData.erc721,
                nftOwner_id: this.NFTOwnerData._id,
                nftOwner_table_id: this.nftownertblID,
              };
              obj['sTransactionHash'] = res1.blockHash;
            }else{
              obj = {
                oRecipient: this.nftCurrentOwner ,
                eBidStatus:
                this.nftTypeSaleAuction == 'Fixed Sale'
                    ? 'Sold'
                    : 'Bid',
                nBidPrice: parseFloat(price),
                nQuantity: res.nQuantity,
                oNFTId: this.NFTData['_id'],
                sTransactionHash: '',
                nTokenID: nTokenID,
                sTransactionStatus: -99,
                sOwnerEmail:
                this.SelectedNFTOwnerData[0]['oNFTOwnerDetails'] &&
                this.SelectedNFTOwnerData[0]['oNFTOwnerDetails'][0]['sEmail'] &&
                this.SelectedNFTOwnerData[0]['oNFTOwnerDetails'][0]['sEmail'] != undefined
                    ? this.SelectedNFTOwnerData[0]['oNFTOwnerDetails'][0]['sEmail']
                    : '-',
                erc721: this.NFTData.erc721,
                nftOwner_id: this.nftownertblID,
                nftOwner_table_id: this.nftownertblID,
              };
              obj['sTransactionHash'] = res1.blockHash;
            }
            try {
              await this.apiService
                .bidCreate(obj)
                .subscribe(async (transData: any) => {
                  if (transData) {
                    this.toaster.success('NFT bought successfully', 'Success!');
                  } else {
                    this.toaster.success(transData['message'], 'Success!');
                  }
                  this.isBuyNFTCompletedPopupClass = "checkiconCompleted"; 
                  this.resetBuyNFTPopUpClass(); 
                });
            } catch (error) {
              this.toaster['error'](
                error.code == 4001
                  ? 'You Denied MetaMask Transaction Signature'
                  : 'Something Went Wrong!'
              );
              this.isBuyNFTCompletedPopupClass = "errorIcon"; 
              this.resetBuyNFTPopUpClass(); 
            }
          } else {
            this.isBuyNFTCreateOrder = "errorIcon"; 
            this.toaster.error('Something Went Wrong...Try Again');
            this.resetBuyNFTPopUpClass(); 
          }
        } else {
          this.resetBuyNFTPopUpClass(); 
          this.isBuyNFTCreateOrder = "errorIcon"; 
          this.toaster.error(
            'There is something issue with NFT address.',
            'Error!'
          );
        }
      }
    } else {
      this.toaster.error('Please sign in first.', 'Error!');
    }
  }

  async clickAccept(obj: any, erctype: Boolean = false) {
  
    this.isShowAcceptBidNFTPopup = true;
    let new_obj = JSON.parse(JSON.stringify(obj));
    let res = this.NFTOwnerData;
  
    let SellerOrder = Object.assign({}, res.sOrder);
    let BuyerOrder = Object.assign({}, new_obj.sOrder);
   

    let newSellerOrder: any = [];
    let newBuyerOrder: any = [];

    for (const key in SellerOrder) {
      let index = parseInt(key);

      switch (index) {
        case 0:
          if (erctype) {
            newSellerOrder.push(SellerOrder[key]);
            newBuyerOrder.push(BuyerOrder[key]);

            break;
          } else {
            newSellerOrder.push(SellerOrder[key]);
            newBuyerOrder.push(BuyerOrder[key]);
            break;
          }
        case 1:
          newSellerOrder.push(SellerOrder[key]);
          newBuyerOrder.push(BuyerOrder[key]);
          break;
        case 2:
          newSellerOrder.push(parseInt(SellerOrder[key], 10));
          newBuyerOrder.push(BuyerOrder[key]);
          break;
        case 3:
          if (erctype === true) {
            newSellerOrder.push(parseInt(SellerOrder[key], 10));
            newBuyerOrder.push(BuyerOrder[key]);
          } else {
            newSellerOrder.push(SellerOrder[key]);
            newBuyerOrder.push(BuyerOrder[key]);
          }

          break;
        case 4:
          if (erctype === true) {
            newSellerOrder.push(parseInt(SellerOrder[key], 10));
            newBuyerOrder.push(BuyerOrder[key]);
          } else {
            newSellerOrder.push(parseInt(SellerOrder[key], 10));
            newBuyerOrder.push(BuyerOrder[key]);
          }

          break;
        case 5:
          newSellerOrder.push(SellerOrder[key]);
          newBuyerOrder.push(BuyerOrder[key]);
          break;
        case 6:
          this.NFTprice = SellerOrder[key];
          if (erctype === true) {
            newSellerOrder.push(SellerOrder[key]);

           
            let a = BuyerOrder[key];
            console.log('a is--->', a.toString());
            // console.log("BuyerOrder Price "+ethers.utils.parseEther(a))

            newBuyerOrder.push(BuyerOrder[key]);
          } else {
            newSellerOrder.push(SellerOrder[key]);

            newBuyerOrder.push(BuyerOrder[key]);
          }

          break;

        case 7:
          if (erctype === true) {
            newSellerOrder.push(parseInt(SellerOrder[key], 10));
            newBuyerOrder.push(BuyerOrder[key]);
          } else {
            newSellerOrder.push(parseInt(SellerOrder[key], 10));
            newBuyerOrder.push(BuyerOrder[key]);
          }

          break;
        case 8:
          newSellerOrder.push([]);
          newBuyerOrder.push([]);
          break;
        case 9:
          newSellerOrder.push([]);
          newBuyerOrder.push([]);
          break;
        case 10:
          newSellerOrder.push(parseInt(SellerOrder[key], 10));
          newBuyerOrder.push(BuyerOrder[key]);
          break;
        default:
          newSellerOrder.push(SellerOrder[key]);
          newBuyerOrder.push(BuyerOrder[key]);
      }
    }
  
    let hash;
    let result;
    this.isAcceptBidNFTCompleteOrder = "clockloader";
    try {
      const options = { from: this.account[0], gasPrice: 10000000000, gasLimit: 9000000 };
      let completeOrder = await this.marketPlace.completeOrder( newSellerOrder, new_obj.sSignature, newBuyerOrder, new_obj.sSignature, options );
      
      result = await completeOrder.wait();
      this.isAcceptBidNFTCompleteOrder = "checkiconCompleted";
     
      hash = result.blockHash;
     
      
    } catch (error) {
      this.isAcceptBidNFTCompleteOrder = "errorIcon";
      this.resetAcceptBidNFTPopUpClass();
      if (error && error.code == 4001) {
        this.toaster.error(error['message'], 'Error!');
      } else {
        this.toaster.error('Something Went Wrong!!!');
      }
      return;
    }

    if (
      localStorage.getItem('Authorization') &&
      localStorage.getItem('Authorization') != null
    ) {
      let nTokenID =
        (await this.NFTData.nTokenID) && this.NFTData.nTokenID != undefined
          ? this.NFTData.nTokenID
          : 1;
      this.isAcceptBidNFTCompleteOrder = "checkiconCompleted";
      this.isAcceptBidNFTCreateBid = "clockloader";
      let oOptions = {
        sObjectId: obj._id,
        oBidderId: obj.oBidder._id,
        oNFTId: this.NFTData['_id'],
        eBidStatus: 'Accepted',
        sTransactionHash: '',
        sCurrentUserEmail:
          obj.oBidder &&
            obj.oBidder['sEmail'] &&
            obj.oBidder['sEmail'] != undefined
            ? obj.oBidder['sEmail']
            : '-',
      };

      var oContract: any = await this.apiService.exportInstance( environment.NFTaddress, environment.NFTabi );
      if (oContract && oContract != undefined) {
       

        try {
          oOptions['sTransactionHash'] = hash;
          // await this.sendData(oOptions);
          try {
            let data = {
              auctionbidId: obj._id,
              oNFTId: obj.oNFTId,
              oBidder: obj.oBidder._id,
              sOrder: obj.sOrder,
              sSignature: obj.sSignature,
              oRecipient: obj.oRecipient._id,
              nBidPrice: obj.nBidPrice,
              sTransactionHash: obj.sTransactionHash,
              nQuantity: obj.nQuantity,
              nTokenID: obj.nTokenID,
              nftERC721Type: erctype,
            };
            console.log('hash is--->', result.status);
            console.log('hash type', typeof result.status);
            if (result) {
              console.log('Bid accepted successfully first');
              try {
                await this.apiService
                  .acceptAuctionbid(data)
                  .subscribe((res: any) => {
                    this.toaster.success( 'Bid Accepted successfully', 'Success!' );
                    this.isAcceptBidNFTCreateBid = "checkiconCompleted";
                    this.resetAcceptBidNFTPopUpClass();
                  });
              } catch (error) {
                if (error && error.code == 4001) {
                  this.toaster.error(error['message'], 'Error!');
                } else {
                  console.log('error is--->', error);
                  this.toaster.error('Something went wrong !!');
                }
                this.isAcceptBidNFTCreateBid = "errorIcon";
                this.resetAcceptBidNFTPopUpClass();
              }
            } else {
              this.toaster.error('Something Went Wrong!!');
              this.isAcceptBidNFTCreateBid = "errorIcon";
              this.resetAcceptBidNFTPopUpClass();
              return;
            }
          } catch (error) {
            this.isAcceptBidNFTCreateBid = "errorIcon";
            this.resetAcceptBidNFTPopUpClass();
            this.toaster['error']('Something Went Wrong!');
          }
          // this.router.navigate(['']);
        } catch (error) {
          this.isAcceptBidNFTCompleteOrder = "errorIcon";
          this.resetAcceptBidNFTPopUpClass();
          if (error && error.code == 4001) {
            this.toaster.error(error['message'], 'Error!');
          }
        }
      } else {
        this.isAcceptBidNFTCompleteOrder = "errorIcon";
        this.resetAcceptBidNFTPopUpClass();
        this.toaster.error( 'There is something issue with NFT address.', 'Error!' );
      }
    } else {
      this.toaster.error('Please sign in first.');
    }
  }

  async clickReject(obj: any) {
    if (
      localStorage.getItem('Authorization') &&
      localStorage.getItem('Authorization') != null
    ) {
      let nTokenID = (await this.NFTData.nTokenID) && this.NFTData.nTokenID != undefined ? this.NFTData.nTokenID : 1;
      let oOptions = {
        sObjectId: obj._id,
        oBidderId: obj.oBidder._id,
        oNFTId: this.NFTData['_id'],
        eBidStatus: 'Rejected',
        sTransactionHash: '',
      };
      this.spinner.show();
      var oContract: any = await this.apiService.exportInstance( environment.NFTaddress, environment.NFTabi );
      if (oContract && oContract != undefined) {
        oContract.methods.rejectBid(nTokenID, obj.oBidder.sWalletAddress).send({ from: this.showObj.wallet_address }) 
        .on('transactionHash', async (hash: any) => {
          oOptions['sTransactionHash'] = hash;
          await this.sendData(oOptions);
          try {
              let data = {
                auctionbidId: obj._id,
                oNFTId: obj.oBidder,
                oBidder: obj.oNFTId,
              };
              await this.apiService
                .rejectAuctionbid(data)
                .subscribe((res: any) => {
                  this.spinner.hide();
                  this.toaster.success('Bid Rejected successfully', 'Success!');
                  this.onClickRefresh();
                });
            } catch (error) {
              this.spinner.hide();
              this.toaster['error']('Something Went Wrong!');
            }

            // this.router.navigate(['']);
          })
          .catch((error: any) => {
            this.spinner.hide();
            if (error && error.code == 4001) {
              this.toaster.error(error['message'], 'Error!');
            }
          });
      } else {
        this.spinner.hide();
        this.toaster.error(
          'There is something issue with NFT address.',
          'Error!'
        );
      }
    } else {
      // this.router.navigate(['']);
      this.toaster.error('Please sign in first.');
    }
  }

  async clickCancel(obj: any) {
    if (
      localStorage.getItem('Authorization') &&
      localStorage.getItem('Authorization') != null
    ) {
      let nTokenID =
        (await this.NFTData.nTokenID) && this.NFTData.nTokenID != undefined
          ? this.NFTData.nTokenID
          : 1;

      let oOptions = {
        sObjectId: obj._id,
        oBidderId: obj.oBidder._id,
        oNFTId: this.NFTData['_id'],
        eBidStatus: 'Canceled',
        sTransactionHash: '',
      };

      this.spinner.show();
      var oContract: any = await this.apiService.exportInstance(
        environment.NFTaddress,
        environment.NFTabi
      );
      if (oContract && oContract != undefined) {
        oContract.methods
          .cancelBid(nTokenID, this.NFTData.oCurrentOwner.sWalletAddress)
          .send({
            from: this.showObj.wallet_address,
          })
          .on('transactionHash', async (hash: any) => {
            this.spinner.hide();
            oOptions['sTransactionHash'] = hash;
            await this.sendData(oOptions);
            this.router.navigate(['']);
          })
          .catch((error: any) => {
            this.spinner.hide();
            if (error && error.code == 4001) {
              this.toaster.error(error['message'], 'Error!');
            }
          });
      } else {
        this.spinner.hide();
        this.toaster.error(
          'There is something issue with NFT address.',
          'Error!'
        );
      }
    } else {
      // this.router.navigate(['']);
      this.toaster.error('Please sign in first.', 'Error!');
    }
  }

  // nNFTId: 6120eba598b61743cf49a43f
  // sSellingType: Auction
  async toggleSellingType(obj: any) {
    this.spinner.show();
    await this.apiService.toggleSellingType(obj).subscribe(
      async (transData: any) => {
        this.spinner.hide();
        if (
          transData &&
          transData['message'] &&
          transData['message'] == 'NFT Details updated'
        ) {
          this.toaster.success('Selling Type updated.', 'Success!');

          this.onClickRefresh();
        }
      },
      (err: any) => {
        this.spinner.hide();
        if (err) {
          console.log('----------er', err);
          err = err['error'];
          if (err) {
            this.toaster.error(err['message'], 'Error!');
          }
        }
      }
    );
  }

  //Signature structure

  setSaleType(type: any) {
    this.saleType = type;
  }

  //put on sale
  async onClickUpdateType(type: any, id: any, nftOwnerid: any = null) {
    await this.apiService.getprofile().subscribe(async (res: any) => {

      if (await res && res['data']) {
        this.profileData = await res['data'];
      
        if(await this.profileData.sStatus =='deactivated'){
          this.isActive=0
          console.log("malksdjflaksjdflkajsdflkjasldfjasldfjasdlfkj")
         this.toaster.error("Your Account  is Deactivated by Admin")
         
         
          return;
        };
       
        this.userStatus=this.profileData.sStatus;
       
       
      
       
      }

    }, (err: any) => {

    });
  
  
    this.isShowPopup = true;
    let res1 = this.saleForm.value;
    console.log('res1 for put on sale is----->', res1.orderPrice, res1);
    if(res1.orderPrice.length==''){
      this.toaster.error("Enter Price")
      this.isShowPopup = false;
      return;

     


    }
    var rgx = /^[0-9]*\.?[0-9]*$/;
    let result= res1.orderPrice.match(rgx);
    console.log("result is",result)
    if(result==false){
      this.toaster.error("Enter Valid Price");
      return;
    }

    let res = this.NFTData;

    let SellerOrder = Object.assign({}, res.sOrder);

    let nftContract = res.sOrder[1];
    console.log("is active is--->",this.isActive)
    if(this.isActive==0){
      console.log("is active is false");
      return;
    }
    if (res.erc721) {
      console.log('erc721');
      let NFTcontract: any = await this.apiService.exportInstance(
        nftContract,
        simpleERC721ABI.abi
      );
      console.log('nft contract is--->', NFTcontract);
      let approval = await NFTcontract.isApprovedForAll(
        this.account[0],
        contracts.MARKETPLACE
      );

      if (!approval) {
        this.isApprovePopupClass = 'clockloader';
        try {
          let approvalres = await NFTcontract.setApprovalForAll(
            contracts.MARKETPLACE,
            true
          );
          let res = await approvalres.wait();
          console.log('approval res', approvalres);
          this.isApprovePopupClass= "checkiconCompleted";
        } catch (error) {
          this.isApprovePopupClass = 'errorIcon';
          this.resetPopUpClass();
          this.toaster['error'](
            error.code == 4001
              ? 'You Denied MetaMask Transaction Signature'
              : 'Something Went Wrong!'
          );
        }
      } else {
        this.isApprovePopupClass = 'checkiconCompleted';
        this.isSignaturePopupClass = 'clockloader';
      }
    } else {
      console.log('erc1155');
      let NFTcontract: any = await this.apiService.exportInstance(
        nftContract,
        simpleERC1155ABI.abi
      );

      console.log('erc1155 contract is called again--->', NFTcontract);

      let approval = await NFTcontract.isApprovedForAll(
        this.account[0],
        contracts.MARKETPLACE
      );

      console.log('approval is---->', approval);

      if (!approval) {
        this.isApprovePopupClass = 'clockloader';
        try {
          let approvalres = await NFTcontract.setApprovalForAll(
            contracts.MARKETPLACE,
            true
          );
          let res = await approvalres.wait();
          console.log('approval res', approvalres);
          this.isApprovePopupClass= "checkiconCompleted";
        } catch (error) {
          this.isApprovePopupClass = 'errorIcon';
          this.resetPopUpClass();
          this.toaster['error'](
            error.code == 4001
              ? 'You Denied MetaMask Transaction Signature'
              : 'Something Went Wrong!'
          );
          return;
        }
      } else {
        this.isApprovePopupClass = 'checkiconCompleted';
        this.isSignaturePopupClass = 'clockloader';
      }
    }

    let newSellerOrder = Object.values(SellerOrder);
    console.log('seller order is--->', newSellerOrder);

    for (const key in SellerOrder) {
      let index = parseInt(key);

      switch (index) {
        case 0:
          newSellerOrder[0] = this.account[0];

          break;
        case 1:
          newSellerOrder[1] = SellerOrder[key];

          break;
          case 2:
            newSellerOrder[2] = parseInt(SellerOrder[key],10);
  
            break;
        case 3:
          if (res.erc721) {
            newSellerOrder[3] = SellerOrder[key];
          } else {
            let quantity = this.saleForm.value.nQuantity;
            let a = parseInt(quantity, 10);
            newSellerOrder[3] = a;
          }

          break;
        case 4:
          if (this.saleType === 'Fixed Sale') {
            newSellerOrder[4] = 0;
          } else {
            newSellerOrder[4] = 1;
          }

          break;
        case 5:
          if (this.saleType === 'Fixed Sale') {
            newSellerOrder[5] = '0x0000000000000000000000000000000000000000';
          } else {
            newSellerOrder[5] = contracts.ERC20;
          }

          break;

        case 6:
          if (res.erc721) {
            newSellerOrder[6] = ethers.utils
              .parseEther(res1.orderPrice)
              .toString();
          } else {
            //todo send value in string
            let new_price = res1.orderPrice.toString();
            newSellerOrder[6] = ethers.utils.parseEther(new_price).toString();
          }

          break;

        case 7:
          newSellerOrder[7] = new Date(
            new Date().setFullYear(new Date().getFullYear() + 4)
          ).getTime();

        case 8:
          newSellerOrder[8] = [];

          break;

        case 9:
          newSellerOrder[9] = [];

          break;

        case 10:
          newSellerOrder[10] =Math.round(Math.random()*100000000+5);

          break;

        default:
          break;
      }
    }

    console.log('new sellerOrder is---->', newSellerOrder);

    // let signature = await this.getSignature(this.account[0], newSellerOrder);

    let signature: any;
    try {
      signature = await this.getSignature(this.account[0], newSellerOrder);
      console.log("signature is---->",signature)
    } catch (error) {
      this.toaster['error'](error.code == 4001 ? 'You Denied MetaMask Transaction Signature' : 'Something Went Wrong!');
      this.isSignaturePopupClass = 'errorIcon';
      this.resetPopUpClass();
      return;
    }
    this.isSignaturePopupClass = 'checkiconCompleted';
    this.isPutOnSalePopupClass = 'clockloader';

    console.log('signature is---->', signature);
    let SaleQty = parseInt(res1.nQuantity, 10);
    let data = {
      _id: this.NFTData._id,
      eAuctionType: this.saleType,
      nftownerID: this.NFTOwnerData._id,
      sTransactionStatus: 1,
      nftID: this.NFTData._id,
      sOrder: newSellerOrder,
      sSignature: signature,
      nBasePrice: res1.orderPrice,
      putOnSaleQty: SaleQty,
      erc721: res.erc721,
      action:"putonsale",
    };
    console.log('data to be updated is---->', data);

    if (
      localStorage.getItem('Authorization') &&
      localStorage.getItem('Authorization') != null
    ) {
      this.isPutOnSalePopupClass = 'clockloader';
      let res1 = await this.apiService.updateNFTOrder(data).subscribe(
        async (transData: any) => {
          console.log('-----------transData----------', transData);
          this.isPutOnSalePopupClass = 'checkiconCompleted';
          this.isCompletedPopupClass = 'checkiconCompleted';
          if (
            transData &&
            transData['message'] &&
            transData['message'] == 'Order Created success'
          ) {
            if (this.saleType == "Auction") {
              this.toaster.success('NFT ON Auction .', 'Success!');
            } else {
              this.toaster.success('NFT ON SALE .', 'Success!');
            }
            // this.onClickRefresh();
            this.resetPopUpClass();
          }
        },
        (err: any) => {
          this.isPutOnSalePopupClass = 'errorIcon';
          this.resetPopUpClass();
          if (err) {
            console.log('----------er', err);
            err = err['error'];
            if (err) {
              this.toaster.error(err['message'], 'Error!');
            }
          }
        }
      );
    } else {
      // this.router.navigate(['']);
      this.isShowPopup = false;
      // this.resetPopUpClass();
      this.toaster.error('Please sign in first.', 'Error');
    }
  }
  async sendData(opt: any) {
    this.spinner.show();
    await this.apiService
      .toggleBidStatus(opt)
      .subscribe(async (transData: any) => {
        this.spinner.hide();
        if (transData && transData['data']) {
          this.toaster.success(
            'Bid status updated. it will be Reflected once Transaction is mined.',
            'Success!'
          );

          this.onClickRefresh();
        } else {
          this.toaster.success(transData['message'], 'Success!');
        }
      });
  }

  clickClose() {
    var magnificPopup = $.magnificPopup.instance;
    // save instance in magnificPopup variable
    magnificPopup.close();
  }

  async clickOpen() {
    let connect=localStorage.getItem('connected');
    if(connect=='false'){
      this.toaster.error("Connect Your Metamask")
      return;
    }
    if(this.userStatus=='blocked'){
      this.toaster.warning("Your Account Has Been Temporarily Suspended");
      return;
    }
    if(this.userStatus=='deactivated'){
      this.toaster.warning("Your Account Has Been Deactivated by admin");
      this.router.navigate(['/'],);
      return;
    }
    let id = this._route.snapshot.params['id'];
    await this.apiService.viewnft(id).subscribe(
      async (data: any) => {
        if (await data && await data['data']) {
          let res = await data['data'];

          this.NFTData = res;

          console.log("NFT DATA is------->",this.NFTData)
         
          if(await this.NFTData.sTransactionStatus==-2){
            this.toaster.warning("Admin Has Blocked This NFT");
            this.router.navigate(['/'],);
            return;
          }
          this.nftERC721Type = this.NFTData.erc721;
       

          this.CurrentUserID = res.loggedinUserId;
        
          if (res.erc721) {
            this.tokenType = true;
           
          } else {
            this.tokenType = false;
            this.ShowBuyBtnERC1155 = true;
            
          }
      
        } else {
        }
      },
      (error) => {
        if (error) {
        }
      }
    );
    
    
    $.magnificPopup.open({
      items: {
        src: '#modal-tran',
        type: 'inline',
        fixedContentPos: true,
        fixedBgPos: true,
        overflowY: 'auto',
        preloader: false,
        focus: '#username',
        modal: false,
        removalDelay: 300,
        mainClass: 'my-mfp-zoom-in',
        callbacks: {
          beforeOpen: function () {
            if ($(window).width() < 700) {
              // this.st.focus = false;
            } else {
              // this.st.focus = '#name';
            }
          },
        },
      },
    });

    // $('#modal-tran').magnificPopup('open');
  }

  async buyModal() {
    
    await this.apiService.getprofile().subscribe(async(res: any) => {

      if (await res && await res['data']) {
        this.profileData = res['data'];
      
        if(this.profileData.sStatus ==='deactivated'){
          this.isActive=false
          this.toaster.error("Your Account is deactivated by Admin")
          this.router.navigate(['/'],);
          this.isShowPopupCancel=false
          return;
        };
        if(this.profileData.sStatus ==='blocked'){
          this.isActive=false
          this.toaster.error("Your Account is Temporarily suspended by Admin")
          this.isShowPopupCancel=false
          return;
        };
        this.userStatus=this.profileData.sStatus;
      
      
       
      }

    }, (err: any) => {
        
    });
    
    let connect=localStorage.getItem('connected');
      if(connect=='false'){
        this.toaster.error("Connect Your Metamask")
        return;
      }
      
      if(this.userStatus==='deactivated'){
        this.toaster.warning("Your Account Has Been Deactivated by admin");
        this.router.navigate(['/'],);
        return;
      }
      let id = this._route.snapshot.params['id'];
      await this.apiService.viewnft(id).subscribe(
        async (data: any) => {
          if (await data && await data['data']) {
            let res = await data['data'];
  
            this.NFTData = res;
  
            console.log("NFT DATA is------->",this.NFTData)
           
            if(await this.NFTData.sTransactionStatus==-2){
              this.toaster.warning("Admin Has Blocked This NFT");
              this.router.navigate(['/'],);
              return;
            }
            this.nftERC721Type = this.NFTData.erc721;
         
  
            this.CurrentUserID = res.loggedinUserId;
          
            if (res.erc721) {
              this.tokenType = true;
             
            } else {
              this.tokenType = false;
              this.ShowBuyBtnERC1155 = true;
              
            }
        
          } else {
          }
        },
        (error) => {
          if (error) {
          }
        }
      );
      
    $.magnificPopup.open({
      items: {
        src: '#modal-buy',
        type: 'inline',
        fixedContentPos: true,
        fixedBgPos: true,
        overflowY: 'auto',
        preloader: false,
        focus: '#username',
        modal: false,
        removalDelay: 300,
        mainClass: 'my-mfp-zoom-in',
        callbacks: {
          beforeOpen: function () {
            if ($(window).width() < 700) {
              // this.st.focus = false;
            } else {
              // this.st.focus = '#name';
            }
          },
        },
      },
    });
  }

  async bidModal(NFTownerObj: any = {}) {
    
    await this.apiService.getprofile().subscribe(async(res: any) => {

      if (await res && await res['data']) {
        this.profileData = res['data'];
      
        if(this.profileData.sStatus ==='deactivated'){
          this.isActive=false
          this.toaster.error("Your Account is deactivated by Admin")
          this.router.navigate(['/'],);
          this.isShowPopupCancel=false
          return;
        };
        if(this.profileData.sStatus ==='blocked'){
          this.isActive=false
          this.toaster.error("Your Account is Temporarily suspended by Admin")
          this.isShowPopupCancel=false
          return;
        };
        this.userStatus=this.profileData.sStatus;
      
      
       
      }

    }, (err: any) => {
        
    });
    
    let connect=localStorage.getItem('connected');
      if(connect=='false'){
        this.toaster.error("Connect Your Metamask")
        return;
      }
      if(this.userStatus=='deactivated'){
        this.toaster.warning("Your Account Has Been Deactivated by admin");
        this.router.navigate(['/'],);
        return;
      }
      let id = this._route.snapshot.params['id'];
      await this.apiService.viewnft(id).subscribe(
        async (data: any) => {
          if (await data && await data['data']) {
            let res = await data['data'];
  
            this.NFTData = res;
  
            console.log("NFT DATA is------->",this.NFTData)
           
            if(await this.NFTData.sTransactionStatus==-2){
              this.toaster.warning("Admin Has Blocked This NFT");
              this.router.navigate(['/'],);
              return;
            }
            this.nftERC721Type = this.NFTData.erc721;
         
  
            this.CurrentUserID = res.loggedinUserId;
          
            if (res.erc721) {
              this.tokenType = true;
             
            } else {
              this.tokenType = false;
              this.ShowBuyBtnERC1155 = true;
              
            }
        
          } else {
          }
        },
        (error) => {
          if (error) {
          }
        }
      );
    // if(parseFloat(this.nftBidAmt)<parseFloat(NFTownerObj.nBasePrice.$numberDecimal)){
    //   this.currentOwnerPrice = NFTownerObj.nBasePrice.$numberDecimal;
    // }
    this.currentOwnerPrice = NFTownerObj.nBasePrice.$numberDecimal;
    this.nftBidAmt = this.currentOwnerPrice;
    // this.currentOwnerQty = NFTownerObj.nQuantity;
    this.currentOwnersaccount = NFTownerObj.sOrder[0];
    this.currentOwnersOrder = NFTownerObj.sOrder[6];
    this.nftownertblID = NFTownerObj._id;
    this.QntLeftForSale = NFTownerObj.nQuantityLeft;
    this.currOwnerTotalQuantity = NFTownerObj.sOrder[3];
    this.currOwnerSignature = NFTownerObj.sSignature;
    this.currentOwnerTime = NFTownerObj.sOrder[7];
    this.currentOwnerSalt = NFTownerObj.sOrder[10];
    console.log("Salt 3 is" + this.currentOwnerSalt);
    this.nftSelectedOwner = NFTownerObj.oCurrentOwner;

    console.log(
      'Get Bid Data------>',
      NFTownerObj.nftId,
      NFTownerObj.oCurrentOwner
    );

    this.getselectedNFTOwnerData(this.nftownertblID);
    this.getselectedNftbids(NFTownerObj.nftId, NFTownerObj.oCurrentOwner);

    this.currentOwnerQty =
      parseInt(NFTownerObj.nQuantity) - parseInt(NFTownerObj.nQuantityLeft);

    console.log('current owner signature------>', this.currOwnerSignature);
    console.log(
      'Price ' +
      this.currentOwnerPrice +
      ' Qty ' +
      this.currentOwnerQty +
      ' Owner ' +
      this.currentOwnersaccount +
      ' SOrder ' +
      this.currentOwnersOrder +
      ' table_id ' +
      this.nftownertblID,
      'current owner time' + this.currentOwnerTime
    );

    $.magnificPopup.open({
      items: {
        src: '#modal-bid',
        type: 'inline',
        fixedContentPos: true,
        fixedBgPos: true,
        overflowY: 'auto',
        preloader: false,
        focus: '#username',
        modal: false,
        removalDelay: 300,
        mainClass: 'my-mfp-zoom-in',
        callbacks: {
          beforeOpen: function () {
            if ($(window).width() < 700) {
              // this.st.focus = false;
            } else {
              // this.st.focus = '#name';
            }
          },
        },
      },
    });
  }


  //Hidden Content Modal

  async hiddenContentModal() {
    await this.apiService.getprofile().subscribe(async(res: any) => {

      if (await res && await res['data']) {
        this.profileData = res['data'];
      
        if(this.profileData.sStatus ==='deactivated'){
          this.isActive=false
          this.toaster.error("Your Account is deactivated by Admin")
          this.router.navigate(['/'],);
          this.isShowPopupCancel=false
          return;
        };
        if(this.profileData.sStatus ==='blocked'){
          this.isActive=false
          this.toaster.error("Your Account is Temporarily suspended by Admin")
          this.isShowPopupCancel=false
          return;
        };
        this.userStatus=this.profileData.sStatus;
      
      
       
      }

    }, (err: any) => {
        
    });
    console.log("hidden content modal")
    let connect=localStorage.getItem('connected');
    console.log("connect is---->",connect)
     
      if(connect==null){
        this.toaster.error("Connect Your Metamask")
        return;
      }
      if(connect=='false'){
        this.toaster.error("Connect Your Metamask")
        return;
      }
      if(this.userStatus=='deactivated'){
        this.toaster.warning("Your Account Has Been Deactivated by admin");
        this.router.navigate(['/'],);
        return;
      }
      let id = this._route.snapshot.params['id'];
    await this.getNFTViewData(id)
      if(this.NFTData.sTransactionStatus==-2){
        this.toaster.warning("Admin Has Blocked This NFT");
        this.router.navigate(['/'],);
        return;
      }
      
    
    $.magnificPopup.open({
      items: {
        src: '#modal-hidden-content',
        type: 'inline',
        fixedContentPos: true,
        fixedBgPos: true,
        overflowY: 'auto',
        preloader: false,
        focus: '#username',
        modal: false,
        removalDelay: 300,
        mainClass: 'my-mfp-zoom-in',
        callbacks: {
          beforeOpen: function () {
            if ($(window).width() < 700) {
              // this.st.focus = false;
            } else {
              // this.st.focus = '#name';
            }
          },
        },
      },
    });
  }

  async buyModalOwner(NFTownerObj: any = {}) {
  
    await this.apiService.getprofile().subscribe(async(res: any) => {

      if (await res && await res['data']) {
        this.profileData = res['data'];
      
        if(this.profileData.sStatus ==='deactivated'){
          this.isActive=false
          this.toaster.error("Your Account is deactivated by Admin")
          this.router.navigate(['/'],);
          this.isShowPopupCancel=false
          return;
        };
        if(this.profileData.sStatus ==='blocked'){
          this.isActive=false
          this.toaster.error("Your Account is Temporarily suspended by Admin")
          this.isShowPopupCancel=false
          return;
        };
        this.userStatus=this.profileData.sStatus;
      
      
       
      }

    }, (err: any) => {
        
    });
    
    let connect=localStorage.getItem('connected');
    if(connect==null){
      this.toaster.error("Connect Your Metamask")
      return;
    }
      if(connect=='false'){
        this.toaster.error("Connect Your Metamask")
        return;
      }
     
      if(this.userStatus=='deactivated'){
        this.toaster.warning("Your Account Has Been Deactivated by admin");
        this.router.navigate(['/'],);
        return;
      }
      let id = this._route.snapshot.params['id'];
      await this.apiService.viewnft(id).subscribe(
        async (data: any) => {
          if (await data && await data['data']) {
            let res = await data['data'];
  
            this.NFTData = res;
  
            console.log("NFT DATA is------->",this.NFTData)
           
            if(await this.NFTData.sTransactionStatus==-2){
              this.toaster.warning("Admin Has Blocked This NFT");
              this.router.navigate(['/'],);
              return;
            }
            this.nftERC721Type = this.NFTData.erc721;
         
  
            this.CurrentUserID = res.loggedinUserId;
          
            if (res.erc721) {
              this.tokenType = true;
             
            } else {
              this.tokenType = false;
              this.ShowBuyBtnERC1155 = true;
              
            }
        
          } else {
          }
        },
        (error) => {
          if (error) {
          }
        }
      );
    this.currentOwnerPrice = NFTownerObj.nBasePrice.$numberDecimal;
    this.currentOwnerQty = NFTownerObj.nQuantity;
    this.currentOwnersaccount = NFTownerObj.sOrder[0];
    this.currentOwnersOrder = NFTownerObj.sOrder[6];
    this.nftownertblID = NFTownerObj._id;
    this.QntLeftForSale = NFTownerObj.nQuantityLeft;
    this.currOwnerTotalQuantity = NFTownerObj.sOrder[3];
    this.currOwnerSignature = NFTownerObj.sSignature;
    this.currentOwnerTime = NFTownerObj.sOrder[7];
    this.currentOwnerSalt = NFTownerObj.sOrder[10];
    console.log("Salt 1 is" + this.currentOwnerSalt);
    this.currentOwnerSaleType = NFTownerObj.sOrder[4];
    console.log('current owner signature------>', this.currOwnerSignature);
    this.getselectedNFTOwnerData(this.nftownertblID);
    console.log(
      'Price ' +
      this.currentOwnerPrice +
      ' Qty ' +
      this.currentOwnerQty +
      ' Owner ' +
      this.currentOwnersaccount +
      ' SOrder ' +
      this.currentOwnersOrder +
      ' table_id ' +
      this.nftownertblID,
      'current owner time' + this.currentOwnerTime,
      'currentOwnerSaleType' + this.currentOwnerSaleType,
      ' currentOwnerSalt' + this.currentOwnerSalt,
    );
    this.buildBUYForm(this.currentOwnerPrice);
    $.magnificPopup.open({
      items: {
        src: '#modal-buy-owner',
        type: 'inline',
        fixedContentPos: true,
        fixedBgPos: true,
        overflowY: 'auto',
        preloader: false,
        focus: '#username',
        modal: false,
        removalDelay: 300,
        mainClass: 'my-mfp-zoom-in',
        callbacks: {
          beforeOpen: function () {
            if ($(window).width() < 700) {
              // this.st.focus = false;
            } else {
              // this.st.focus = '#name';
            }
          },
        },
      },
    });
  }
  
  

  async putOnSaleModal() {
    await this.apiService.getprofile().subscribe(async(res: any) => {

      if (await res && await res['data']) {
        this.profileData = res['data'];
      
        if(this.profileData.sStatus ==='deactivated'){
          this.isActive=false
          this.toaster.error("Your Account is deactivated by Admin")
          this.router.navigate(['/'],);
          this.isShowPopupCancel=false
          return;
        };
        if(this.profileData.sStatus ==='blocked'){
          this.isActive=false
          this.toaster.error("Your Account is Temporarily suspended by Admin")
          this.isShowPopupCancel=false
          return;
        };
       
        this.userStatus=this.profileData.sStatus;
      
      
       
      }

    }, (err: any) => {
        
    });
    if(this.userStatus=='blocked'){
      this.toaster.warning("Your Account Has Been Temporarily Suspended");
      return;
    }
    let connect=localStorage.getItem('connected');
    if(connect==null){
      this.toaster.error("Connect Your Metamask")
      return;
    }
      if(connect=='false'){
        this.toaster.error("Connect Your Metamask")
        return;
      }
      if(this.userStatus=='deactivated'){
        this.toaster.warning("Your Account Has Been Deactivated by admin");
        this.router.navigate(['/'],);
        return;
      }
      let id = this._route.snapshot.params['id'];
      let status:any;
      await this.apiService.viewnft(id).subscribe(
        async (data: any) => {
          if (await data && await data['data']) {
            let res = await data['data'];
  
            this.NFTData = res;
  
            console.log("NFT DATA is------->",this.NFTData)
           
            if(await this.NFTData.sTransactionStatus==-2){
              this.toaster.warning("Admin Has Blocked This NFT");
              this.router.navigate(['/'],);
              return;
            }
            this.nftERC721Type = this.NFTData.erc721;
         
  
            this.CurrentUserID = res.loggedinUserId;
          
            if (res.erc721) {
              this.tokenType = true;
             
            } else {
              this.tokenType = false;
              this.ShowBuyBtnERC1155 = true;
              
            }
        
          } else {
          }
        },
        (error) => {
          if (error) {
          }
        }
      );
    console.log("put on sale modal is called",await this.NFTData)
    
    
    $.magnificPopup.open({
      items: {
        src: '#modal-sale',
        type: 'inline',
        fixedContentPos: true,
        fixedBgPos: true,
        overflowY: 'auto',
        preloader: false,
        focus: '#username',
        modal: false,
        removalDelay: 300,
        mainClass: 'my-mfp-zoom-in',
        callbacks: {
          beforeOpen: function () {
            if ($(window).width() < 700) {
              // this.st.focus = false;
            } else {
              // this.st.focus = '#name';
            }
          },
        },
      },
    });
  }

  async transferNFTModal() {
    await this.apiService.getprofile().subscribe(async(res: any) => {

      if (await res && await res['data']) {
        this.profileData = res['data'];
      
        if(this.profileData.sStatus ==='deactivated'){
          this.isActive=false
          this.toaster.error("Your Account is deactivated by Admin")
          this.router.navigate(['/'],);
          this.isShowPopupCancel=false
          return;
        };
        if(this.profileData.sStatus ==='blocked'){
          this.isActive=false
          this.toaster.error("Your Account is Temporarily suspended by Admin")
          this.isShowPopupCancel=false
          return;
        };
        this.userStatus=this.profileData.sStatus;
      
      
       
      }

    }, (err: any) => {
        
    });
    let connect=localStorage.getItem('connected');
    if(connect==null){
      this.toaster.error("Connect Your Metamask")
      return;
    }
      if(connect=='false'){
        this.toaster.error("Connect Your Metamask")
        return;
      }
    
      if(this.userStatus=='deactivated'){
        this.toaster.warning("Your Account Has Been Deactivated by admin");
        this.router.navigate(['/'],);
        return;
      }  
      let id = this._route.snapshot.params['id'];
      await this.apiService.viewnft(id).subscribe(
        async (data: any) => {
          if (await data && await data['data']) {
            let res = await data['data'];
  
            this.NFTData = res;
  
            console.log("NFT DATA is------->",this.NFTData)
           
            if(await this.NFTData.sTransactionStatus==-2){
              this.toaster.warning("Admin Has Blocked This NFT");
              this.router.navigate(['/'],);
              return;
            }
            this.nftERC721Type = this.NFTData.erc721;
         
  
            this.CurrentUserID = res.loggedinUserId;
          
            if (res.erc721) {
              this.tokenType = true;
             
            } else {
              this.tokenType = false;
              this.ShowBuyBtnERC1155 = true;
              
            }
        
          } else {
          }
        },
        (error) => {
          if (error) {
          }
        }
      );
    $.magnificPopup.open({
      items: {
        src: '#modal-transfer',
        type: 'inline',
        fixedContentPos: true,
        fixedBgPos: true,
        overflowY: 'auto',
        preloader: false,
        focus: '#username',
        modal: false,
        removalDelay: 300,
        mainClass: 'my-mfp-zoom-in',
        callbacks: {
          beforeOpen: function () {
            if ($(window).width() < 700) {
              // this.st.focus = false;
            } else {
              // this.st.focus = '#name';
            }
          },
        },
      },
    });
  }

  // --TODO
  async onClickSubmitChangePrice() {
    let connect=localStorage.getItem('connected');
    if(connect==null){
      this.toaster.error("Connect Your Metamask")
      return;
    }
      if(connect=='false'){
        this.toaster.error("Connect Your Metamask")
        return;
      }
      let id = this._route.snapshot.params['id'];
      await this.apiService.viewnft(id).subscribe(
        async (data: any) => {
          if (await data && await data['data']) {
            let res = await data['data'];
  
            this.NFTData = res;
  
            console.log("NFT DATA is------->",this.NFTData)
           
            if(await this.NFTData.sTransactionStatus==-2){
              this.toaster.warning("Admin Has Blocked This NFT");
              this.router.navigate(['/'],);
              return;
            }
            this.nftERC721Type = this.NFTData.erc721;
         
  
            this.CurrentUserID = res.loggedinUserId;
          
            if (res.erc721) {
              this.tokenType = true;
             
            } else {
              this.tokenType = false;
              this.ShowBuyBtnERC1155 = true;
              
            }
        
          } else {
          }
        },
        (error) => {
          if (error) {
          }
        }
      );
    this.spinner.show();
    this.submitted4 = true;
    if (this.changePriceForm.invalid) {
      this.spinner.hide();
      return;
    } else {
      let resp = this.changePriceForm.value;
      let obj = {
        nNFTId: this.NFTData._id,
        nBasePrice: resp.nBasePrice,
      };

      this.spinner.show();
      await this.apiService.updateBasePrice(obj).subscribe(
        async (transData: any) => {
          console.log('-----------transData----------', transData);
          this.spinner.hide();
          if (
            transData &&
            transData['message'] &&
            transData['message'] == 'Price updated'
          ) {
            this.toaster.success('Price updated.', 'Success!');

            this.onClickRefresh();
          }
        },
        (err: any) => {
          this.spinner.hide();
          if (err) {
            console.log('----------er', err);
            err = err['error'];
            if (err) {
              this.toaster.error(err['message'], 'Error!');
            }
          }
        }
      );
    }
  }

  async onClickOPENPRICE() {
    let connect=localStorage.getItem('connected');
    if(connect==null){
      this.toaster.error("Connect Your Metamask")
      return;
    }
      if(connect=='false'){
        this.toaster.error("Connect Your Metamask")
        return;
      }
      if(this.userStatus=='deactivated'){
        this.toaster.warning("Your Account Has Been Deactivated by admin");
        this.router.navigate(['/'],);
        return;
      }
      let id = this._route.snapshot.params['id'];
      await this.apiService.viewnft(id).subscribe(
        async (data: any) => {
          if (await data && await data['data']) {
            let res = await data['data'];
  
            this.NFTData = res;
  
            console.log("NFT DATA is------->",this.NFTData)
           
            if(await this.NFTData.sTransactionStatus==-2){
              this.toaster.warning("Admin Has Blocked This NFT");
              this.router.navigate(['/'],);
              return;
            }
            this.nftERC721Type = this.NFTData.erc721;
         
  
            this.CurrentUserID = res.loggedinUserId;
          
            if (res.erc721) {
              this.tokenType = true;
             
            } else {
              this.tokenType = false;
              this.ShowBuyBtnERC1155 = true;
              
            }
        
          } else {
          }
        },
        (error) => {
          if (error) {
          }
        }
      );
    $.magnificPopup.open({
      items: {
        src: '#modal-change-price',
        type: 'inline',
        fixedContentPos: true,
        fixedBgPos: true,
        overflowY: 'auto',
        preloader: false,
        focus: '#username',
        modal: false,
        removalDelay: 300,
        mainClass: 'my-mfp-zoom-in',
        callbacks: {
          beforeOpen: function () {
            if ($(window).width() < 700) {
              // this.st.focus = false;
            } else {
              // this.st.focus = '#name';
            }
          },
        },
      },
    });
  }

  clickLike(id: any) {
    if (
      localStorage.getItem('Authorization') &&
      localStorage.getItem('Authorization') != null
    ) {
      this.apiService.like({ id: id }).subscribe(
        (updateData: any) => {
          this.spinner.hide();

          if (updateData && updateData['data']) {
            // this.toaster.success(updateData['message'], 'Success!')
            this.onClickRefresh();
          } else {
          }
        },
        (err: any) => {
          this.spinner.hide();
          if (err && err['message']) {
          }
        }
      );
    } else {
      // this.router.navigate(['']);
      this.toaster.error('Please sign in first.');
    }
  }

  //-------------------------- auction_end_date

  async onClickOPENAUCTION(type: any, id: any) {
    this.sellingType = type;
    this.id = id;
    if(this.userStatus=='deactivated'){
      this.toaster.warning("Your Account Has Been Deactivated by admin");
      this.router.navigate(['/'],);
      return;
    }
    let _id = this._route.snapshot.params['id'];
    await this.apiService.viewnft(id).subscribe(
      async (data: any) => {
        if (await data && await data['data']) {
          let res = await data['data'];

          this.NFTData = res;

          console.log("NFT DATA is------->",this.NFTData)
         
          if(await this.NFTData.sTransactionStatus==-2){
            this.toaster.warning("Admin Has Blocked This NFT");
            this.router.navigate(['/'],);
            return;
          }
          this.nftERC721Type = this.NFTData.erc721;
       

          this.CurrentUserID = res.loggedinUserId;
        
          if (res.erc721) {
            this.tokenType = true;
           
          } else {
            this.tokenType = false;
            this.ShowBuyBtnERC1155 = true;
            
          }
      
        } else {
        }
      },
      (error) => {
        if (error) {
        }
      }
    );
    $.magnificPopup.open({
      items: {
        src: '#modal-auction',
        type: 'inline',
        fixedContentPos: true,
        fixedBgPos: true,
        overflowY: 'auto',
        preloader: false,
        focus: '#username',
        modal: false,
        removalDelay: 300,
        mainClass: 'my-mfp-zoom-in',
        callbacks: {
          beforeOpen: function () {
            if ($(window).width() < 700) {
              // this.st.focus = false;
            } else {
              // this.st.focus = '#name';
            }
          },
        },
      },
    });
  }

  async onClickSubmitPutonTimeAuction() {
    if (
      localStorage.getItem('Authorization') &&
      localStorage.getItem('Authorization') != null
    ) {
      let obj: any = {
        nNFTId: this.id,
        sSellingType: this.sellingType,
      };

      let fd = this.timedAuctionForm.value;

      if (
        fd &&
        fd.days &&
        fd.days != undefined &&
        fd.days != null &&
        fd.days != ''
      ) {
        var dt = new Date();
        dt.setDate(dt.getDate() + parseInt(fd.days));

        obj.auction_end_date = dt;
      }

      this.toggleSellingType(obj);
    } else {
      // this.router.navigate(['']);
      this.toaster.error('Please sign in first.', 'Error');
    }
  }

  ConvertSectoDay(n: any) {
    let day: any = n / (24 * 3600);

    n = n % (24 * 3600);
    let hour: any = n / 3600;

    n %= 3600;
    let minutes: any = n / 60;

    n %= 60;
    let seconds: any = n;

    let a = '';

    if (parseInt(day) != 0) {
      this.auct_time.days = parseInt(day);
    }
    if (parseInt(hour) != 0) {
      this.auct_time.hours = parseInt(hour);
    }
    if (parseInt(minutes) != 0) {
      this.auct_time.mins = parseInt(minutes);
    }
    if (parseInt(seconds) != 0) {
      this.auct_time.secs = parseInt(seconds);
    }
    console.log('------------------------a', this.auct_time);
  }

  //

  startVideo(){
    $('.video-control-btn-singlePage.play').addClass('d-none');
		$('.video-control-btn-singlePage.pause').removeClass('d-none');
  }
  stopVideo(){
    $('.video-control-btn-singlePage.play').removeClass('d-none');
		$('.video-control-btn-singlePage.pause').addClass('d-none');
  }

  onClickAdd() {
    

    let transak = new transakSDK({
      apiKey: 'aa84ba7a-a889-4ca1-8e10-a70f384bbd81',  // Your API Key
      environment: 'STAGING', // STAGING/PRODUCTION
      hostURL: window.location.origin,
      widgetHeight: '550px',
      widgetWidth: '500px',
      // Examples of some of the customization parameters you can pass
      defaultCryptoCurrency: 'MATIC', // Example 'ETH'
      walletAddress: this.account[0], // Your customer's wallet address
      themeColor: '000000', // App theme color
      fiatCurrency: 'USD', // If you want to limit fiat selection eg 'USD'
      email: '', // Your customer's email address
      redirectURL: window.location.origin    
  });

    // let transak = new transakSDK({
    //   apiKey: 'aa84ba7a-a889-4ca1-8e10-a70f384bbd81', // Your API Key
    //   environment: 'STAGING', // STAGING/PRODUCTION
    //   defaultCryptoCurrency: 'POLYGON',
    //   walletAddress: this.account[0], // Your customer's wallet address
    //   themeColor: '000000', // App theme color
    //   fiatCurrency: 'USD ', // INR/GBP
    //   email: '', // Your customer's email address
    //   redirectURL: window.location.origin,
    //   hostURL: window.location.origin,
    //   widgetHeight: '550px',
    //   widgetWidth: '450px',
    // });

    transak.init();

    // To get all the events
    transak.on(transak.ALL_EVENTS, (data) => {
      console.log(data);
    });

    // This will trigger when the user marks payment is made.
    transak.on(transak.EVENTS.TRANSAK_ORDER_SUCCESSFUL, (orderData) => {
      console.log(orderData);
      transak.close();
    });
  }
  
  //Metamask Modal
 async metamaskOpenModal(NFTownerObj: any = {}) {
    await this.apiService.getprofile().subscribe(async(res: any) => {

      if (await res && await res['data']) {
        this.profileData = res['data'];
      
        if(this.profileData.sStatus ==='deactivated'){
          this.isActive=false
          this.toaster.error("Your Account is deactivated by Admin")
          this.router.navigate(['/'],);
          this.isShowPopupCancel=false
          return;
        };
        if(this.profileData.sStatus ==='blocked'){
          this.isActive=false
          this.toaster.error("Your Account is Temporarily suspended by Admin")
          this.isShowPopupCancel=false
          return;
        };
        this.userStatus=this.profileData.sStatus;
      
      
       
      }

    }, (err: any) => {
        
    });
    let id = this._route.snapshot.params['id'];
    await this.apiService.viewnft(id).subscribe(
      async (data: any) => {
        if (await data && await data['data']) {
          let res = await data['data'];

          this.NFTData = res;

          console.log("NFT DATA is------->",this.NFTData)
         
          if(await this.NFTData.sTransactionStatus==-2){
            this.toaster.warning("Admin Has Blocked This NFT");
            this.router.navigate(['/'],);
            return;
          }
          this.nftERC721Type = this.NFTData.erc721;
       

          this.CurrentUserID = res.loggedinUserId;
        
          if (res.erc721) {
            this.tokenType = true;
           
          } else {
            this.tokenType = false;
            this.ShowBuyBtnERC1155 = true;
            
          }
      
        } else {
        }
      },
      (error) => {
        if (error) {
        }
      }
    );
  
    let connect=localStorage.getItem('connected');
    if(this.isLogin==false && connect!=null ){
      this.toaster.error("Signin/SignUp Your Metamask");
      return;
    }else if(this.isLogin==false && connect==null){
      if(window.ethereum){
        this.toaster.error("Connect your metamask")
        return;
      }else if(this.userStatus=='deactivated'){
        this.toaster.warning("Your Account Has Been Deactivated by admin");
        this.router.navigate(['/'],);
        
        return;
      }else{
        $.magnificPopup.open({
          items: {
            src: '#metamaskModal',
            type: 'inline',
            fixedContentPos: true,
            fixedBgPos: true,
            overflowY: 'auto',
            preloader: false,
            focus: '#username',
            modal: false,
            removalDelay: 300,
            mainClass: 'my-mfp-zoom-in',
            callbacks: {
              beforeOpen: function () {
                if ($(window).width() < 700) {
                  // this.st.focus = false;
                } else {
                  // this.st.focus = '#name';
                }
              },
            },
          },
        });
      }
    
    }
  
  
    
   
  }
  
  

}

  

