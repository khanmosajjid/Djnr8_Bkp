import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../api.service';
import { ScriptLoaderService } from '../script-loader.service';
import {
  FormBuilder,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {

  showObj: any = {
    wallet_address: '',
    show: 'metamask',
    network_name: '',
  };
  
  submitted1:any=false;
  
  newsLetterForm:any;
  createCollectionForm: any;

  public route: any = '';

  collectionList: any = [];
  constructor(private router: Router,
    private _route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private toaster: ToastrService,
    private apiService: ApiService,
    private _formBuilder: FormBuilder,
   
  ) {
    this.route=this._route.url
    // this.id = this._route.snapshot.params['id'];
  }

 
  
  async ngOnInit() {
   
    this.buildCreateCollectionForm();
    if (localStorage.getItem('Authorization') && localStorage.getItem('Authorization') != null) {
      await this.getCollectionList();
     
     
    } else {
      // this.router.navigate([''])

    }
    
  }
  
  // buildnewsLetterForm(){
  //   this.newsLetterForm = this._formBuilder.group({
  //     sEmailAddress: ['',],
      
  //   });
  // }

  buildCreateCollectionForm() {
    this.newsLetterForm = this._formBuilder.group({
      sEmailAddress: ['', [Validators.email]],
     
    });
  }
  getCollectionList() {
    this.apiService.getCollectionList().subscribe((res: any) => {
      if (res && res['data']) {
        this.collectionList = res['data'];
      }
    }, (err: any) => {
    });
  }

  connectToMetaMask() {
    this.spinner.show();
    this.apiService.connect().then((data: any) => {
      this.spinner.hide();
      if(data && data != 'error'){
        this.toaster.success('User Connected Successfully','Success!');
        this.onClickRefresh();
      }

    }).catch((er: any) => {
      this.spinner.hide();

      if (er && er.code) {
        this.toaster.error(er.message,'Error!');
      }
    })
  }

  
  addNewsLetterEmails(){
    this.submitted1=true;
    if(this.newsLetterForm.invalid){
      this.toaster.error("Enter Valid Email Address")
    }else{
      
      let res = this.newsLetterForm.value;
      console.log("news letter form value",res)
     
      let data={
        'sEmail':res.sEmailAddress
      }
      
      this.apiService.addNewsLetterEmails(data).subscribe(
        (updateData: any) => {
          this.spinner.hide();

          if (updateData && updateData['data']) {
            this.toaster.success(updateData['message'], 'Success!');
            
          } else {
          }
        },
        (error: any) => {
         console.log("error is--->",error)
          this.toaster['error'](
            error.code == 4001
              ? 'You Denied MetaMask Transaction Signature'
              : 'Something Went Wrong!'
          );
        }
      );
      
    }
  }


  onClickRefresh() {
    window.location.reload();
  }

}
