import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { ScriptLoaderService } from '../script-loader.service';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css']
})
export class FaqComponent implements OnInit {
  
  FaqData:any


  constructor(private apiService: ApiService,
    private _script: ScriptLoaderService,) { }

  
  loadSCR() {
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

      that._script.loadScripts("app-faq", scripts).then(function () {

      })
    });
  }
  
  async ngOnInit() {
    this.loadSCR()
    await this.apiService.getFaqData().subscribe(async(data:any)=>{
      if(data['message']=='success'){
        let faq=await data['data']
        this.FaqData=faq
       
      }   })
     
  }

}
