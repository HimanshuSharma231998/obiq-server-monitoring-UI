import { Component, Input, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-environment-manager-main-right-overview-tab',
  templateUrl: './environment-manager-main-right-overview-tab.component.html',
  styleUrl: './environment-manager-main-right-overview-tab.component.scss'
})
export class EnvironmentManagerMainRightOverviewTabComponent implements OnInit,OnDestroy {

  constructor(){
  }
  ngOnInit(): void {
    console.log(this.view,"this is view ==============================");
    console.log(this.selectedAnalyticsType,"this is selected Analytics type ===================")
  }
  ngOnDestroy(): void {
    
  }
  @Input() view:any
  @Input() selectedAnalyticsType:any

  applicationTotalData:any = [{
    applicationName : 'Oracle Fusion',
    cpu:'02.68',
    ram:'08.89',
    health:'good',
  },
  {
    applicationName : 'Sap',
    cpu:'09.68',
    ram:'80.89',
    health:'good',
  }
];
 
 progressBarArray: Array<{heading: string, widgetType: string}> = [
  {heading: "User Guides Per Process", widgetType: "USER_GUIDE_LIST_PER_PROCESS_WIDGET"},
  {heading: "Top 5 Fastest Journeys", widgetType: "USER_JOURNEY_TOP_FAST_WIDGET"},
  {heading: "5 Slowest Journeys", widgetType: "USER_JOURNEY_TOP_SLOW_WIDGET"},
  {heading: "5 Most Common Journeys", widgetType: "USER_JOURNEY_MOST_COMMON_WIDGET"},
 ]
}
