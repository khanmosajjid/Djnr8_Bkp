import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { error } from 'jquery';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { ApiService } from '../api.service';
import { ScriptLoaderService } from '../script-loader.service';
declare let window: any;

@Component({
  selector: 'app-collections',
  templateUrl: './collections.component.html',
  styleUrls: ['./collections.component.css']
})
export class CollectionsComponent implements OnInit {

  NFTListData: any = [];
  searchData: any = {
    length: 9,
    start: 0,
    eType: ['All'],
    sTextsearch: '',
    sSellingType: '',
    sSortingType: 'Recently Added',
    sCollection: '',
  };
  infoData: any = { sCollection: '' };
  collectionName: any ="";
  collectionImg:any="";
  collectionAddress:any;
  collectionDetails:any;
  
  keyword:any="Keyword";

  filterData: any = {}
  constructor(
    private _formBuilder: FormBuilder,
    private _script: ScriptLoaderService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private _route: ActivatedRoute,
    private toaster: ToastrService,
    private apiService: ApiService,
  ) { 
    router.events.subscribe((val) => {
      // see also
      console.log(this._route.snapshot.params['name'])
      this.routerReload(_route)
   
  });
  }

  async routerReload(route:any){
    let name = route.snapshot.params['name'];
    if (name && name != undefined && name != '') {
      console.log("in router reload",name)
      this.searchData.sCollection = name;
      this.infoData.sCollection = name;
       await this.getCollectionsData();
       await this.getCollectionsInfo()
    } else {
      this.toaster.error('Please Choose collection first.', 'Error!');
    }
  }

  async ngOnInit() {

    let scripts: string[] = [];
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

    this._script.loadScripts("app-collections", scripts).then(function () {

    })
    let name = this._route.snapshot.params['name'];
    if (name && name != undefined && name != '') {
      this.searchData.sCollection = name;
      this.infoData.sCollection = name;
      await this.getCollectionsData();
      await this.getCollectionsInfo()
    } else {
      this.toaster.error('Please Choose collection first.', 'Error!');
    }
  }

  getCollectionsInfo() {
    this.apiService.getCollectionInfo(this.infoData).subscribe(async (data: any) => {
      console.log('------------------------------------2')
      if (data && data['data']) {
        let res = await data['data'];
        console.log("collection info is----->",res)
        this.collectionName = res[0].sName;
        this.collectionImg=res[0].sHash;
        this.collectionAddress=res[0].sContractAddress;
        this.collectionDetails=res[0].sDescription
      } else {
        this.collectionName ="";
      }
    }, (error) => {
    })
  }

  getCollectionsData() {
    console.log('------------------------------------1')
    this.apiService.allCollectionWiseList(this.searchData).subscribe(async (data: any) => {
      console.log('------------------------------------2')
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
    }, (error) => {
      console.log('------------------------------------3', error)
      if (error) {

      }
    })
  }




  async onClickLoadMore() {
    this.searchData['length'] = this.searchData['length'] + 9;

    await this.getCollectionsData();
  }

  async onClickTypeSearch(type: any) {
    // if(checked == true){
    this.searchData['sSellingType'] = type;
    // }
    await this.getCollectionsData();
  }

  async clickClearAll() {
     this.keyword=" "
     console.log("clearall called")
    this.searchData = {
      length: 9,
      start: 0,
      eType: ['All'],
      sTextsearch: '',
      sSellingType: '',
      sCollection: this.searchData.sCollection,
      sSortingType: 'Recently Added'
    };

    await this.getCollectionsData();

  }

  async onSelectCategory(e: any) {
    // if(checked == true){
    this.searchData['eType'] = [e.target.value];
    // }
    await this.getCollectionsData();
  }

  async onkeyUp(e: any) {
    this.searchData['sTextsearch'] = e.target.value;
    // }
    await this.getCollectionsData();
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
  onClickRefresh() {
    window.location.reload();
  }
}
