import { Component, OnInit } from '@angular/core';
import { ApiDataService} from '../../services/api-data.service'
import * as Highcharts from 'highcharts';
declare var require: any;
declare var $: any;
import * as _ from 'lodash';
import * as moment from 'moment';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  skewData: any
  optionsData: any
  singleOptionData: any

  // chart-related variables
  chartIsLoading = true;
  lineChart: any;
  lineChartOptions: any;  // for setting chart options
  supplyData:  any; // for populating historic FTwE data to plot in chart
  demandData: any;
  
  constructor(
    private apiDataService: ApiDataService
  ) { }

  ngOnInit() {
    this.getSkewData();
    this.getOptionsData();
  }

  getSkewData() {
    this.apiDataService.getSkewData()
    .subscribe(
      res => {
        console.log('Skew: ', res);
        this.skewData = res;
      },
      err => {
        console.log(err);
      }
    );
  }

  getOptionsData() {
    this.apiDataService.getOptionsData()
    .subscribe(
      res => {
        console.log('Options: ', res);
        this.optionsData = res;
      },
      err => {
        console.log(err);
      }
    );
  }

  getSingleOptionData(symbol: string, strike: number, putCall: string, dte: number) {
    return this.apiDataService.getSingleOptionData(symbol, strike, putCall, dte).toPromise()
    // .subscribe(
    //   res => {
    //     console.log('Single Options: ', res);
    //     return res;
    //   },
    //   err => {
    //     console.log(err);
    //   }
    // );
    // return optionData;
  }

  async calcSkewData() {

    const symbol = 'NFLX';
    const expirationDate = '2020-07-17';

    const dte = this.optionsData[0].daysToExpiration;
    const underlyingPrice = this.optionsData[0].underlyingPrice;
    const strikes = _.uniq(_.map(this.optionsData, 'strike'));

    const strike1 = strikes.reduce(function(prev, curr) {
      return (Math.abs(curr - underlyingPrice) < Math.abs(prev - underlyingPrice) ? curr : prev);
    });

    const strikeIndex = strikes.indexOf(strike1)

    let strikeBeg;
    let strikeEnd;
    if (strikeIndex % 2 === 1) {
      strikeBeg = Math.ceil(strikeIndex * 0.5)
      strikeEnd = Math.ceil(strikeIndex * 1.5)
    } else {
      strikeBeg = strikeIndex * 0.5
      strikeEnd = (strikeIndex * 1.5) + 1
    }

    const reducedStrikes = strikes.slice(strikeBeg, strikeEnd);
    console.log('reducedStrikes', reducedStrikes)

    const [ivCalls, ivPuts] = await this.ivSkew('NFLX', reducedStrikes, dte)
    console.log(ivCalls)
    this.plotImpliedVolatilitySkew(symbol, expirationDate, dte, reducedStrikes, ivCalls, ivPuts);
  
  }

  async ivSkew(symbol: string, strikes: any, dte: number) {
    const ivCalls = await this.getOptionAttribute(symbol, strikes, 'CALL', dte, 'impliedVolatility')
    const ivPuts = await this.getOptionAttribute(symbol, strikes, 'PUT', dte, 'impliedVolatility')

    for (let i = 0; i < strikes.length; i++) {
      if (i <= Math.floor(strikes.length / 2)) {
        ivCalls[i] = null;
      }
      if (i >= Math.floor(strikes.length / 2)) {
        ivPuts[i] = null;
      }
    }

    return [ivCalls, ivPuts]

  }

  async getOptionAttribute(symbol: string, strike: number, putCall: string, dte: number, attr: string) {
    const data = await this.getSingleOptionData(symbol, strike, putCall, dte)
    const arr = _.map(data, attr);
    return arr;
  }


  plotImpliedVolatilitySkew(symbol: string, expirationDate: string, dte: number, strikes: any, ivCalls: any, ivPuts: any) {
    // if chart already exists, destroy it before re-drawing
    if (this.lineChart) {
      this.lineChart.destroy();
    }
    this.lineChartOptions = {
      // title: {text: `Supply Demand ${this.selectedProject.NCIProjectName}`},
      title: {text: `${symbol}`},
      subtitle: { text: `Exp: ${expirationDate} | DTE: ${dte}`},
      xAxis: {
        title: {text: 'Strike'},
        categories: strikes
      },
      yAxis:  {
        title: {text: 'Implied Volatility (%)'}
      },
      tooltip: {
        crosshairs: true,
        shared: true
      },
      plotOptions: {
        series: {
          turboThreshold: 3000,
          cursor: 'pointer',
          point: {
            events: {
              click: function(e) {
                const p = e.point;
                console.log(p)
                // let supplyDemandDate = moment(p.x).toISOString();
                // supplyDemandDate = moment(supplyDemandDate).format('YYYY-MM-DD');
                // this.getSupplyDemandDetailsList(supplyDemandDate);
              }.bind(this)
            }
          }
        }
      },

      series: [
        {
          name: 'Calls',
          data: ivCalls
        },
        {
          name: 'Puts',
          data: ivPuts
        }
      ]
    };
    this.lineChart = Highcharts.chart('IVSkew', this.lineChartOptions);

    // loop through the historic FTE data object and plot each object as an independent series
    // this.lineChart.addSeries({
    //   name: this.demandData.name,
    //   data: this.demandData.data
    // });
  }

}
