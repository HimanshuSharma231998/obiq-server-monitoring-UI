import { ChangeDetectorRef, Component, OnInit, output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfigurationSettingsComponent } from 'src/app/environment/configure/configuration-settings/configuration-settings.component';
import { NotificationType } from 'src/app/global/enums';
import { AppDataService } from 'src/app/services/app-data.service';
import { AppService } from 'src/app/services/app.service';
import { NotificationsService } from 'src/app/services/notification-service/notifications.service';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-navigator-left',
  templateUrl: './navigator-left.component.html',
  styleUrls: ['./navigator-left.component.scss']
})
export class NavigatorLeftComponent implements OnInit {

  constructor(
    private modalService: NgbModal,
    private router: Router,
    private route: ActivatedRoute,
    private service_data: AppDataService,
    public app_service: AppService,
    public dataService: AppDataService,
    private cdr: ChangeDetectorRef,
    public service_notification : NotificationsService


  ) { }

  // analyticsValueChange = output<any>()
  // onChangeView = output<any>()
  // onSettingsSelected = output<any>()
  onLeftPanelDataChange = output<any>()

  dataChanged = {
    "viewSelected": {},
    "settingsPanel": { isOpen: false, selectedViewSettings: {} },
    "analyticsTypes": {},
    "selectedTab": {}
  }

  ngOnInit(): void {
    this.app_service.dataReceiver().subscribe(data => {
      if (data !== null) {
        if (data == "viewCreated") {
          this.getAllVIews();
          
          this.cdr.detectChanges();
          
        }
        else if(data?.callsource == 'settings'){
          if(data?.data == 'backToMenu'){
            this.backToMenu()
          }
        }
      }
    });
    this.getAllVIews();
  }
  selectedView: any = {}

  analyticsTypes: any;

  selectedAnalyticsType: any = {}


  change_view(selected_item: any) {

    console.log("selected_item==", selected_item);
  }
  changeAnalyticsSelection(item) {


    // this.analyticsTypes.forEach((ele)=>{
    //   if(ele.isSelected){
    //     ele.isSelected = false
    //   }
    // })

    //   item.isSelected = true
    this.selectedAnalyticsType = item
    this.dataChanged.analyticsTypes = this.selectedAnalyticsType
    this.onLeftPanelDataChange.emit(this.dataChanged)

  }

  viewList = [
    'view1',
    'view2',
    'view3'
  ]

  totalViews = [];
  set_Selected_View_DataSource(selectedVIew) {
    window.loadingStart("#navigator-left", "Please wait");
    let form_url = environment.BASE_OBIQ_SERVER_URL + "OpkeyObiqServerApi/OpkeyTraceIAAnalyticsApi/ObiqAgentServerTraceController/getDataSourceListByViewId";

    let form_data = { viewId: selectedVIew.viewId };

    this.app_service.make_post_server_call(form_url, form_data)
      .subscribe({
        next: (result: any) => {
          window.loadingStop("#navigator-left");

          result.forEach((item, index) => {
            item.display = index === 0
          })
          this.analyticsTypes = result;
          // this.selectedAnalyticsType = result[0];
          // this.dataChanged.analyticsTypes = this.selectedAnalyticsType
          // this.onLeftPanelDataChange.emit(this.dataChanged)
         

        },
        error: (error: any) => {
          window.loadingStop("#navigator-left");
          console.warn(error);
        },
        complete: () => {
          console.log("Completed");
        }
      });
  }

  set_Selected_VIew(selectedVIew) {

    window.loadingStart("#navigator-left", "Please wait");
    let form_url = environment.BASE_OBIQ_SERVER_URL + "OpkeyObiqServerApi/OpkeyTraceIAAnalyticsApi/TelemetryViewController/setSelectedView";

    let form_data = {
      viewId: selectedVIew.viewId,
      userId: this.dataService.UserDto.UserDTO.U_ID,
      projectId: this.dataService.UserDto.ProjectDTO.P_ID
    };

    this.app_service.make_post_server_call(form_url, form_data).subscribe({
      next: (result: any) => {
        window.loadingStop("#navigator-left");
        this.set_Selected_View_DataSource(result)
      


      },
      error: (error: any) => {
        window.loadingStop("#navigator-left");
        console.warn(error);
      },
      complete: () => {
        console.log("Completed");
      }
    });
  }

