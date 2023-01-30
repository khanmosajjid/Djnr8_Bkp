import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { ApiService } from '../api.service';
import { ScriptLoaderService } from '../script-loader.service';
declare let window: any;

// {_id: "61129d701bf84242a9127486", sTransactionStatus: 1, sName: "Artist NFT",…}
// eType: "Image"
// nBasePrice: {$numberDecimal: "0.5"}
// nQuantity: 10
// nTokenID: 22
// oCurrentOwner: "610feeee1bf84242a9127425"
// oUser: [{_id: "610feeee1bf84242a9127425", sUserName: "devXHHH", sRole: "user",…}]
// sHash: "QmWv7u6CHKKea17DDZfaBfPLkMep5vg4qxFntKLCTfj5y7"
// sName: "Artist NFT"
// sTransactionStatus: 1
// _id: "61129d701bf84242a9127486"

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.css']
})
export class MyProfileComponent implements OnInit {
  tab = 'profile'; //'bid' 'created' 'sale' 'redeem'

  editProfileform: any;
  submitted1: Boolean = false;

  redeemForm: any;
  submitted2: Boolean = false;

  file: any;
  profileData: any;
  searchData: any = {
    length: 100,
    start: 0,
    eType: ['All'],
    sTextsearch: '',
    sCollection: '',
    sSellingType: '',
    sSortingType: 'Recently Added',
   

  };
  salessearchData: any = {
    length: 1000,
    start: 0,
    eType: ['All'],
    sTextsearch: '',
    sCollection: '',
    sSellingType: '',
    sSortingType: 'Recently Added',
   

  };
  listData: any = [];
  onsalelistData: any = [];
  purchasedlistData: any = [];
  filterData: any = [];
  bidHistoryData: any = [];
  filename= '';

  constructor(
    private _formBuilder: FormBuilder,
    private _script: ScriptLoaderService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private _route: ActivatedRoute,
    private toaster: ToastrService,
    private apiService: ApiService,
  ) {

  }

  async ngOnInit() {
    this.buildCreateForm1();
    this.buildRedeemForm();

    this._route.queryParams.subscribe(async params => {
      if (params) {
        if (params['tab'] && params['tab'] != undefined) {
          if (params['tab'] && typeof params['tab'] == 'object') {
            this.tab = params['tab'][0];
          } else {
            this.tab = params['tab'];

          }
        }

      }
    });
     let scripts : string[] = [];
scripts = [
      "../../assets/js/jquery-3.5.1.min.js",
      "../../assets/js/bootstrap.bundle.min.js",
      "../../assets/js/owl.carousel.min.js",
      "../../assets/js/jquery.magnific-popup.min.js",
      "../../assets/js/select2.min.js",
      "../../assets/js/smooth-scrollbar.js",
      "../../assets/js/jquery.countdown.min.js",
      "../../assets/js/main.js",
    ];

    this._script.loadScripts("app-my-profile", scripts).then(function () {

    })
    if (localStorage.getItem('Authorization') && localStorage.getItem('Authorization') != null) {
      

      this.apiService.getprofile().subscribe((res: any) => {
           
        if (res && res['data']) {
          this.profileData = res['data'];
          
          this.profileData.sProfilePicUrl = this.profileData.sProfilePicUrl == undefined ? 'assets/img/avatars/avatar5.jpg' : 'https://ipfs.infura.io/ipfs/' + this.profileData.sProfilePicUrl;


          this.profileData.sFirstname = this.profileData && this.profileData.oName && this.profileData.oName.sFirstname ? this.profileData.oName.sFirstname : '';
          this.profileData.sLastname = this.profileData && this.profileData.oName && this.profileData.oName.sLastname ? this.profileData.oName.sLastname : '';

          this.editProfileform.patchValue(this.profileData);
        }

      }, (err: any) => {

      });


      // await this.myNFTList(this.searchData);
      await this.myNFTCreatedList(this.searchData);
      await this.myNFTOnSaleList(this.salessearchData);
      await this.myNFTPurchasedList(this.salessearchData);
      await this.myBIDList();

      var NFTinstance = await this.apiService.exportInstance(environment.NFTaddress, environment.NFTabi);
      if (NFTinstance && NFTinstance != undefined) {
      }
    } else {
      this.toaster.error('Please Signin / Signup first.','Error!')
      this.router.navigate([''])
    }
  }

