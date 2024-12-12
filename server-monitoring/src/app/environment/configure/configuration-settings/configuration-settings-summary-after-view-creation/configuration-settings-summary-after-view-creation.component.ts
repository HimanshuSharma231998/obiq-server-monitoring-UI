import { AfterViewInit, ChangeDetectorRef, Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AppDataService } from 'src/app/services/app-data.service';
import { AppService } from 'src/app/services/app.service';
import { environment } from 'src/environments/environment';
import { ConfigureRightPanelComponent } from '../../configure-right-panel/configure-right-panel.component';
import { NotificationsService } from 'src/app/services/notification-service/notifications.service';
import { NotificationType } from 'src/app/global/enums';
@Component({
  selector: 'app-configuration-settings-summary-after-view-creation',
  templateUrl: './configuration-settings-summary-after-view-creation.component.html',
  styleUrl: './configuration-settings-summary-after-view-creation.component.scss'
})
export class ConfigurationSettingsSummaryAfterViewCreationComponent implements OnInit, AfterViewInit {
  receivedAccessType: any;
  constructor(
    public app_service: AppService,
    public dataService: AppDataService,
    public modalService: NgbModal,
    private cdr: ChangeDetectorRef,
    public service_notification : NotificationsService, 
  ) {
  }
  obj_configuration_setting: any;
  selectedAccessType: string = 'PRIVATE';
  accessTypes: string[] = ['PUBLIC', 'PRIVATE', 'SHARED'];
  users: any[] = [];
  selectedUsers: any[] = [];
  Show_Project_Access: boolean = false;
  Selected_grid_dataSource: any;
  selected_grid_System_Diagnostics : any  = []
  selected_user_behaviour_component: any = []
  selected_test_automation_analysis : any = []
  groupedDataSource: any = {};
  ngOnDestroy() {
    this.dataService.isEnablePersister = false

  }

  @Input('child_data')
  set child_data({ obj_configuration_setting }) {
  
    if (obj_configuration_setting !== this.obj_configuration_setting) {
      this.obj_configuration_setting = obj_configuration_setting;


      this.onConfigurationSettingChange();
    }
  }


  