  getAllVIews() {

    window.loadingStart("#navigator-left", "Please wait");

    let form_url = environment.BASE_OBIQ_SERVER_URL + "OpkeyObiqServerApi/OpkeyTraceIAAnalyticsApi/TelemetryViewController/getAllViewsOfCurrentUser";

    let form_data = {
      userId: this.dataService.UserDto.UserDTO.U_ID,
      projectId: this.dataService.UserDto.ProjectDTO.P_ID
    }

    this.app_service.make_post_server_call(form_url, form_data).subscribe({
      next: (result: any) => {
        window.loadingStop("#navigator-left");
        if (result == null || result?.length == 0) {
          this.router.navigate(['environment/configure']);
        }
        console.log(result, "get all  views resultS")
        if (result?.length > 0) {
          this.service_data.viewsData = result
          this.totalViews = result
          this.selectedView = this.totalViews[this.totalViews.length-1];
          this.selectedViewSettings = this.selectedView;
          this.dataChanged.viewSelected = this.selectedView
          this.set_Selected_VIew(this.selectedView)
        }


      },
      error: (error: any) => {
        window.loadingStop("#navigator-left");
        console.warn(error);
      },
      complete: () => {
        console.log("Completed");
      }
    });
  }
  add_environment() {
    const modalRef = this.modalService.open(ConfigurationSettingsComponent, {
      backdrop: 'static',
      keyboard: false,
      size: 'full',
      centered: true,
      windowClass: 'layout-modal transition-none'
    });
    modalRef.result.then((result) => {
    }, (response) => {
      if (response == 'close modal') {
        return;
      }
      else if (response == 'create_environment')
        this.select_service_data();
    });
  }

  select_service_data() {

    this.service_data.is_env_configure = true;
    this.router.navigate(['/environment']);
  }

  viewChanged(val) {
   
    this.selectedView = val
    this.dataChanged.viewSelected = this.selectedView
    this.set_Selected_VIew(this.selectedView)
    this.service_notification.notifier(NotificationType.success, 'View selected');
  }

  changeToView() {
    this.selectedAnalyticsType = {}
    this.analyticsTypes.forEach((ele) => {
      if (ele.isSelected) {
        ele.isSelected = false
      }
    })
    this.dataChanged.analyticsTypes = this.selectedAnalyticsType
  
    this.onLeftPanelDataChange.emit(this.dataChanged)

  }

  isopenSettings: boolean = false
  selectedView2: any = {}
  openSettings() {

    this.isopenSettings = true
    this.selectedView2 = this.totalViews[0];
    this.selectedViewSettings = this.selectedView2;
    this.dataChanged.viewSelected = this.selectedView2
    // this.set_Selected_VIew(this.selectedView)

    this.dataChanged.settingsPanel = { isOpen: this.isopenSettings, selectedViewSettings: this.selectedViewSettings }
    this.onLeftPanelDataChange.emit(this.dataChanged)

  }
  backToMenu() {
    this.isopenSettings = false
    // this.selectedView = this.totalViews[this.totalViews.length-1];
    this.selectedViewSettings = this.selectedView;
    this.dataChanged.viewSelected = this.selectedView
    this.dataChanged.settingsPanel = { isOpen: this.isopenSettings, selectedViewSettings: this.selectedViewSettings }
    this.onLeftPanelDataChange.emit(this.dataChanged)

  }

  selectedViewSettings: any = {}

  settingsViewSelect(val) {
   
    // this.selectedViewSettings = val
    this.dataChanged.settingsPanel = val
    this.onLeftPanelDataChange.emit(this.dataChanged)
    // this.onSettingsSelected.emit(val)

  }
  Rename_Selected_View(view) {

  }
  Delete_Selected_View(view) {

    window.loadingStart("#navigator-left", "Please wait");
    let form_url = environment.BASE_OBIQ_SERVER_URL + "OpkeyObiqServerApi/OpkeyTraceIAAnalyticsApi/TelemetryViewController/deleteView";

    let form_data = {
      viewId: view.viewId,
      projectId: this.dataService.UserDto.ProjectDTO.P_ID
    }

    this.app_service.make_post_server_call(form_url, form_data)
      .subscribe({
        next: (result: any) => {
          window.loadingStop("#navigator-left");
          this.getAllVIews();

        },
        error: (error: any) => {
          window.loadingStop("#navigator-left");
          console.warn(error);
        },
        complete: () => {
          console.log("Completed");
        }
      });
  }

  selectionChanged(val) {
    
    this.dataChanged.analyticsTypes = val
    this.onLeftPanelDataChange.emit(this.dataChanged)
   
 
  
  }

}
