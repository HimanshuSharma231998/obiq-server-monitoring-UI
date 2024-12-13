import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AppDataService } from 'src/app/services/app-data.service';
import { AppService } from 'src/app/services/app.service';
import { environment } from 'src/environments/environment';
import { ManagerRightPanelComponent } from '../right-panel/manager-right-panel.component';

@Component({
  selector: 'app-environment-manager-main-right',
  templateUrl: './environment-manager-main-right.component.html',
  styleUrl: './environment-manager-main-right.component.scss'
})
export class EnvironmentManagerMainRightComponent implements OnInit, OnDestroy, AfterViewInit {

  constructor(
    private modalService: NgbModal,
    private router: Router,
    private route: ActivatedRoute,
    public service_data: AppDataService,
    public app_service: AppService,
    public dataService: AppDataService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnDestroy(): void {

  }
  
  ngOnInit(): void {
    this.app_service.dataReceiver().subscribe(data => {
     
      if (data !== null) {
        if(data.callsource == 'timeExplorerChart'){

          this.receivedTimeRange = data.data;
          console.log('Received Data:', this.receivedTimeRange);
  
          // Manually trigger change detection
          this.cdr.detectChanges();
        }
      }
      
    });
  }
  ngAfterViewInit(): void {
   this.calculateCurrentDate();
  }


  calculateCurrentDate(){
   
    this.fromDatevalue.setDate(this.fromDatevalue.getDate() - 1);
    this.receivedTimeRange  = this.fromDatevalue.toLocaleString('en-us',{day : 'numeric' ,month:'short',hour: 'numeric',minute: 'numeric', hour12: true}) + " to "+ this.toDateValue.toLocaleString('en-us',{day : 'numeric' ,month:'short',hour: 'numeric',minute: 'numeric',  hour12: true}) ;


  }
  timezoneDatasource = []
  selectedTimezone:any
  receivedTimeRange: any
  selectedAnalyticsType: any = {}
  selectedView: any
  selectedTab: any = {}
  availableTabs: any
  timeFilter: Array<{name: string, value: string, timeValue: string}> = [
    { name: '30min', value: '30 minutes', timeValue: "LAST_30_MINUTES"},
    { name: '60min', value: '60 minutes', timeValue: "LAST_60_MINUTES"},
    { name: '3hr', value: '3 hour', timeValue: "LAST_3_HOUR"},
    { name: '6hrs', value: '6 hours', timeValue: "LAST_6_HOUR"},
    { name: '12hrs', value: '12 hours', timeValue: "LAST_12_HOUR"},
    { name: '24hrs', value: '24 hours', timeValue: "LAST_24_HOUR"},
    { name: '3days', value: '3 days', timeValue: "LAST_3_DAYS"},
    { name: '7days', value: '7 days', timeValue: "LAST_7_DAYS"},
    { name: '1mons', value: '1 months', timeValue: "LAST_1_MONTH"},
    { name: '3mons', value: '3 months', timeValue: "LAST_3_MONTH"},
    { name: 'setCustom', value: 'Set Custom', timeValue: ""},
  ];
  selectedTime: string = '30min';
  public fromDatevalue: Date = new Date();
  public toDateValue: Date = new Date();
  public dateTimeFormat = "MM/dd/yyyy HH:mm";
  @ViewChild('timeFilterToggleButton') toggleButton: ElementRef<HTMLButtonElement>;
  @Input('child_data') set child_data({ selectedAnalyticsType, selectedView }) {
    
    this.selectedAnalyticsType = selectedAnalyticsType;
    if (selectedView) {
      this.selectedView = selectedView
    }
    this.bindData()

  }

  onSelctTime(timeItem){
    this.selectedTime = timeItem?.name;
    if(this.selectedTime == "setCustom"){
      return;
    }
    // const fromDateTime = new Date();
    // let toDateTime = new Date(fromDateTime);
    // if(this.selectedTime.includes('min')){
    //   toDateTime.setMinutes(fromDateTime.getMinutes() + timeItem?.timeValue);
    // } else if(this.selectedTime.includes("hrs")){
    //   toDateTime.setHours(fromDateTime.getHours() + timeItem?.timeValue)
    // } else if(this.selectedTime.includes('mon')){
    //   toDateTime.setMonth(fromDateTime.getMonth() + timeItem?.timeValue);
    // }

    // console.log("from : ", fromDateTime, " To : ", toDateTime);
    this.app_service.setStreamData({ type: "getDataWithTime", timeFilter: {type: 'setEnum', value: timeItem?.timeValue}});
    this.closeTimeFilterDropdown();
  }

  applyCustomFilter(){
    // console.log("fromDate: ", this.fromDatevalue, " toDate: ", this.toDateValue);
    this.app_service.setStreamData({ type: "getDataWithTime", timeFilter: {type: 'setCustom', fromTimeInMillis: this.fromDatevalue.getTime(), toTimeInMillis: this.toDateValue.getTime() }});
    this.closeTimeFilterDropdown();
  }

  closeTimeFilterDropdown(){
    this.toggleButton.nativeElement.click();
  }

  get_Tab_Control_List(AnalysticsType) {
    window.loadingStart("#Env_manager_main_right", "Please wait");
    let form_url = environment.BASE_OBIQ_SERVER_URL + "OpkeyObiqServerApi/OpkeyTraceIAAnalyticsApi/ObiqAgentServerTraceController/getDataSourceTabControlList";

    let form_data = { systemId: AnalysticsType.systemId };

    this.app_service.make_post_server_call(form_url, form_data).subscribe({
      next: (result: any) => {
        window.loadingStop("#Env_manager_main_right");

        result.forEach((item, index) => {
          if (item.enumType == "OVERVIEW_TAB") {
            item.isVisible = true
            item.isSelected = true
          }
          else {
            item.isVisible = true;
            item.isSelected = false;
          }

        })
        this.availableTabs = result
        this.selectedTab = result[0]
      },
      error: (error: any) => {
        window.loadingStop("#Env_manager_main_right");
        console.warn(error);
      },
      complete: () => {
        console.log("Completed");
      }
    });
  }
  bindData() {
   
    if (Object.keys(this.selectedAnalyticsType).length != 0) {
      // if(this.selectedAnalyticsType.type == 'ERP_ANALYTICS_DATASOURCE'){
      this.get_Tab_Control_List(this.selectedAnalyticsType)

      // }
      // else if(this.selectedAnalyticsType.val == '"USER_BEHAVIOUR_ANALYTICS_DATASOURCE"'){
      //   this.availableTabs = [
      //     {name:'Overview',val:'overview',isVisible:true,isSelected:true},
      //     {name:'Log',val:'log',isVisible:true,isSelected:false},
      //     {name:'Time Explorer',val:'timeexplorer',isVisible:true,isSelected:false},
      //     {name:'Telemetry',val:'telemetry',isVisible:true,isSelected:false},
      //   ]
      // }
      // else if(this.selectedAnalyticsType.val == 'userbehaviour'){
      //   this.availableTabs = [
      //     {name:'Overview',val:'overview',isVisible:true,isSelected:true},
      //     {name:'Log',val:'log',isVisible:true,isSelected:false},
      //     {name:'Time Explorer',val:'timeexplorer',isVisible:false,isSelected:false},
      //     {name:'Telemetry',val:'telemetry',isVisible:false,isSelected:false},
      //   ]
      // }
      // else {
      //   this.availableTabs = [
      //     {name:'Overview',val:'overview',isVisible:true,isSelected:true},
      //     {name:'Log',val:'log',isVisible:true,isSelected:false},
      //     {name:'Time Explorer',val:'timeexplorer',isVisible:true,isSelected:false},
      //     {name:'Telemetry',val:'telemetry',isVisible:false,isSelected:false},
      //   ]
      // }

    }
    else {
      this.availableTabs = [
        {
          "enumType": "OVERVIEW_TAB",
          "text": "Overview",
          'isVisible': true,
          'isSelected': true
        },
        {
          "enumType": "LOG_TAB",
          "text": "Log",
          'isVisible': true,
          'isSelected': false
        },
      ]

      this.selectedTab = this.availableTabs[0]
    }


  }


  changeSelectedTab(tab) {
    // this.selectedTab = val
    this.availableTabs.forEach((ele) => {
      if (ele.isSelected) {
        ele.isSelected = false
      }
    })
    tab.isSelected = true
    this.selectedTab = tab
    this.selectedTime = 'setCustom';
  }

  addWidget() {
    const modalRef = this.modalService.open(ManagerRightPanelComponent, {
      backdrop: 'static',
      keyboard: false,
      size: 'full',
      centered: true,
      windowClass: 'layout-modal-right panel-end'
    });
    modalRef.result.then((result) => {
    }, (response) => {
      if (response == 'close modal') {
        return;
      }
    });
    modalRef.componentInstance.selectedItem = { callsource: 'addWidget' };
  }
  getTimezones() {

    var form_url = environment.BASE_OPKEY_URL + "Application/GetTimeZones";
    var form_data = {};

    this.app_service.make_get_server_call(form_url, form_data).subscribe(
      (result: any) => {
      
        this.timezoneDatasource = result;
        this.selectedTimezone =  this.timezoneDatasource.find(ele=>ele.Id == 'India Standard Time' );
        this.cdr.detectChanges();
      },
      (error) => {

      }
    );


  }
  toggleEdit(){
    this.notEditable = !this.notEditable
  }
  notEditable = true
}
