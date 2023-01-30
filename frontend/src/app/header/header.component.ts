import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../api.service';
import { FilterKeywordService } from '../filter-keyword.service';
import { ScriptLoaderService } from '../script-loader.service';
import Web3 from 'web3';
import { environment } from 'src/environments/environment';
import detectEthereumProvider from '@metamask/detect-provider';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  type: any = 'hide'
  showObj: any = {
    wallet_address: '',
    show: 'metamask',
    network_name: '',
  };
  public sendData: string[] = [];
  searchData: any = {
    length: 9,
    start: 0,
    eType: ['All'],
    sTextsearch: '',
    sSellingType: '',
    sSortingType: 'Recently Added',
    sFrom: 0,
    sTo: 0,
    sGenre: [],
  };
  profileData: any;
  filterData: any = {};
  NFTListData: any = [];
  userStatus: any;
  web3: any;


  constructor(private router: Router,
    private _route: ActivatedRoute,
    private _script: ScriptLoaderService,
    private spinner: NgxSpinnerService,
    private toaster: ToastrService,
    private apiService: ApiService,
    private filterKeywordService: FilterKeywordService,
  ) {

    // this.id = this._route.snapshot.params['id'];
  }

  async ngOnInit() {

   
    const that = this;

    const ethereum: any = window.ethereum;

    let web3: any = new Web3("https://rpc-mumbai.maticvigil.com")
    if (ethereum) {
      let currentAccount = null;
      let account: any

      ethereum.on("accountsChanged", account => {
        if (account.length > 0)
          console.log("account connected is---->", account);
        else {
          console.log("Account dissconnected");
          localStorage.setItem('connected', 'false')
          this.onClickRefresh()
        }
      });

      let connect = localStorage.getItem('connected');
      if (connect == 'true') {
        // this.showObj.show = 'signup';
        await this.loadMetaMask();
      }
    }
    await this.getNFTListingData(this.searchData);
  }

  async loadMetaMask() {
    this.type = 'hide';
    this.spinner.show();
    const that = this;
    console.log("before Export Resp");

    await this.apiService.export().then((data: any) => {
      this.spinner.hide();
      if (data && data != 'error') {

        this.showObj.wallet_address = data;
        console.log("inside Export Resp" + this.showObj.wallet_address);
        if (this.showObj.wallet_address && this.showObj.wallet_address != '' && this.showObj.wallet_address != []) {
          console.log("inside Export");
          that.spinner.hide();

          this.apiService.getprofile().subscribe((res: any) => {

            if (res && res['data']) {

              this.profileData = res['data'];

              this.profileData.sProfilePicUrl = this.profileData.sProfilePicUrl == undefined ? 'assets/img/avatars/avatar5.jpg' : 'https://ipfs.infura.io/ipfs/' + this.profileData.sProfilePicUrl;

              if (this.profileData) {
                this.userStatus = this.profileData.sStatus;
              } else {

              }

              this.profileData.sFirstname = this.profileData && this.profileData.oName && this.profileData.oName.sFirstname ? this.profileData.oName.sFirstname : '';

            }

          }, (err: any) => {

          });

          this.showObj.network_name = this.apiService.getNetworkName();
          this.showObj.show = 'signup';

          let call = this.apiService.checkuseraddress(this.showObj.wallet_address).subscribe((data) => {
            that.spinner.hide();
            if (data) {

              that.spinner.hide();
              this.showObj.show = 'signin';

              if (localStorage.getItem('Authorization') && localStorage.getItem('Authorization') != null) {
                this.showObj.show = 'profile';
              }


            }
          }, (err) => {
            that.spinner.hide();
            if (err['error'] && err['error']['message'] == 'User not found') {
              // this.showObj.show = 'signup';
              call.unsubscribe();

            }
          })
        } else {
          
          localStorage.setItem("connected", "false")
          this.showObj.show = 'metamask';
          that.spinner.hide();
          console.log("New ShowObj "+ this.showObj.show);
        }
      } else {
        localStorage.setItem("connected", "false")
        this.showObj.show = 'metamask';
        that.spinner.hide();
        console.log("New ShowObj "+ this.showObj.show);
      }
    }).catch((er: any) => {
      this.spinner.hide();
      if (er && er.code) {
        console.log("inside Export Error Resp");
        this.toaster.error(er.message, 'Error!');
      }
    })
    await this.getNFTListingData(this.searchData);
  }
  async clicktoProfile() {
    // routerLink="/my-profile?tab='profile'"
    await this.router.navigate(['/my-profile'], {
      relativeTo: this._route,
      queryParams: {
        tab: 'purchased'
      },
    });
  }

  userBlocked() {
    this.toaster.warning("Your Account Has Been Temporarily Suspended");
  }
  userDeactivated() {
    this.toaster.error("Admin Deactivated Your Account")
  }

  getNFTListingData(obj: any) {
    this.apiService.nftListing(obj).subscribe(
      async (data: any) => {
        if (data && data['data']) {
          let res = await data['data'];
          this.filterData = res;

          if (res['data'] && res['data'] != 0 && res['data'].length) {
            this.NFTListData = res['data'];


          } else {
            this.filterData = {};
            this.NFTListData = [];
          }
        } else {
          this.filterData = {};
          this.NFTListData = [];
        }
      },
      (error) => {
        if (error) {
        }
      }
    );
  }
  async onkeyUp(e: any) {
    this.searchData['sTextsearch'] = e.target.value;

    // }
    await this.getNFTListingData(this.searchData);

    this.filterKeywordService.myMethod(e.target.value);
  }

  async clicktoEarnings() {
    await this.router.navigate(['/my-profile'], {
      relativeTo: this._route,
      queryParams: {
        tab: 'redeem'
      },
    });
  }


  async connectToMetaMask() {
    await this.loadMetaMask();


    this.spinner.show();
    await this.apiService.connect().then((data: any) => {

      this.spinner.hide();
      if (data && data != 'error') {
        localStorage.setItem("connected", "true")
        // this.toaster.success('User Connected Successfully', 'Success!');
        this.onClickRefresh();
      }

    }).catch((er: any) => {
      this.spinner.hide();

      if (er && er.code) {
        this.toaster.error(er.message, 'Error!');
      }
    })
  }

  clickOP(type: any) {
    this.type = type == 'show' ? 'hide' : 'show';
  }

  async signinMetaMask() {
    this.spinner.show();

    if (this.userStatus == 'deactivated') {

      this.toaster.warning("Your Account Has Been Temporarily Suspended");
      this.spinner.hide()
      return;

    }

    await this.apiService.login('signin', this.showObj.wallet_address, this.toaster, this.userStatus)
    this.spinner.hide();



    if (this.userStatus == 'deactivated') {

      this.toaster.warning("Your Account Has Been Temporarily Suspended");
      this.spinner.hide()
      return;

    }

  }
  async signupMetaMask() {
    this.spinner.show();

    if (this.showObj.wallet_address == '' || this.showObj.wallet_address == undefined) {
      localStorage.setItem('connected', 'false')
      this.onClickRefresh()
      return
    }
    await this.apiService.login('signup', this.showObj.wallet_address, this.toaster, 'active');
    this.spinner.hide();

  }
  onClickRefresh() {
    window.location.reload();
  }

  onsignout() {
    if (localStorage.removeItem('Authorization') != null) {
    }
    this.onClickRefresh()
  }
  
  headerMenuClass: String = 'header__menu';
  toggleHeaderMenu(){
      if(this.headerMenuClass.includes('header__menu--active'))
        this.headerMenuClass = 'header__menu';       
      else
        this.headerMenuClass = 'header__menu header__menu--active';       
  }

}
