import Web3 from 'web3';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  FormControl,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { Inject, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { event } from 'jquery';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { ApiService } from '../api.service';
import { ScriptLoaderService } from '../script-loader.service';
import dgnr8ABI from '../../environments/Config/abis/dgnr8.json';


import ExtendedERC721ABI from '../../environments/Config/abis/extendedERC721.json';



import ExtendedERC1155ABI from '../../environments/Config/abis/extendedERC1155.json';

import contracts from '../../environments/Config/contracts';

import { ethers } from 'ethers';
import { min, windowWhen } from 'rxjs/operators';
import { link } from 'fs';
import { Signer } from 'crypto';
import { parse } from 'path';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';


declare let window: any;

const web3 = new Web3('https://rpc-mumbai.maticvigil.com/');

@Component({
  selector: 'app-create-nft',
  templateUrl: './create-nft.component.html',
  styleUrls: ['./create-nft.component.css'],
  // changeDetection:ChangeDetectionStrategy.OnPush ,'../../assets/css/bootstrap-grid.min.css'
})
export class CreateNFTComponent implements OnInit, OnDestroy {
  profileData: any;
  form: any = 'COLLABORATOR';
  collectionList: any = [];
  categoriesList: any = [];
  collaboratorList: any = [];
  genreList: any = [];
  track_cover: any = '';
  fileName = '';
  flag: boolean = false;
  collabName = '';
  collabPercent = 100;
  blc_total_amt = 0;
  cPercent: any = [];
  hash: any;
  contractAddress: any;
  account: any;
  tokenAddress: any;
  tokenType: boolean = true;
  NFTprice: any;
  tokenId: Number = 0;
  tokenQuantity: Number = 0;
  deadline: Number = 0;
  salt: Number = 0;
  listingType: Number = 0;
  isDisable: boolean = true;
  auctionType:any=0;
  fileType:any="MP3"


  // let tokenId,tokenQuantity,value,deadline,salt,listingType

  coverName = '';
  public isCheckboxRequired = true;
 
  Data: Array<any> = [
    { name: 'Afro House', value: 'Afro House' },
    { name: 'Ambient', value: 'Ambient' },
    { name: 'Bass House', value: 'Bass House' },
    { name: 'Breakbeat', value: 'Breakbeat' },
    { name: 'Deep House', value: 'Deep House' },
    { name: 'Disco', value: 'Disco' },
    { name: 'DnB', value: 'DnB' },
    { name: 'Downtempo', value: 'Downtempo' },
    { name: 'Dubstep', value: 'Dubstep' },
    { name: 'Electro', value: 'Electro' },
    { name: 'Electronica', value: 'Electronica' },
    { name: 'Hard Dance', value: 'Hard Dance' },
    { name: 'House', value: 'House' },
    { name: 'Indie Dance', value: 'Indie Dance' },
    { name: 'Jackin House', value: 'Jackin House' },
    { name: 'Minimal', value: 'Minimal' },
    { name: 'Progressive House', value: 'Progressive House' },
    { name: 'Tech House', value: 'Tech House' },
    { name: 'Techno', value: 'Techno' },
    { name: 'Trance', value: 'Trance' },
    { name: 'Trap', value: 'Trap' },
    { name: 'UK Garage', value: 'UK Garage' }
  ];

  /************ Create NFT Popup Checks ********** */

  isShowPopup: boolean = false;
  isEnablePopup: boolean = true;
  hideClosePopup: boolean = true;
  hideRedirectPopup: boolean = false;
  isUploadPopupClass: string = 'checkiconDefault';
  isMintPopupClass: string = 'checkiconDefault';
  isRoyalityPopupClass: string = 'checkiconDefault';
  isApprovePopupClass: string = 'checkiconDefault';
  isPutOnSalePopupClass: string = 'checkiconDefault';
  isCompletedPopupClass: string = 'checkiconDefault';
  resetPopUpClass() {
    this.isEnablePopup = false;
  }
  closePopup(){
    this.onClickRefresh();
  }
  showRedirectBtn(){
    this.hideClosePopup = false;
    this.hideRedirectPopup = true;
  }
  clickRedirectBtn(){
    this.router.navigate(['/my-profile'], {
      relativeTo: this._route,
      queryParams: {
        tab: 'created',
      },
    });
  }

  /************ Create Album Popup Checks ********** */
  isShowPopupAlbum: boolean = false;
  isCreateAlbumEnablePopup: boolean = true;
  isCreateAlbumDeploy: string = 'checkiconDefault';
  isCreateAlbumCrteated: string = 'checkiconDefault';

  resetAlbumCreatePopUpClass() {
    this.isCreateAlbumEnablePopup = false;
  }
  

  isMarketPlace: boolean = true;
  toggleMarketPlace() {
    this.isMarketPlace = !this.isMarketPlace;
  }

  isUnlock:boolean=false;
  unlockOncePurchased() {
    this.isUnlock = !this.isUnlock;
  }

  onSkip() {
    if (this.form === 'COLLABORATOR') {
      this.form === '';
    }
  }

  isSingle: boolean = false;
  isMultiple: boolean = false;
  isBtn: boolean = true;
  toggleSingle() {
    this.isSingle = !this.isSingle;

    this.isBtn = !this.isBtn;
  }
  toggleMultiple() {
    this.isMultiple = !this.isMultiple;
    this.isBtn = !this.isBtn;
  }

  createNFTForm: any;
  submitted3: Boolean = false;
  file: any;

  createCollectionForm: any;
  submitted1: Boolean = false;
  nftFile: any;

  createCollaboratorForm: any;
  submitted2: Boolean = false;
  allCollectionList:any;

  sCollabARY: any;

  constructor(
    private _formBuilder: FormBuilder,
    private _script: ScriptLoaderService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private cd: ChangeDetectorRef,
    private _route: ActivatedRoute,
    private toaster: ToastrService,
    private apiService: ApiService
  ) {
    sCollabARY: FormArray;
  }

  clickSetForm(type: any) {
    this.isSingle = false;
    this.isMultiple = false;
    this.isBtn = true;

    this.form = type;
  }

  async ngOnInit() {
    
    let connect=localStorage.getItem('connected')
    if(connect=='false'||connect==null){
      this.router.navigate(['/'], {
        relativeTo: this._route,
        
      });
      this.toaster.error("Connect Your Metamask")
      return;
    }
    
    this.buildCreateCollectionForm();
    this.buildCreateCollaboratorForm();
    this.buildCreateNFTForm();
    

    this.account = await this.apiService.connect();
   
    let profile:any=await this.apiService.getprofile().subscribe(async(res:any)=>{
      if (res && res['data']) {
        
        this.profileData = res['data'];

        if(this.profileData.sStatus=="blocked"){
          this.router.navigate(['/'], {
            relativeTo: this._route,
            
          });
          this.toaster.error("Your Account is temporarily suspended by admin")
          return;
        }
      }
    })

 

    // this.createNFT();

    await this.apiService.landingPage().subscribe(async (data: any) => {
      if (data['message'] == 'success') {
        this.allCollectionList = await data['data'];
     
      }
    })

    let scripts: string[] = [];
    scripts = [
      '../../assets/js/jquery-3.5.1.min.js',
      '../../assets/js/owl.carousel.min.js',
      '../../assets/js/bootstrap.bundle.min.js',

      '../../assets/js/jquery.magnific-popup.min.js',
      '../../assets/js/select2.min.js',
      '../../assets/js/smooth-scrollbar.js',
      '../../assets/js/jquery.countdown.min.js',
      '../../assets/js/main.js',
    ];
    var res = '';
   

    const that = this;
    await this._script
      .loadScripts('app-create-nft', scripts)
      .then(async function () {
      
      });

    if (
      localStorage.getItem('Authorization') &&
      localStorage.getItem('Authorization') != null
    ) {
      await that.getProfile();
      await that.getCollectionList();

      await that.getCategories();
      await that.getColoboraterList();
    } else {
      that.toaster.success('Please signin first.');
      that.router.navigate(['']);
    }
  }

  //Signature structure

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

  async getSignature(signer, ...args: any) {
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

  createItem() {
    return this._formBuilder.group({
      sCollaborator: ['', []],
      nCollaboratorPercentage: ['0', []],
    });
  }

  buildCreateCollectionForm() {
    this.createCollectionForm = this._formBuilder.group({
      sName: ['', [Validators.required, Validators.pattern(/[\S]/)]],
      sSymbol: ['', [Validators.required, Validators.pattern(/[\S]/)]],
      sRoyality: ['', [Validators.required]],
      sDescription: ['', [Validators.required, Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/)]],
      sFile: ['', []],
      sContractAddress: [''],
      erc721: [false],
    });
  }

 

  buildCreateCollaboratorForm() {
    this.createCollaboratorForm = this._formBuilder.group({
      sFullname: ['', [Validators.required]],
      sAddress: [
        '',
        [Validators.required, Validators.pattern('^0x[a-fA-F0-9]{40}$')],
      ],
    });
  }
  
  calPercent() {
    this.collabPercent = 100;
    let total_amt = 0;
    const arry = this.createNFTForm.get('sCollabARY') as FormArray;
    for (let i = 0; i < arry.value.length; i++) {
      if (arry.value[i].nCollaboratorPercentage != null) {
        total_amt = total_amt + parseInt(arry.value[i].nCollaboratorPercentage);
      }
    }
    if (this.collabPercent > total_amt) {
      this.collabPercent -= total_amt;
    } else {
      this.collabPercent = 0;
    }
    this.blc_total_amt = total_amt;
  }

  percentCheck(e: any, i: number) {
    const arry: any = this.createNFTForm.get('sCollabARY') as FormArray;

    this.calPercent();
    let remAmt = 0;
    
    if (this.blc_total_amt > 100) {
      remAmt = this.blc_total_amt - 100;
      remAmt = e.target.value - remAmt;
    } else {
      remAmt = this.collabPercent - this.blc_total_amt;
    }
 
    if (e.target.value) {
      if (
        parseInt(e.target.value) > this.collabPercent &&
        this.collabPercent == 0 &&
        this.blc_total_amt != 100
      ) {
        this.toaster.warning('Enter percentage under' + remAmt + '% .');
        this.cPercent[i] = null;
      }
    } else {
      this.cPercent[i] = null;
    }
  }

  collabCheck(e: any, j: number) {
    const arry: any = this.createNFTForm.get('sCollabARY') as FormArray;

    if (arry.length && arry.length != 1) {
      for (let i = 0; i < arry.value.length; i++) {
        if (
          i != j &&
          arry.value[i].sCollaborator == arry.value[j].sCollaborator
        ) {
          this.toaster.warning('collaborator already exists', 'Error!');
          this.sCollabARY.removeAt(j);
          this.cPercent.splice(j, 1);
          this.calPercent();
        }
      }
    }
  }

  addItem() {
    this.sCollabARY = this.createNFTForm.get('sCollabARY') as FormArray;

    const aryLength: number = this.sCollabARY.value.length;

    if (this.collabPercent < 100 && this.collabPercent > 0) {
      if (
        this.sCollabARY.value[aryLength - 1].sCollaborator == '' ||
        this.sCollabARY.value[aryLength - 1].nCollaboratorPercentage == 0
      ) {
        this.toaster.warning('add collaborator and its percentage', 'Error!');
      } else {
        this.sCollabARY.push(this.createItem());
        this.calPercent();
      
      }
    } else {
      if (
        this.sCollabARY.value[aryLength - 1].sCollaborator == '' ||
        this.sCollabARY.value[aryLength - 1].nCollaboratorPercentage == 0
      ) {
        this.toaster.warning('add collaborator and its percentage', 'Error!');
      } else {
        this.toaster.warning(
          'total 100% collaboration has been distributed',
          'Error!'
        );
      }
    }
  }
  removeItem(i: number) {
    this.collabPercent += Number(
      this.sCollabARY.value[i].nCollaboratorPercentage
    );
  

  
    this.sCollabARY.removeAt(i);
    this.cPercent.splice(i, 1);
    // this.sCollabARY.value.splice(i, 1);
  

    this.calPercent();
  }

  buildCreateNFTForm() {
    this.createNFTForm = this._formBuilder.group({
      sName: ['', [Validators.required]],
      sCollection: [{}, [Validators.required]],
      eType: ['Audio', [Validators.required]],
      nQuantity: ['1', [Validators.required]],
      sNftdescription: ['', [Validators.required]],
      // 'Auction', 'Fixed Sale', 'Unlockable'
      eAuctionType: ['Fixed Sale', [Validators.required]],
      nBasePrice: ['', [Validators.required]],
      // TODO multiple
      // sCollaborator: ['', []],
      // nCollaboratorPercentage: ['', []],
      sCollabARY: this._formBuilder.array([this.createItem()]),
      sSetRoyaltyPercentage: ['10', []],
      nftFile: ['', []],
      genreList: ['', []],

      sBpm: ['21', [Validators.required]],
      skey_equalTo: ['9', [Validators.required]],
      skey_harmonicTo: ['11', [Validators.required]],
      track_cover: ['', []],
      contractAddress: ['', []],
      sOrder: [[], []],
      sSignature: [[], []],
      nTokenID: ['', []],
      erc721: [false],
      sTransactionStatus: ['-99', []],
      hiddenContent:['']
     
    });
  }

  changeTokenType(e) {
    
    let value = e.target.value;
    let collection_array = value.split('-');

    if (collection_array[1] === 'false') {
      
      this.tokenType = false;
      this.createNFTForm.controls['nQuantity'].enable();
    } else {
      
      this.createNFTForm.controls['nQuantity'].disable();
      this.createNFTForm.controls['nQuantity'].setValue(1);
      this.tokenType = true;
    }
  }

  onClickRadio(type: any) {
     if(type=='Auction'){
       this.auctionType=1
     }else{
       this.auctionType=0
     }

    if (type == 'Auction' || 'Fixed Sale') {
      this.createNFTForm.controls['nBasePrice'].clearValidators();
      this.createNFTForm.controls['nBasePrice'].updateValueAndValidity();
    } else {
      this.createNFTForm.controls['nBasePrice'].setValidators([
        Validators.required,
      ]);
      this.createNFTForm.controls['nBasePrice'].updateValueAndValidity();
    }
  }

  onCheckboxChange(e: any) {
    if (e.target.checked) {
    
      this.genreList.push(e.target.value);
      // this.cd.detectChanges();

  
    } else {
      for (let i = 0; i < this.genreList.length; i++) {
        if (e.target.value == this.genreList[i]) {
          this.genreList.splice(i, 1);
     
        }
      }
    }
  }

  getProfile() {
    this.apiService.getprofile().subscribe(
      async (res: any) => {
        if (res && res['data']) {
         
          this.profileData = await res['data'];
          this.profileData.sProfilePicUrl =
            this.profileData.sProfilePicUrl == undefined
              ? 'assets/img/avatars/avatar5.jpg'
              : 'https://ipfs.infura.io/ipfs/' +
                this.profileData.sProfilePicUrl;
          this.profileData.sFirstname =
            this.profileData &&
            this.profileData.oName &&
            this.profileData.oName.sFirstname
              ? this.profileData.oName.sFirstname
              : '';
          this.profileData.sLastname =
            this.profileData &&
            this.profileData.oName &&
            this.profileData.oName.sLastname
              ? this.profileData.oName.sLastname
              : '';

          var NFTinstance = await this.apiService.exportInstance(
            environment.NFTaddress,
            environment.NFTabi
          );

          if (NFTinstance && NFTinstance != undefined) {
            // let nAdminCommissionPercentage = await NFTinstance.methods.getAdminCommissionPercentage().call({ from: this.profileData.sWalletAddress });
           
            // // mintToken(bool,string,string,uint256,uint8,address[],uint8[])
            // let nEstimatedGasLimit = await NFTinstance.methods.mintToken(true, 'QmT1omejnb9vnAzpyZbVec7tNmM4GfbZZXpoKv4VVU6iGW', 'MARIO NFT', 10, 5, [
            //   "0x79647CC2A785B63c2A7A5D324b2D15c0CA17115D",
            //   "0x5138d8D462DC20b371b5df7588099e46d8c177A3"
            // ], [
            //   '3',
            //   '97'
            // ]).estimateGas({
            //   from: '0x5138d8D462DC20b371b5df7588099e46d8c177A3',
            //   value: 1
            // });
           
            // let nGasPrice = parseInt(await window.web3.eth.getGasPrice());
      
            // let nTotalTransactionCost = nGasPrice * nEstimatedGasLimit;
     
            // let nAdminCommission = (nTotalTransactionCost * nAdminCommissionPercentage) / 100;
           
            // const that = this;
            // await NFTinstance.methods.mintToken(true, 'QmT1omejnb9vnAzpyZbVec7tNmM4GfbZZXpoKv4VVU6iGW', 'MARIO NFT', 10, 5, [
            //   "0x79647CC2A785B63c2A7A5D324b2D15c0CA17115D",
            //   "0x5138d8D462DC20b371b5df7588099e46d8c177A3"
            // ], [
            //   3,97
            // ])
            //   .send({
            //     from: this.profileData.sWalletAddress
            //   })
            //   .on('transactionHash', async (hash: any) => {
            //     this.spinner.hide();
          
            //   })
            //   .catch(function (error: any) {
            //     that.spinner.hide();
         
            //     if (error.code == 32603) {
            //       that.toaster.error("You're connected to wrong network!");
            //     }
            //     if (error.code == 4001) {
            //       that.toaster.error("You Denied Transaction Signature");
            //     }
            //   });
          } else {
            this.spinner.hide();
            this.toaster.error(
              'There is something issue with NFT address.',
              'Error!'
            );
          }
        }
      },
      (err: any) => {}
    );
  }

  getCollectionList() {
    this.apiService.getCollectionList().subscribe(
      (res: any) => {
    
        if (res && res['data']) {
          this.collectionList = res['data'];
    
        }
      },
      (err: any) => {}
    );
  }

  getCategories() {
    this.apiService.getCategories().subscribe(
      (res: any) => {
        if (res && res['data']) {
          this.categoriesList = res['data'].aCategories;
        }
      },
      (err: any) => {}
    );
  }

  getColoboraterList() {
    this.apiService.getColoboraterList().subscribe(
      (res: any) => {
        if (res && res['data']) {
          this.collaboratorList = res['data'];
        }
      },
      (err: any) => {}
    );
  }
  removeTrack(event: any) {
    event.stopPropagation();
    this.fileName = '';
    this.file = '';
    this.coverName = '';

    // event.target.files[0].reset()

  }
  onSelectDocumentTRACk(event: any) {
    if (event.target.files && event.target.files[0]) {


      if (event.target.files[0].name.match(/\.(jpeg|jpg|png|mp3|gif)$/)) {
       
        let collection_array = this.createNFTForm.value.sCollection.split('-');

       console.log("collection array is-------->",collection_array)

        let formValue = this.createNFTForm.value;
        // let collaborator=this.getColoboraterList();
        let nftType = false;
        let nftContract = collection_array[0];
        this.tokenAddress = nftContract;
    
        if (collection_array[1] === 'true') {
          nftType = true;
          this.tokenType = true;
        } else {
          this.tokenType = false;
        }

        this.apiService
          .uploadData(event.target.files[0])
          .subscribe((resData: any) => {
            if (resData && resData != null && resData['data'] != undefined) {
              resData = resData['data'];
             
              if (resData && resData.track_cover != undefined) {
                this.track_cover =
                  'https://ipfs.infura.io/ipfs/' +
                  resData.track_cover;
              }
            }
          });
      }
    }
    const file: File = event.target.files[0];
    if (file) {
      this.coverName = file.name;
    }
   
  }

  //check price

 priceValidation(event:any){
   
   var charCode = (event.which) ? event.which : event.keyCode;
    if (charCode != 46 && charCode > 31
      && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    }else{
      return true;
    }

 }
  removeFiles(event: any) {
    event.stopPropagation();
    this.coverName = '';
    this.fileName = '';
    this.track_cover = '';
  }
  onSelectDocumentNFT(event: any) {
    const file1: File = event.target.files[0];
    var fileSize: Number = Number((file1.size / 1024 / 1024).toFixed(3));
    this.fileName = '';
    if (event.target.files && event.target.files[0]) {
      if (event.target.files[0].name.match(/\.(mp3|mp4)$/)) {
        if (fileSize < 100) {
          this.fileName = file1.name;
          this.file = event.target.files[0];
        } else {
          this.toaster.warning('File Size exceeds 100MB', 'Error!');
        }
      } else {
        this.toaster.warning('upload mp3 file only', 'Error!');
      }
    }
  }

  onSelectDocumentCollection(event: any) {
    if (event.target.files && event.target.files[0]) {
      if (event.target.files[0].name.match(/\.(jpeg|jpg|png|gif)$/)) {
        this.nftFile = event.target.files[0];
      }
    }
  }

  async readReceipt() {
    let provider = new ethers.providers.Web3Provider(window.ethereum);

    const receipt = await provider.getTransactionReceipt(this.hash.hash);
    

   

    this.contractAddress = receipt.logs[0].address;

    return receipt.logs[0].address;
  }

  async onClickSubmitCollection() {
    

    let royality=parseFloat(this.createCollectionForm.value.sRoyality);
    console.log("create collection form",this.createCollaboratorForm.value)


    let alreadyExistSname:any

    var id= this.allCollectionList.collections.find((user) =>{
      if(user.sName === this.createCollectionForm.value.sName){
        alreadyExistSname=true;
      
        return;
      };
      
    })
    if(alreadyExistSname){
      this.toaster.error("Album Name Already Taken! Choose Another Name");
      return;
    }

    if(royality>100){
      this.toaster.error("Royalty Cannot be more than 100%");
      return;
    }

    if (this.nftFile && this.nftFile != undefined) {
      this.isShowPopupAlbum = true;
      this.submitted1 = true;
      if (this.createCollectionForm.invalid) {
        this.isShowPopupAlbum = false;
        if(this.createCollectionForm.value.sName.trim().length === 0){
          this.toaster.error("Name cannot be empty")
          return;
        }
        if(this.createCollectionForm.value.sSymbol.trim().length === 0){
          this.toaster.error("Symbol cannot be empty")
          return;
        }
    
       
        
        return;
      } else {
        this.isCreateAlbumDeploy = "clockloader";

        let res = this.createCollectionForm.value;

        var name = res.sName;
        
        var symbol = res.sSymbol;
       
        var royalty = parseInt(res.sRoyality);
        royalty = royalty * 100;
        var image = this.nftFile.name;
        var erc721 = this.isSingle;
        //let uri="https://ipfs.infura.io/ipfs/"+returnData.metaDataHash;

        var contract: any = await this.apiService.exportInstance( contracts.NFT, dgnr8ABI);
        
        let res1;

        if (this.isSingle === true) {
          try {
            res1 = await contract.deployExtendedERC721( name, symbol,"www.image.com", royalty,contracts.ERC20 );
          } catch (e) {
            

            this.isCreateAlbumDeploy = "errorIcon";
            this.toaster['error'](
              e.code == 4001
                ? 'You Denied MetaMask Transaction Signature'
                : 'Something Went Wrong!'
            );
            this.resetAlbumCreatePopUpClass();
            return;
          }
        } else {
         
          try {
            res1 = await contract.deployExtendedERC1155(image, royalty,contracts.ERC20);
          } catch (e) {
            
            this.toaster['error'](
              e.code == 4001
                ? 'You Denied MetaMask Transaction Signature'
                : 'Something Went Wrong!'
            );
            this.isCreateAlbumDeploy = "errorIcon";
            this.resetAlbumCreatePopUpClass();
            return;
          }
        }

        this.hash = res1;
        res1 = await res1.wait();
       
        if (res1.status === 1) {
          this.contractAddress = await this.readReceipt();
          if(this.isSingle === true){
            let defaultRoyalty:any
             defaultRoyalty=await this.apiService.exportInstance(this.contractAddress,ExtendedERC721ABI.abi)
           console.log("extended erc721 abi is------->",defaultRoyalty)
           
            let royalty=await defaultRoyalty.setDefaultRoyaltyDistribution(
              ["0xd7727232f4F4BCa3aC371d560DEb55EA438f8647"],
              ["1000"]
              );
          }else{
            let defaultRoyalty:any
             defaultRoyalty=await this.apiService.exportInstance(this.contractAddress,ExtendedERC1155ABI.abi)
          
            let royalty=await defaultRoyalty.setDefaultRoyaltyDistribution(
              ["0xd7727232f4F4BCa3aC371d560DEb55EA438f8647"],
              ["1000"]
              );
          }
         
        } else if (res.status === 0) {
          this.toaster.error('Collection Failed');
          this.isCreateAlbumDeploy = "errorIcon";
          this.resetAlbumCreatePopUpClass();
          return;
        }
        this.isCreateAlbumDeploy = "checkiconCompleted";
        this.isCreateAlbumCrteated = "clockloader";
        

        var fd = new FormData();
        const nftType = this.isSingle;

        fd.append('sName', res.sName);
        fd.append('sDescription', res.sDescription);
        fd.append('nftFile', this.nftFile);
        fd.append('sContractAddress', this.contractAddress);
        fd.append('erc721', JSON.stringify(nftType));

      

        this.apiService.createCollection(fd).subscribe(
          (updateData: any) => {
            this.spinner.hide();

            if (updateData && updateData['data']) {
              this.toaster.success(updateData['message'], 'Success!');
              this.isCreateAlbumCrteated = "checkiconCompleted";
              this.resetAlbumCreatePopUpClass();
            } else {
            }
          },
          (error: any) => {
            this.isCreateAlbumCrteated = "errorIcon";
            this.resetAlbumCreatePopUpClass();
            this.toaster['error'](
              error.code == 4001
                ? 'You Denied MetaMask Transaction Signature'
                : 'Something Went Wrong!'
            );
          }
        );
      }
    } else {
      this.resetAlbumCreatePopUpClass();
      this.toaster.warning('Please select image.', 'Error!');
    }
  }
  onClickSubmitCollaborator() {
    this.spinner.show();
    this.submitted2 = true;
    if (this.createCollaboratorForm.invalid) {
      this.toaster.error("Invalid collaborator address")
      this.spinner.hide();
      return;
    } else {
      let res = this.createCollaboratorForm.value;
      var fd = {
        sFullname: res.sFullname,
        sAddress: res.sAddress,
      };

      

      this.apiService.createCollaborator(fd).subscribe(
        (updateData: any) => {
          this.spinner.hide();

          if (updateData && updateData['data']) {
            this.toaster.success(updateData['message'], 'Success!');
            this.onClickRefresh();
          } else {
          }
        },
        (err: any) => {
          this.spinner.hide();
          if (err && err['message']) {
            err = err['error'];
            this.toaster.error(err['message'], 'Error!');
          }
        }
      );
    }
  }

  async mintNft(nftContract: any, nftType: any, mintIndex: any,amount:any) {
    try {
      this.isUploadPopupClass = 'checkiconCompleted';
      var NFTcontract;
     
      let collab = [];
      if (this.createNFTForm.value.sCollabARY != 0) {
        collab = this.createNFTForm.value.sCollabARY;
      }
      let sCollab = ['0'];
      let sCollabPerc = [0];
      
      if (collab.length === 0) {
        this.toaster.warning('Please enter Collaborator');
      } else {
        if (collab.length === 1) {
          if (this.createNFTForm.value.sCollabARY[0].sCollaborator === '') {
            sCollab[0] = '0x11f674B13DD4631531ED690D895C82DE5BE51264';
          } else {
            sCollab[0] = this.createNFTForm.value.sCollabARY[0].sCollaborator;
          }
          if (
            this.createNFTForm.value.sCollabARY[0].nCollaboratorPercentage ===
            undefined
          ) {
            sCollabPerc[0] = 1000;
          } else {
            sCollabPerc[0] = parseInt(
              this.createNFTForm.value.sCollabARY[0].nCollaboratorPercentage,
              10
            )*100;
          }

       
        } else {
          for (let i = 0; i <= collab.length - 1; i++) {
            if (this.createNFTForm.value.sCollabARY[i].sCollaborator === '') {
              sCollab[i] = '0';
            } else {
              sCollab[i] = this.createNFTForm.value.sCollabARY[i].sCollaborator;
            }
            if (
              this.createNFTForm.value.sCollabARY[i].nCollaboratorPercentage ===
              undefined
            ) {
              sCollabPerc[i] = 0;
            } else {
              sCollabPerc[i] = parseInt(
                this.createNFTForm.value.sCollabARY[i].nCollaboratorPercentage,
                10
              )*100;
            }
          }
       
        }
      }
      if (nftType === true) {
        NFTcontract = await this.apiService.exportInstance(
          nftContract,
          ExtendedERC721ABI.abi
        );
        
        
        
        this.isApprovePopupClass = 'clockloader';
        let approval = await NFTcontract.isApprovedForAll(
          this.account[0],
          contracts.MARKETPLACE
        );

        if (!approval) {
          let approvalres = await NFTcontract.setApprovalForAll(
            contracts.MARKETPLACE,
            true
          );
          this.isApprovePopupClass = 'clockloader';
        
        } else {
          this.isApprovePopupClass = 'checkiconCompleted';
          this.isMintPopupClass = 'clockloader';
         
        }

        this.isApprovePopupClass = 'checkiconCompleted';
        this.isMintPopupClass = 'clockloader';
        let mintres = await NFTcontract.mint(this.account[0], mintIndex);

        let res = await mintres.wait();
        
        

        if (res.status === 0) {
          this.toaster.show('Transaction failed');
          this.isMintPopupClass = 'errorIcon';
        }
     
        this.isMintPopupClass = 'checkiconCompleted';
        this.isRoyalityPopupClass = 'clockloader';
         
      
     
        
   try{
    let collaborator = await NFTcontract.setTokenRoyaltyDistribution(
      sCollab,
      sCollabPerc,
      mintIndex
      
    );
  
    let collab = await collaborator.wait();

  
    this.isRoyalityPopupClass = 'checkiconCompleted';
   }catch(error){
    this.toaster['error'](
      error.code == 4001
        ? 'You Denied MetaMask Transaction Signature'
        : 'Something Went Wrong!'
    );
    this.isRoyalityPopupClass = 'errorIcon';
   }
   return res.status;
     
      } else {
        NFTcontract = await this.apiService.exportInstance(
          nftContract,
          ExtendedERC1155ABI.abi
        );
        this.isApprovePopupClass = 'clockloader';
        let approval = await NFTcontract.isApprovedForAll(
          this.account[0],
          contracts.MARKETPLACE
        );

        if (!approval) {
          let approvalres = await NFTcontract.setApprovalForAll(
            contracts.MARKETPLACE,
            true
          );
          this.isApprovePopupClass = 'clockloader';
         
        } else {
          this.isApprovePopupClass = 'checkiconCompleted';
          this.isMintPopupClass = 'clockloader';
        
        }

        this.isApprovePopupClass = 'checkiconCompleted';
        this.isMintPopupClass = 'clockloader';
       
        let mintres = await NFTcontract.mint(this.account[0], mintIndex, amount);
        
        
        let res = await mintres.wait();
        
      
        if (res.status === 0) {
          this.isMintPopupClass = 'errorIcon';
          this.toaster.show('Transaction failed');
        }
        this.isMintPopupClass = 'checkiconCompleted';
        this.isRoyalityPopupClass = 'clockloader';
      
        try{
          let collaborator = await NFTcontract.setTokenRoyaltyDistribution(
            sCollab,
            sCollabPerc,
            mintIndex
         
          );
          let collab = await collaborator.wait();
         
          this.isRoyalityPopupClass = 'checkiconCompleted';
        }catch(error){
          this.toaster['error'](
            error.code == 4001
              ? 'You Denied MetaMask Transaction Signature'
              : 'Something Went Wrong!'
          );
          this.isRoyalityPopupClass = 'errorIcon';
        }
       
       

        
        return res.status;
      }
    } catch (error) {
      this.toaster['error'](
        error.code == 4001
          ? 'You Denied MetaMask Transaction Signature'
          : 'Something Went Wrong!'
      );
      // this.isShowPopup = false;
      this.isMintPopupClass = 'errorIcon';
      this.resetPopUpClass();
    
    }
  }

  async onClickSubmitNFT() {
    // ******testing*******
   
    if (this.createNFTForm.value.sCollection === '{}') {
      this.toaster.warning('Select Collection');
      return;
    }
    if(this.createNFTForm.value.nBasePrice==''){
      this.toaster.warning('Invalid Price');
      return;

    }
    let a = this.createNFTForm.value.sCollection;
    JSON.stringify(a);
    if (Object.keys(a).length < 1) {
      this.toaster.warning('Please Choose/Create Collection');
      return;
    }
    let collection_array = this.createNFTForm.value.sCollection.split('-');



    let formValue = this.createNFTForm.value;
    // let collaborator=this.getColoboraterList();
    let nftType = false;
    let nftContract = collection_array[0];
    this.tokenAddress = nftContract;

    if (collection_array[1] === 'true') {
      nftType = true;
      this.tokenType = true;
    } else {
      this.tokenType = false;
    }

    let mintIndex = collection_array[2];
    // let idToMint=parseInt(mintIndex)+1;
    mintIndex = parseInt(mintIndex, 10);
    this.tokenId = mintIndex + 1;

    var NFTcontract;
    var erc721 = this.isSingle;

    // ******main code ****

    //mint process

    
    //NFT Databse

  
    
   

    if (this.track_cover && this.track_cover != '') {
     
      if (this.file && this.file != undefined) {
        if (this.genreList && this.genreList != '') {
          this.isShowPopup = true;
          this.isUploadPopupClass = 'clockloader';
         
          this.submitted3 = true;
          if (this.createNFTForm.invalid) {
            // this.isShowPopup = false;
            this.isUploadPopupClass = 'errorIcon';
            this.resetPopUpClass();
            return;
          } else {
            let res = this.createNFTForm.value;
                  
            var fd = new FormData();
            fd.append('track_cover', this.track_cover);
            fd.append('sBpm', res.sBpm);
            fd.append('skey_equalTo', res.skey_equalTo);
            fd.append('skey_harmonicTo', res.skey_harmonicTo);
            fd.append('nftFile', this.file);
            fd.append('sName', res.sName);
            fd.append('hiddenContent',res.hiddenContent)
            // fd.append('sCollection', res.sCollection);
            fd.append('sCollection', nftContract);
            let eType="Audio";
            if(this.fileType==="MP4"){
              eType="Video"
            }
            fd.append('eType',eType);
            if (this.tokenType === true) {
              this.tokenQuantity = 1;
              
              fd.append('nQuantity', '1');
              fd.append('nQuantityOnSale','1')
            } else {
              this.tokenQuantity = res.nQuantity;

              fd.append('nQuantity', res.nQuantity);
              fd.append('nQuantityOnSale',res.nQuantity)
            }
            fd.append('sGenre', JSON.stringify(this.genreList));
            let collab_str = new Array();
            let collab_per = new Array();
            let collabTotal = 0;
            let collab_percentage = 0;
            res.sCollabARY.forEach(function (CollabVal) {
              if (
                CollabVal.sCollaborator &&
                CollabVal.sCollaborator != undefined &&
                CollabVal.sCollaborator != null
              ) {
                collab_str.push(CollabVal.sCollaborator);
                collab_per.push(CollabVal.nCollaboratorPercentage);
                collabTotal =
                  collabTotal + parseInt(CollabVal.nCollaboratorPercentage);
              }
            });
            collab_percentage = 100 - collabTotal;
           
            if(this.profileData===""||this.profileData==='undefined'){
              this.toaster.error("please Logout and Login Again")
              return;
            }
            collab_str.push(this.profileData.sWalletAddress);
           
            collab_per.push(collab_percentage);
            fd.append('sCollaborator', collab_str.join(','));
            fd.append('nCollaboratorPercentage', collab_per.join(','));
          
            fd.append('erc721', JSON.stringify(nftType));
            fd.append('contractAddress', nftContract);
            fd.append(
              'sSetRoyaltyPercentage',
              res.sSetRoyaltyPercentage ? res.sSetRoyaltyPercentage : 0
            );
            fd.append('sNftdescription', res.sNftdescription);
            fd.append('eAuctionType', res.eAuctionType);
            let transactionStatus;
            if (this.isMarketPlace === true) {
              transactionStatus = 1;
            } else {
              transactionStatus = -99;
            }
            fd.append('sTransactionStatus', transactionStatus);

            let onMarketPlace;
            if (this.isMarketPlace === true) {
              onMarketPlace = 1;
            } else {
              onMarketPlace = 0;
            }
            fd.append('onMarketPlace', onMarketPlace);
            if (
              res.eAuctionType == 'Auction' ||
              res.eAuctionType == 'Fixed Sale'
            ) {
              fd.append('nBasePrice', res.nBasePrice ? res.nBasePrice : 0);
              this.NFTprice = res.nBasePrice;
            } else {
              fd.append('nBasePrice', '0.000001');
            }

            if (res.eAuctionType == 'Auction') {
              this.listingType = 1;
            } else {
              this.listingType = 0;
            }

            //mint nft based on its type (erc721 or erc1155)
            let price = this.NFTprice;
            price = price.toString();
            //Creating different signature for different listing type
            let sellerOrder: any[];
            if (this.listingType == 0) {
              sellerOrder = [
                this.account[0],
                this.tokenAddress,
                this.tokenId,
                this.tokenQuantity,
                this.listingType,
                '0x0000000000000000000000000000000000000000',
                ethers.utils.parseEther(price).toString(),
                1770004490,
                [],
                [],
                Math.round(Math.random()*100000000+5),
              ];
            } else {
              sellerOrder = [
                this.account[0],
                this.tokenAddress,
                this.tokenId,
                this.tokenQuantity,
                this.listingType,
                '0xE47cd1c32F45E90d87dd74102Ee41529a6F30372',
                ethers.utils.parseEther(price).toString(),
                2529288881,
                [],
                [],
                Math.round(Math.random()*100000000+5),
              ];
            }

        
            let signature: any;
            try {
              signature = await this.getSignature(
                this.account[0],
                ...sellerOrder
              );
              this.isUploadPopupClass = 'clockloader';
            
            } catch (error) {
              this.toaster['error'](
                error.code == 4001
                  ? 'You Denied MetaMask Transaction Signature'
                  : 'Something Went Wrong!'
              );
     
              this.isUploadPopupClass = 'errorIcon';
              this.resetPopUpClass();
              return;
            }

          
            sellerOrder.forEach(async function (sellerInfo) {
              fd.append('sOrder[]', sellerInfo);
            });

            signature.forEach(async function (signatureInfo) {
              fd.append('sSignature[]', signatureInfo.toString());
            });

            fd.append('sSignature', signature.toString());
            fd.append('nTokenID', mintIndex);

            try {
              await this.apiService.updateCollectionToken(nftContract).subscribe();
              let mintres = await this.mintNft(
                nftContract,
                nftType,
                this.tokenId,
                res.nQuantity

              );
              if (mintres !== 1) {
                this.toaster.error('There is something issue with minting');
                // this.isShowPopup = false;
                // this.isUploadPopupClass = 'errorIcon';
                this.resetPopUpClass();
                return;
              }
              this.isPutOnSalePopupClass = 'clockloader';
              
              await this.apiService.createNFT(fd).subscribe(
                async (data: any) => {
                  if (data && data['data']) {
                    let returnData = await data['data'];
                       
                    console.log("return data for create nft is------>",returnData)
                    
                   let collection=returnData.sCollection
                    let erc721=returnData.erc721;
                    let tokenId=returnData.nTokenID+1;
                    let URI="https://ipfs.infura.io/ipfs/"+returnData.metaDataHash;
                   
                    
                    var NFTinstance:any;
                    try{
                      if(erc721===true){
                        NFTinstance = await this.apiService.exportInstance(
                         collection,
                         ExtendedERC721ABI.abi
                       );
                       console.log("collection contract is------->",NFTinstance)
                       let uri=await NFTinstance.setCustomTokenUri(tokenId,URI);
                       let uriResult=await uri.wait()
                       console.log("uri response is------->",uriResult);
                    
                     }else{
                       NFTinstance = await this.apiService.exportInstance(
                         collection,
                         ExtendedERC1155ABI.abi
                       );
                      
                       let uri=await NFTinstance.setCustomTokenUri(tokenId,URI);
                       let uriResult=await uri.wait()
                       console.log("uri response is------->",uriResult);
                     }
                     
                      
                    }catch(e){
                      
                    }
                   
                 
                    if (NFTinstance && NFTinstance != undefined) {
                      if (mintres !== 1) {
                        this.toaster.error(
                          'There is something issue with minting'
                        );
                        // this.isShowPopup = false;
                        this.isPutOnSalePopupClass = '  ';
                        this.resetPopUpClass();
                        return;
                      } else {
                        this.isPutOnSalePopupClass = 'checkiconCompleted';
                        this.isCompletedPopupClass = 'checkiconCompleted';
                        this.resetPopUpClass();
                        this.showRedirectBtn();
                        // await this.router.navigate(['/my-profile'], {
                        //   relativeTo: this._route,
                        //   queryParams: {
                        //     tab: 'created',
                        //   },
                        // });
                      }
                   
                      
                      // this.isShowPopup = false;
                      // this.resetPopUpClass();
                      // Show Complete
                    } else {
                      // this.isShowPopup = false;
                      this.isPutOnSalePopupClass = 'errorIcon';
                      this.resetPopUpClass();
                      this.toaster.error(
                        'There is something issue with NFT address.',
                        'Error!'
                      );
                    }
                  } else {
                    // this.isShowPopup = false;
                    this.isPutOnSalePopupClass = 'errorIcon';
                    this.resetPopUpClass();
                  }
                },
                (error) => {
                  if (error && error['message']) {
                    error = error['error'];
                    console.log("error is--->",error)
                    this.toaster.error(error['message'], 'Error!');
                  }
                  this.isPutOnSalePopupClass = 'errorIcon';
                  // this.isShowPopup = false;
                  this.resetPopUpClass();
                }
              );
              
            } catch (error) {
              if (error.code == 4001) {
                this.toaster['error'](
                  error.code == 4001
                    ? 'You Denied MetaMask Transaction Signature'
                    : 'Something Went Wrong!'
                );
              } else {
                this.toaster.error('Something Wrong!!!');
              }
              this.isPutOnSalePopupClass = 'errorIcon';
              // this.isShowPopup = false;
              this.resetPopUpClass();
            }
          }
        } else {
        /*genre validation if ends here */
          this.toaster.warning('Please select atleast 1 genre.', 'Error!');
        }
      } else {
        this.toaster.warning('Please add mp3/mp4 file .', 'Error!');
      }
    } else {
      this.toaster.warning('Please add Cover Photo .', 'Error!');
    }
  }

  setFileType(e){
    console.log("file type is----->",e.target.value)
    if(e.target.value==="Video"){
      this.fileType="MP4"
    }else{
      this.fileType="MP3"
    }
  }
  
  onKeyUpBpm(e: any) {
    const val = parseInt(e.target.value);

    if (val <= 20 || val >= 180) {
      this.flag = true;
    } else {
      this.flag = false;
    }
  }

  onKeyupFIXNumber(e: any, type: any) {
    if (type == 'quantity') {
      if (e.target.value) {
        this.createNFTForm.patchValue({ nQuantity: parseInt(e.target.value) });
      } else {
        this.createNFTForm.patchValue({ nQuantity: '' });
      }
    }

    if (type == 'percentage') {
      if (e.target.value) {
        if (parseInt(e.target.value) <= this.collabPercent) {
          this.createNFTForm.patchValue({
            nCollaboratorPercentage: parseInt(e.target.value),
          });
        } else {
          this.toaster.warning(
            'Enter percentage under' + this.collabPercent + '% .'
          );
          this.createNFTForm.patchValue({ nCollaboratorPercentage: '101' });
        }
      } else {
        this.createNFTForm.patchValue({ nCollaboratorPercentage: '' });
      }
    }
  }

  onClickRefresh() {
    window.location.reload();
  }

  ngOnDestroy() {
 
    this.Data = [];
    this.cd.detectChanges();
  }
}