  async myNFTList(obj: any) {
    await this.apiService.nftMYListing(obj).subscribe((res: any) => {
      if (res && res['data'] && res['data']) {
        this.listData = res['data'];
        this.filterData = this.listData
        if (this.listData['data'].length) {
          this.listData = this.listData['data'];
        } else {
          this.listData = [];
        }
      }
    }, (err: any) => {
    });
  }

  async myNFTCreatedList(obj: any) {
    await this.apiService.nftMYCreatedListing(obj).subscribe((res: any) => {
      if (res && res['data'] && res['data']) {
        this.listData = res['data'];
        console.log("this.list data is----->",this.listData)
        this.filterData = this.listData
        if (this.listData['data'].length) {
          this.listData = this.listData['data'];
        } else {
          this.listData = [];
        }
      }
    }, (err: any) => {
    });
  }

  async myNFTOnSaleList(obj: any) {
    console.log("my nft on sale list data is---->")
    await this.apiService.nftmyNFTOnSaleListing(obj).subscribe((res: any) => {
      if (res && res['data'] && res['data']) {
        this.onsalelistData = res['data'];
        this.filterData = this.onsalelistData
        if (this.onsalelistData['data'].length) {
          this.onsalelistData = this.onsalelistData['data'];
          console.log("on sale list data is------->",this.onsalelistData)
        } else {
          this.onsalelistData = [];
        }
      }
    }, (err: any) => {
    });
  }

  async myNFTPurchasedList(obj: any) {
    await this.apiService.nftmyNFTPurchasedListing(obj).subscribe((res: any) => {
      if (res && res['data'] && res['data']) {
        this.purchasedlistData = res['data'];
        console.log("Purchased list data is--->",this.purchasedlistData)
        this.filterData = this.purchasedlistData
        if (this.purchasedlistData['data'].length) {
          this.purchasedlistData = this.purchasedlistData['data'];
        } else {
          this.purchasedlistData = [];
        }
      }
    }, (err: any) => {

    });
  }

  async myBIDList() {

    await this.apiService.bidByUser({}).subscribe((res: any) => {

      if (res && res['data'] && res['data']) {
        this.bidHistoryData = res['data'];

        if (this.bidHistoryData['data'].length) {
          this.bidHistoryData = this.bidHistoryData['data'];
        } else {
          this.bidHistoryData = [];
        }

      }

    }, (err: any) => {

    });
  }

  async onClickSearch(type: any) {
    this.searchData['sSellingType'] = type;
    await this.myNFTList(this.searchData);
  }


  
  async onClickSearchSale() {
    this.salessearchData['sSellingType'] = "";
    await this.myNFTOnSaleList(this.salessearchData);
  }

  async onClickSearchPurchased() {
    this.salessearchData['sSellingType'] = "";
    await this.myNFTPurchasedList(this.salessearchData);
  }

  async onClickSearchCreated() {
    this.searchData['sSellingType'] = "";
    await this.myNFTCreatedList(this.searchData);
  }

  
  
  async onClickLoadMore() {
    this.searchData['length'] = this.searchData['length'] + 100;

    await this.myNFTList(this.searchData);
  }

  buildCreateForm1() {

    this.editProfileform = this._formBuilder.group({
      sWalletAddress: ['', [Validators.required, Validators.pattern('^0x[a-fA-F0-9]{40}$')]],
      sLastname: ['', [Validators.required]],
      sUserName: ['', [Validators.required]],
      sFirstname: ['', [Validators.required]],
      // userProfile: ['', [Validators.required]],
      // sBio: ['', [Validators.required]],
      sBio: ['', []],
      sWebsite: ['', []],
      sEmail: ['', [Validators.email]],
    });
  }

