import { Component, OnInit } from '@angular/core';
import { ApiDataService} from '../../services/api-data.service'
import * as Highcharts from 'highcharts';
declare var require: any;

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  skewData: any

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
    this.plotFteHistoryChart();
  }

  getSkewData() {
    this.apiDataService.getSkewData()
    .subscribe(
      res => {
        console.log('Test: ', res);
        this.skewData = res;
      },
      err => {
        console.log(err);
      }
    );
  }

  plotFteHistoryChart() {
    // if chart already exists, destroy it before re-drawing
    if (this.lineChart) {
      this.lineChart.destroy();
    }
    this.lineChartOptions = {
      // title: {text: `Supply Demand ${this.selectedProject.NCIProjectName}`},
      title: {text: `Skew`},
      subtitle: { text: 'Time Period: All historic data'},
      xAxis: {
        type: 'datetime'
      },
      yAxis:  {
        title: {text: 'Supply'}
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

      series: [{
        name: 'Jane',
        data: [1, 0, 4]
      }]
    };
    this.lineChart = Highcharts.chart('SupplyDemand', this.lineChartOptions);
    
    // loop through the historic FTE data object and plot each object as an independent series
    // this.lineChart.addSeries({
    //   name: this.demandData.name,
    //   data: this.demandData.data
    // });
  }

}
