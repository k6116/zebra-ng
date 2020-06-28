import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { ApiDataService } from './services/api-data.service';

import { AppComponent } from './app.component';
import { MainComponent } from './pages/main/main.component';


@NgModule({
  declarations: [
    AppComponent,
    MainComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpModule
  ],
  providers: [
    ApiDataService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
