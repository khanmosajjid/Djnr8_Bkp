import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { ApiService } from '../api.service';
import { ScriptLoaderService } from '../script-loader.service';
declare let window: any;
@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  editProfileform: any;
  submitted1: Boolean = false;
  redeemForm: any;
  submitted2: Boolean = false;
  file: any;
  profileData: any;
  filename = '';
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
    this._script.loadScripts("app-settings", scripts).then(function () {

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
    } else {
      this.toaster.error('Please Signin / Signup first.', 'Error!')
      this.router.navigate([''])
    }
  }
  buildCreateForm1() {
    this.editProfileform = this._formBuilder.group({
      sWalletAddress: ['', [Validators.required, Validators.pattern('^0x[a-fA-F0-9]{40}$')]],
      sLastname: ['', [Validators.required]],
      sUserName: ['', [Validators.required]],
      sFirstname: ['', [Validators.required]],
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
  onSelectDocument(event: any) {
    const file1: File = event.target.files[0]
    if (event.target.files && event.target.files[0]) {
      if (event.target.files[0].name.match(/\.(jpeg|jpg|png|)$/)) {
        this.file = event.target.files[0];
        console.log(event.target.files)
        this.filename = file1.name;
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
          this.toaster.success('Profile updated successfully.', 'Success!')
          this.onClickRefresh();
        } else {

        }

      }, (err: any) => {
        this.spinner.hide();
        if (err && err['error']) {
          err = err['error'];
          if (err && err['message']) {
            this.toaster.error(err['message'], 'Error!')
          }
        }
      });
    }
  }
  onClickRefresh() {
    window.location.reload();
  }
}