  onCellClick(event) {

  }
  OnAccessTypeClick() {

    const modalRef = this.modalService.open(ConfigureRightPanelComponent, {
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
    modalRef.componentInstance.selectedItem = this.obj_configuration_setting 
   

  }
  onConfigurationSettingChange(): void {
    
  
    if (this.obj_configuration_setting) {

      this.obj_configuration_setting.selected_erp_analytics = this.obj_configuration_setting.selected_erp_analytics.map(item => {
        return {
          ...item,
          value: JSON.parse(item.value)
        };
      });
      this.Selected_grid_dataSource = this.obj_configuration_setting.selected_erp_analytics

      
    }
   
    this.selectedAccessType = this.obj_configuration_setting?.selected_view?.accessType
    this.dataService.changedAccessType=this.selectedAccessType
    console.log('Configuration setting has changed:', this.obj_configuration_setting);

    
  
}



  ngOnInit(): void {
    this.app_service.dataReceiver().subscribe(data => {
      
      if (data !== null) {
      
        this.receivedAccessType = data;
        console.log(this.receivedAccessType, "recived==========")
        this.selectedAccessType = this.receivedAccessType?.AccessType
        this.dataService.changedAccessType=this.selectedAccessType
        this.obj_configuration_setting.AccessType = this.receivedAccessType.AccessType;
        if (this.obj_configuration_setting.AccessType == "SHARED") {
          this.obj_configuration_setting.selectedUids = this.receivedAccessType.map(item => ({
            userId: item.U_ID,
            permmission: item.permission === "EDIT" ? "ALL" : item.permission
          }));
        }
        else if (this.obj_configuration_setting.AccessType == "PUBLIC") {

          this.obj_configuration_setting.selectedUids.userId = "00000000-0000-0000-0000-000000000000"
          if (this.receivedAccessType.AccessPermisions.EDIT == true) {
            this.obj_configuration_setting.selectedUids.permmission = "ALL";
          }
          else {
            this.obj_configuration_setting.selectedUids.permmission = "VIEW"
          }
        }
        else {
          this.obj_configuration_setting.selectedUids.userId = "00000000-0000-0000-0000-000000000000"
          this.obj_configuration_setting.selectedUids.permmission = "ALL";

        }
        this.cdr.detectChanges();
      }
    });

    
  }
  ngAfterViewInit(): void {
   
  }
  onAccessTypeChange(selectedOption: string) {
    
    this.selectedAccessType = selectedOption;
    if (this.selectedAccessType == "SHARED") {
      this.getAllProjects()
    }
    else {
      this.Show_Project_Access = false
    }
    this.obj_configuration_setting.AccessType = this.selectedAccessType
    console.log('Access Type Changed:', selectedOption);

  }

  onUserSelect(user: any, event: Event): void {
  
    if ((event.target as HTMLInputElement).checked) {

      this.selectedUsers.push({
        userId: user.U_ID,
        permmission: "ALL" // abhi ke liye sabke liye All 
      });
    } else {
      this.selectedUsers = this.selectedUsers.filter(selectedUser => selectedUser.userId !== user.U_ID);
    }


    console.log(this.selectedUsers);
  }
  create_to_update_object() {
  
    var obj_Update_View = new Object();
    obj_Update_View["viewId"] = this.obj_configuration_setting.selected_view.viewId,
      obj_Update_View["viewName"] = this.obj_configuration_setting.selected_view.viewName,
      obj_Update_View["accessType"] = this.selectedAccessType,
      obj_Update_View["userId"] = this.dataService.UserDto.UserDTO.U_ID
      obj_Update_View["projectId"] = this.dataService.UserDto.ProjectDTO.P_ID
      obj_Update_View["authorizedUsers"] = this.obj_configuration_setting.AccessType === 'PRIVATE' ? [{ userId: this.dataService.UserDto.UserDTO.U_ID, permmission: "ALL" }] : this.obj_configuration_setting.AccessType === 'PUBLIC' ? [{userId: this.dataService.UserDto.UserDTO.U_ID, permmission: this.obj_configuration_setting.selectedUids.permmission}] : this.obj_configuration_setting.selectedUids;
      return obj_Update_View;
  }
  Update_ViewAccess_Type() {

    let form_url = environment.BASE_OBIQ_SERVER_URL + "OpkeyObiqServerApi/OpkeyTraceIAAnalyticsApi/TelemetryViewController/updateView";

    let form_data = this.create_to_update_object() as any;


    this.app_service.make_post_server_call(form_url, form_data)
      .subscribe({

        next: (result: any) => {
          this.app_service.dataTransmitter("viewCreated");
          this.selectedAccessType = form_data.accessType;
        },
        error: (error: any) => {

          console.warn(error);
        },
        complete: () => {
          console.log("Completed");
          this.service_notification.notifier(NotificationType.success, 'Access Type Updated');
        }
      });
  }

  getAllProjects() {
   
   
    let form_url = environment.BASE_OBIQ_SERVER_URL + "Profile/GetAssignedUsersInProject";

    let form_data = { P_ID: this.dataService.UserDto.ProjectDTO.P_ID };

    this.app_service.make_get_server_call(form_url, form_data)
      .subscribe({

        next: (result: any) => {

          this.Show_Project_Access = true
          this.users = result;
        },
        error: (error: any) => {

          console.warn(error);
        },
        complete: () => {
          console.log("Completed");
        }
      });
  }

  backToMenu(){
    if(this.dataService.isEnablePersister){
      
      this.service_notification.showPersister('You have unsaved changes, wish to continue?')
      this.dataService.modalSubInstance.result.then((result) => {
      }, (response) => {
        if(response == 'Yes'){
          this.app_service.dataTransmitter({callsource:'settings',data:'backToMenu'});
          this.dataService.modalSubInstance = null
          return
        }
        else if(response == 'No'){
          this.dataService.modalSubInstance = null
          return
        }
  
        
      });
    }
    else{
      this.app_service.dataTransmitter({callsource:'settings',data:'backToMenu'});
    }
   
  }

  updateSummaryData(){
    if(this.dataService.isEnablePersister){
      
      this.service_notification.showPersister('You have unsaved changes, wish to continue?')
      this.dataService.modalSubInstance.result.then((result) => {
      }, (response) => {
        if(response == 'Yes'){
          this.Update_ViewAccess_Type()
          this.dataService.modalSubInstance = null
          return
        }
        else if(response == 'No'){
          this.dataService.modalSubInstance = null
          return
        }
  
        
      });
    }
    else{
      this.Update_ViewAccess_Type()
    }
  }
}
