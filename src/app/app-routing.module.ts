import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';

import { MainComponent } from './pages/main/main.component';
// import { BlockchainViewerComponent } from './pages/blockchain-viewer/blockchain-viewer.component';
// import { CreateTransactionComponent } from './pages/create-transaction/create-transaction.component';
// import { PendingTransactionsComponent } from './pages/pending-transactions/pending-transactions.component';
// import { WalletBalanceComponent } from './pages/wallet-balance/wallet-balance.component';


const routes: Routes = [
  // { path: '', redirectTo: '', pathMatch: 'full' },
  // { path: '**', redirectTo: '' },
  { path: '', component: MainComponent },
  // { path: 'settings', component: SettingsComponent },
  // { path: 'new/transaction', component: CreateTransactionComponent },
  // { path: 'new/transaction/pending', component: PendingTransactionsComponent },
  // { path: 'wallet/:address', component: WalletBalanceComponent }
];


@NgModule({
  imports: [
    RouterModule.forRoot(routes),
    CommonModule
  ],
  exports: [ RouterModule ],
  declarations: []
})
export class AppRoutingModule {

}
