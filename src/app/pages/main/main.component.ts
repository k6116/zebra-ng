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
  }

  getSkewData() {
    this.apiDataService.getSkewData()
    .subscribe(
      res => {
        // console.log('Skew: ', res);
        this.skewData = res;
      },
      err => {
        console.log(err);
      }
    );
  }

  getOptionsData(symbol: string, expirationDate: string) {
    return this.apiDataService.getOptionsData(symbol, expirationDate).toPromise()
  }

  getSingleOptionData(symbol: string, strike: number, putCall: string, dte: number) {
    return this.apiDataService.getSingleOptionData(symbol, strike, putCall, dte).toPromise()
  }

  async calcSkewData(optionData: any) {

    const symbol = optionData.symbol;
    const expirationDate = optionData.expirationDate;
    const dte = optionData.daysToExpiration;
    const underlyingPrice = optionData.underlyingPrice;

    const optionsData = await this.getOptionsData(symbol, expirationDate)
    // console.log(optionsData)
    const strikes = _.uniq(_.map(optionsData, 'strike'));

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
    // console.log('reducedStrikes', reducedStrikes)

    const [ivCalls, ivPuts] = await this.ivSkew(symbol, reducedStrikes, dte)
    const [premiumCalls, premiumPuts] = await this.premiumSkew(symbol, reducedStrikes, dte)
    console.log('ivCalls', ivCalls)
    console.log('ivPuts', ivPuts)
    console.log('premiumCalls', premiumCalls)
    console.log('premiumPuts', premiumPuts)

    this.plotImpliedVolatilitySkew(symbol, expirationDate, dte, reducedStrikes, ivCalls, ivPuts);
    this.plotPremiumSkew(symbol, expirationDate, dte, reducedStrikes, premiumCalls, premiumPuts);
  
  }

  async ivSkew(symbol: string, strikes: any, dte: number) {
    const ivCalls = await this.getOptionAttribute(symbol, strikes, 'CALL', dte, 'impliedVolatility')
    const ivPuts = await this.getOptionAttribute(symbol, strikes, 'PUT', dte, 'impliedVolatility')

    // Insert nulls where strikes are ITM
    for (let i = 0; i < strikes.length; i++) {
      if (i <= Math.floor(strikes.length / 2) - 1) {
        ivCalls[i] = null;
      }
      if (i >= Math.floor(strikes.length / 2) + 1) {
        ivPuts[i] = null;
      }
    }

    return [ivCalls, ivPuts]

  }

  async premiumSkew(symbol: string, strikes: any, dte: number) {

    const premiumCallsBid = await this.getOptionAttribute(symbol, strikes, 'CALL', dte, 'bid')
    const premiumCallsAsk = await this.getOptionAttribute(symbol, strikes, 'CALL', dte, 'ask')
    const premiumPutsBid = await this.getOptionAttribute(symbol, strikes, 'PUT', dte, 'bid')
    const premiumPutsAsk = await this.getOptionAttribute(symbol, strikes, 'PUT', dte, 'ask')

    // Get the mid premiums
    const premiumCallsMid = [];
    const premiumPutsMid = [];
    for (let i = 0; i < strikes.length; i++) {
      const mid = (premiumCallsBid[i] + premiumCallsAsk[i]) / 2;
      premiumCallsMid.push(mid);
    }

    for (let i = 0; i < strikes.length; i++) {
      const mid = (premiumPutsBid[i] + premiumPutsAsk[i]) / 2;
      premiumPutsMid.push(mid);
    }

    // Insert nulls where strikes are ITM
    for (let i = 0; i < strikes.length; i++) {
      if (i <= Math.floor(strikes.length / 2) - 1) {
        premiumCallsMid[i] = null;
      }
      if (i >= Math.floor(strikes.length / 2) + 1) {
        premiumPutsMid[i] = null;
      }
    }

    return [premiumCallsMid, premiumPutsMid]

  }

  

  async getOptionAttribute(symbol: string, strike: number, putCall: string, dte: number, attr: string) {
    const data = await this.getSingleOptionData(symbol, strike, putCall, dte)
    const arr = _.map(data, attr);
    return arr;
  }


  plotImpliedVolatilitySkew(symbol: string, expirationDate: string, dte: number, strikes: any, ivCalls: any, ivPuts: any) {
    // if chart already exists, destroy it before re-drawing
    // if (this.lineChart) {
    //   this.lineChart.destroy();
    // }
    this.lineChartOptions = {
      chart: {
        height: 500
      },
      title: {text: `${symbol} Implied Vol Skew`},
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
  }

  plotPremiumSkew(symbol: string, expirationDate: string, dte: number, strikes: any, premiumCalls: any, premiumPuts: any) {
    // if chart already exists, destroy it before re-drawing
    // if (this.lineChart) {
    //   this.lineChart.destroy();
    // }
    this.lineChartOptions = {
      chart: {
        height: 500
      },
      title: {text: `${symbol} Premium Skew`},
      subtitle: { text: `Exp: ${expirationDate} | DTE: ${dte}`},
      xAxis: {
        title: {text: 'Strike'},
        categories: strikes
      },
      yAxis:  {
        title: {text: 'Premium ($)'}
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
          data: premiumCalls
        },
        {
          name: 'Puts',
          data: premiumPuts
        }
      ]
    };
    this.lineChart = Highcharts.chart('PremiumSkew', this.lineChartOptions);
  }

  test(data: any) {
    console.log(data)
  }
}
