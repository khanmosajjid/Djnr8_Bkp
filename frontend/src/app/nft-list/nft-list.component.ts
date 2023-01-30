import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { error } from 'jquery';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { ApiService } from '../api.service';
import { FilterKeywordService } from '../filter-keyword.service';
import { ScriptLoaderService } from '../script-loader.service';
declare let window: any;

@Component({
  selector: 'app-nft-list',
  templateUrl: './nft-list.component.html',
  styleUrls: ['./nft-list.component.css'],
})
export class NFTListComponent implements OnInit {
  public recieveData={};
  NFTListData: any = [];
  searchData: any = {
    length: 12,
    start: 0,
    eType: ['All'],
    sTextsearch: '',
    sSellingType: '',
    sSortingType: 'Recently Added',
    sFrom: 0,
    sTo: 0,
    sGenre: [],
  };
  genreList: any = [];
  // Datatest: Array<any> = [
  //   {name: '140 /Deep Dubstep/  Grime',      value: '140 /  Grime', color: '#7f7f7f', },
  //   { name: 'Afro House', value: 'Afro House', color: '#7f7f7f' },
  //   { name: 'Bass / Club', value: 'Bass / Club', color: '#7f7f7f' },
  //   { name: 'Bass / House', value: 'Bass / House', color: '#7f7f7f' },
  //   { name: 'Deep House', value: 'Deep House', color: '#7f7f7f' },
  //   { name: 'Drum & Bass', value: 'Drum & Bass', color: '#7f7f7f' },
  //   { name: 'Dubstep', value: 'Dubstep', color: '#7f7f7f' },
  //   {
  //     name: 'Electro (Classic / Detroit / Modern)',      value: 'Electro (Classic / Detroit)',      color: '#7f7f7f',
  //   },
  //   { name: 'Electronica', value: 'Electronica', color: '#7f7f7f' },
  //   { name: 'Funky House', value: 'Funky House', color: '#7f7f7f' },
  //   {
  //     name: 'Hard Dance / Hardcore',      value: 'Hard Dance / Hardcore',      color: '#7f7f7f',
  //   },
  //   { name: 'Hard Techno', value: 'Hard Techno', color: '#7f7f7f' },
  //   { name: 'House', value: 'House', color: '#7f7f7f' },
  //   { name: 'Indie Dance', value: 'Indie Dance', color: '#7f7f7f' },
  //   { name: 'Jacking House', value: 'Jacking House', color: '#7f7f7f' },
  //   { name: 'Mainstage', value: 'Mainstage', color: '#7f7f7f' },
  //   {
  //     name: 'Melodic House & Techno',value: 'Melodic House & Techno',color: '#7f7f7f',
  //   },
  //   {
  //     name: 'Minimal / Deep Tech',  value: 'Minimal / Deep Tech',      color: '#7f7f7f',
  //   },
  //   {
  //     name: 'Nu Disco / Disco',      value: 'liNu Disco / Discome',      color: '#7f7f7f',
  //   },
  //   {
  //     name: 'Organic House / Downtempo',      value: 'Organic House / Downtempo',      color: '#7f7f7f',
  //   },
  //   { name: 'Progressive House', value: 'Progressive House', color: '#7f7f7f' },
  //   { name: 'Psy-Trance', value: 'Psy-Trance', color: '#7f7f7f' },
  //   { name: 'Tech House', value: 'Tech House', color: '#7f7f7f' },
  //   {
  //     name: 'Techno (Peak Time / Driving)',      value: 'Techno (Peak Time / Driving)',      color: '#7f7f7f',
  //   },
  //   {
  //     name: 'Techno (Raw / Deep / Hypnotic)',      value: 'Techno (Raw / Deep )',      color: '#7f7f7f',
  //   },
  //   { name: 'Trance', value: 'Trance', color: '#7f7f7f' },
  //   { name: 'Trap / Wave', value: 'Trap / Wave', color: '#7f7f7f' },
  //   {
  //     name: 'UK Garage / Bassline',     value: 'UK Garage / Bassline',      color: '#7f7f7f',
  //   },
  // ];

