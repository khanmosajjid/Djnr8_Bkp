import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CollectionListComponent } from './collection-list/collection-list.component';
import { CollectionsComponent } from './collections/collections.component';
import { CreateNFTComponent } from './create-nft/create-nft.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MyProfileComponent } from './my-profile/my-profile.component';
import { NFTDetailComponent } from './nft-detail/nft-detail.component';
import { NFTListComponent } from './nft-list/nft-list.component';
import { UserDetailComponent } from './user-detail/user-detail.component';
import { UsersComponent } from './users/users.component';
import { FaqComponent } from './faq/faq.component';
import { SettingsComponent } from './settings/settings.component';

const routes: Routes = [
  { path: "", component: DashboardComponent },
  { path: "create", component: CreateNFTComponent },
  { path: "my-profile", component: MyProfileComponent },
  { path: "NFT-detail/:id", component: NFTDetailComponent },
  { path: "marketplace", component: NFTListComponent },
  { path: "artists", component: UsersComponent },
  { path: "collections/:name", component: CollectionsComponent },
  { path: "artist/:id", component: UserDetailComponent },
  { path: "my-collections", component: CollectionListComponent },
  { path: "faq", component: FaqComponent },
  { path: "settings", component: SettingsComponent },


];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    onSameUrlNavigation: 'reload'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