  buildRedeemForm() {

    this.redeemForm = this._formBuilder.group({
      earnings: ['', [Validators.required]],
      amount: ['', [Validators.required]],

    });
  }
  onClickTab(type: any) {
    if (type == 'purchased') {

    }
  }

  onSelectDocument(event: any) {

    const file1:File = event.target.files[0]
   
    if (event.target.files && event.target.files[0]) {
      if (event.target.files[0].name.match(/\.(jpeg|jpg|png|)$/)) {
        this.file = event.target.files[0];
        console.log(event.target.files)
        this.filename=file1.name;
      }
    }
  }

  keyPressUserName(event) {
    var inp = String.fromCharCode(event.keyCode);
    if (/[a-zA-Z0-9]/.test(inp)) {
      return true;
    } else {
      event.preventDefault();
      return false;
    }
  }

  onClickSubmit() {
    this.spinner.show();
    this.submitted1 = true;
   
    if (this.editProfileform.invalid) {
      this.spinner.hide();
      this.toaster.error("Invalid email address")
      return;
    } else {

      let res = this.editProfileform.value;
      var fd = new FormData();

      fd.append('sFirstname', res.sFirstname);
      fd.append('sLastname', res.sLastname);
      fd.append('sUserName', res.sUserName);
      fd.append('sWalletAddress', res.sWalletAddress);
      fd.append('sBio', res.sBio);
      fd.append('sWebsite', res.sWebsite && res.sWebsite != undefined ? res.sWebsite : '');
      fd.append('sEmail', res.sEmail);

      if (this.file && this.file != undefined) {
        fd.append('userProfile', this.file);

      }
      this.apiService.updateProfile(fd).subscribe((updateData: any) => {
        this.spinner.hide();
        if (updateData && updateData['data']) {
          this.toaster.success('Profile updated successfully.','Success!')
          this.onClickRefresh();
        } else {

        }

      }, (err: any) => {
        this.spinner.hide();
        if (err && err['error']) {
          err = err['error'];

          if (err && err['message']) {
            this.toaster.error(err['message'],'Error!')

          }
        }
      });
    }


  }


  // async onClickRedeem() {
  //   this.spinner.show();
  //   this.submitted1 = true;
  //   if (this.redeemForm.invalid) {
  //     this.spinner.hide();
  //     return;
  //   } else {
  //     this.spinner.hide();

  //     let res = this.redeemForm.value;
  //     var NFTinstanceLan= await this.apiService.exportInstance(environment.NFTaddress, environment.NFTabi);
  //     if (NFTinstance && NFTinstance != undefined) {
  //       this.spinner.show();

  //       await NFTinstance.methods.redeemPoints(window.web3.utils.toWei(res.amount, 'ether')).send({
  //         from: localStorage.getItem('sWalletAddress')
  //       }).then((data: any) => {
  //         if (data) {
  //           this.spinner.hide();

  //           this.onClickRefresh();
  //         }
  //       }).catch((err: any) => {
  //         if (err) {
  //           this.spinner.hide();
  //         }
  //       });


  //     }

  //   }
  // }

  onClickRefresh() {
    window.location.reload();
  }


  clickLike(id: any) {
    if (localStorage.getItem('Authorization') && localStorage.getItem('Authorization') != null) {

      this.apiService.like({ id: id }).subscribe((updateData: any) => {
        this.spinner.hide();

        if (updateData && updateData['data']) {
          // this.toaster.success(updateData['message'], 'Success!')
          this.onClickRefresh();
        } else {

        }

      }, (err: any) => {
        this.spinner.hide();
        if (err && err['message']) {

        }
      });

    } else {
      // this.router.navigate(['']);
      this.toaster.error('Please sign in first.')
    }

  }
  
}