  Datatest: Array<any> = [
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


  filterData: any = {};
  constructor(
    private _formBuilder: FormBuilder,
    private _script: ScriptLoaderService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private _route: ActivatedRoute,
    private toaster: ToastrService,
    private apiService: ApiService,
    private filterKeywordService : FilterKeywordService,
  ) {
    this.filterKeywordService.myMethod$.subscribe((data) => {
     this.searchbox(data);
      // And he have data here too!
  });
  }
  loadSCR() {
    const that = this;
    console.log("load screen is called")
    
  }
  

  async ngOnInit() {
    const that = this;
  
    document.addEventListener("DOMContentLoaded", function () {
      let scripts: string[] = [];
      scripts = [];
      scripts = [
        "../../assets/js/jquery-3.5.1.min.js",
        "../../assets/js/bootstrap.bundle.min.js",
        "../../assets/js/jquery.magnific-popup.min.js",
        "../../assets/js/owl.carousel.min.js",
        "../../assets/js/select2.min.js",
        "../../assets/js/smooth-scrollbar.js",
        "../../assets/js/jquery.countdown.min.js",
        "../../assets/js/main.js",
      ];

      that._script.loadScripts("app-nft-list", scripts).then(function () {

      })
    });
    // if (localStorage.getItem('Authorization') && localStorage.getItem('Authorization') != null) {
    await this.getNFTListingData(this.searchData);
    
    this.searchData['sTextsearch'] = this.recieveData;

  
    await this.getNFTListingData(this.searchData);
    // } else {
    //   this.toaster.info('Please login first.')
    //   this.router.navigate([''])
    // }
  }
  async onCheckboxChange1(e: any) {
    
    
    if (e.target.checked) {
      
      this.genreList.push(e.target.value);
    } else {
      
      for(let i=0;i<this.genreList.length;i++ )
    {
      if(e.target.value==this.genreList[i])
        {
          
          this.genreList.splice(i,1);
          console.log(this.genreList)
        }
        
    }
    }
    
    this.searchData['sGenre'] = this.genreList;

    // }
    await this.getNFTListingData(this.searchData);

    // 
  }
 async searchbox(data:string){
    this.searchData['sTextsearch'] = data;

    await this.getNFTListingData(this.searchData);

  }

  getNFTListingData(obj: any) {
    this.apiService.nftListing(obj).subscribe(
      async (data: any) => {
        if (data && data['data']) {
          let res = await data['data'];
          this.filterData = res;
            this.loadSCR()
          if (res['data'] && res['data'] != 0 && res['data'].length) {
            this.NFTListData = res['data'];
            console.log("NFT LIst data is--->",this.NFTListData)
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

  async onClickLoadMore() {
    this.searchData['length'] = this.searchData['length'] + 9;

    await this.getNFTListingData(this.searchData);
  }

  async onClickTypeSearch(type: any) {
    // if(checked == true){
    this.searchData['sSellingType'] = type;
    // }
    await this.getNFTListingData(this.searchData);
  }

  async clickClearAll() {
    this.searchData = {
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
    this.onClickRefresh()
    await this.getNFTListingData(this.searchData);
  }

  async onSelectCategory(e: any) {
    
    // if(checked == true){
    this.searchData['eType'] = [e.target.value];
 
    // }
    await this.getNFTListingData(this.searchData);
  }

  async onkeyUp(e: any) {
    this.searchData['sTextsearch'] = e.target.value;

    // }
    await this.getNFTListingData(this.searchData);
    console.log(e.target.value);

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
  onClickRefresh() {
    window.location.reload();
  }

  async onkeyFrom(e: any) {
    this.searchData['sFrom'] = e.target.value;
    // if ( parseInt(this.searchData['sTo']) > parseInt(this.searchData['sFrom'])) {

    // }
    await this.getNFTListingData(this.searchData);
    console.log(e.target.value);
    // }else{
    //   this.toaster.error('Please enter from less then to.');
    // }
  }
  async onkeyTo(e: any) {
    this.searchData['sTo'] = e.target.value;
    // if ( parseInt(this.searchData['sTo']) > parseInt(this.searchData['sFrom'])) {

    // }
    await this.getNFTListingData(this.searchData);
    console.log(e.target.value);
    // }else{
    //   this.toaster.error('Please enter to greater then from.');

    // }
  }
}
