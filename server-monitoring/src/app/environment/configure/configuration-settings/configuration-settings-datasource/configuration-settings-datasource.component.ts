import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { AppService } from 'src/app/services/app.service';
import { environment } from 'src/environments/environment';
import { AppDataService } from 'src/app/services/app-data.service';

@Component({
  selector: 'app-configuration-settings-datasource',
  templateUrl: './configuration-settings-datasource.component.html',
  styleUrl: './configuration-settings-datasource.component.scss'
})
export class ConfigurationSettingsDatasourceComponent implements OnInit {


  constructor(
    public activeModal: NgbActiveModal,
    public app_service: AppService,
    public data_service:AppDataService
  ) { }


  obj_configuration_setting: any;

  obj_error = {
    dispaly_viewName: false,
    dispaly_DataSource: false,
    display_ErpApplication: false,
    display_SystemDiagnosticsData: false,
    isDuplicateName:false
  }

  @Input('child_data') set child_data({ obj_configuration_setting, dispaly_viewName, dispaly_DataSource, display_ErpApplication, display_SystemDiagnosticsData }) {
    this.obj_configuration_setting = obj_configuration_setting;
    this.obj_error.dispaly_viewName = dispaly_viewName;
    this.obj_error.dispaly_DataSource = dispaly_DataSource;
    this.obj_error.display_ErpApplication = display_ErpApplication;
    this.obj_error.display_SystemDiagnosticsData = display_SystemDiagnosticsData;
    this.bindData()
  }

  ngOnInit() {
    this.get_all_datasource();
    this.restet_obj_datasource();
  }

  obj_datasource_widget = {
    viewName: "",
    select_datasource_item: [],
    select_applicaton_item: [],
    select_systemDiagnostics_item: []
  }

  restet_obj_datasource() {
    this.obj_configuration_setting.selected_datasource = this.obj_datasource_widget;
    this.obj_error.dispaly_viewName = false;
    this.obj_error.dispaly_DataSource = false;
    this.obj_error.display_ErpApplication = false;
    this.obj_error.display_SystemDiagnosticsData = false;
    this.datasource_item_name = "";
  }

  modal_name = '';
  data_Source_widjets = [];
  Available_Application_Instances:any;

  get_all_datasource() {

    window.loadingStart("#div-datasource-slection", "Please wait");
    let form_url = environment.BASE_OBIQ_SERVER_URL + "OpkeyObiqServerApi/OpkeyTraceIAAnalyticsApi/ObiqAgentServerTraceController/getDataSourceGroupList";
    let form_data = {};

    this.app_service.make_get_server_call(form_url, form_data)
      .subscribe({

        next: (result: any) => {
          window.loadingStop("#div-datasource-slection");
          result.forEach((widjet: any) => {
          
            if (widjet.name === "ERP Analytics") {

              this.get_AllApplications();
            }
            if (widjet.name === "User Behaviour Analytics") {

            }
            if (widjet.name === "Test Automation Analytics") {

            }
            if (widjet.name === "System Diagnostics") {
              this.get_datasource_system_diagnostics(widjet.id);
            }
          });


          this.data_Source_widjets = result;

          this.data_Source_widjets.forEach(item => {
            item['isChecked'] = false;
            if(this.obj_datasource_widget?.select_datasource_item?.length > 0){
              this.obj_datasource_widget?.select_datasource_item.forEach(ele =>{
                if(ele.id == item.id){
                  item['isChecked'] = true;
                }
              })
              
            }
          })
         

        },
        error: (error: any) => {
          window.loadingStop("#div-datasource-slection");
          console.warn(error);
        },
        complete: () => {
          window.loadingStop("#div-datasource-slection");
          console.log("Completed");
        }
      });


  }


  datasource_application = [];

  get_AllApplications() {

    // this.datasource_application = [
    //   "OracleFusion",
    //   "SAP",
    //   "Salesforce",
    //   "PeopleSoft",
    //   "Workday",
    //   "OracleEBS",
    //   "MSDynamicsFSO",
    //   "VeevaVault",
    //   "Coupa",
    //   "OracleIntegrationCloud"
    // ];
    // return

    let form_url = environment.BASE_OPKEY_URL + "ExternalApplicationSettings/GetApplications";
    // let form_url = "https://myqlm.dev.opkeyone.com/ExternalApplicationSettings/GetApplications";
    let form_data = {};

    this.app_service.make_get_server_call(form_url, form_data)
      .subscribe({

        next: (result: any) => {
          this.datasource_application = result;
          this.get_ERP_App_Instance_count(result)
          console.log(this.Available_Application_Instances,"A---------------------");
        },
        error: (error: any) => {

          console.warn(error);
        },
        complete: () => {
          console.log("Completed");
        }
      });
  }
  get_ERP_App_Instance_count(instances){
      let select_applicaton = this.obj_configuration_setting.selected_datasource.select_applicaton_item;
  
      let form_url = environment.BASE_OPKEY_URL + "ExternalApplicationSettings/GetAllSettingsByApplications";  
      let form_data = { str_application: JSON.stringify(instances) };
  
      this.app_service.make_get_server_call(form_url, form_data)
        .subscribe({
          next: (result: any) => {
              this.Available_Application_Instances = Object.keys(result).reduce((acc: any, app: string) => {
                acc[app] = result[app]?.length || 0;  // caluclated instances of all the appliations
                return acc;
            }, {});
            
            console.log(this.Available_Application_Instances, "A---------------------");

          
           
          },
          error: (error: any) => {
            console.warn(error);
          },
          complete: () => {
            console.log("Completed");
          }
        });

  }


  datasource_system_diagnostics = [];

  get_datasource_system_diagnostics(widjet_id) {
    let form_url = environment.BASE_OBIQ_SERVER_URL + "OpkeyObiqServerApi/OpkeyTraceIAAnalyticsApi/ObiqAgentServerTraceController/getDataSourceServiceList";
    let form_data = { id: widjet_id };
    this.app_service.make_post_server_call(form_url, form_data)
      .subscribe({

        next: (result: any) => {
          this.datasource_system_diagnostics = result;
        },
        error: (error: any) => {

          console.warn(error);
        },
        complete: () => {
          console.log("Completed");
        }
      });
  }

 

  onInputChange(event: any) {
    
    
    this.modal_name = event.target.value;
    if(this.modal_name!="")this.obj_error.dispaly_viewName=false;
    else this.obj_error.dispaly_viewName=true;
   
    let form_url = environment.BASE_OBIQ_SERVER_URL + "OpkeyObiqServerApi/OpkeyTraceIAAnalyticsApi/TelemetryViewController/checkViewNameExists";

    let form_data ={
      "viewName":this.modal_name,
      "userId":this.data_service.UserDto.UserDTO.U_ID,
      "projectId":this.data_service.UserDto.ProjectDTO.P_ID
      }

    this.app_service.make_post_server_call(form_url, form_data)
      .subscribe({
        next: (result: any) => {
          window.loadingStop("#navigator-left");

        this.obj_error.isDuplicateName=result
         
          

        },
        error: (error: any) => {
          window.loadingStop("#navigator-left");
          console.warn(error);
        },
        complete: () => {
          console.log("Completed");
        }
      });
    this.obj_datasource_widget.viewName = event.target.value;
    this.obj_configuration_setting.selected_datasource = this.obj_datasource_widget;




  }

  datasource_item_name = "";
  select_datasource(dataItem) {
  
    // this.datasource_item_name = dataItem.name;
    dataItem.isChecked = !dataItem.isChecked;
    if (dataItem.isChecked) {
      this.obj_datasource_widget.select_datasource_item.push(dataItem);
    } else {
      let index = this.obj_datasource_widget.select_datasource_item.findIndex(item => item == dataItem);
      this.obj_datasource_widget.select_datasource_item.splice(index, 1);
    }

    this.obj_configuration_setting.selected_datasource = this.obj_datasource_widget;
    
    if (this.obj_configuration_setting.selected_datasource.select_datasource_item.length > 0) 
    { 
        this.obj_error.dispaly_DataSource = false;
    }
    else{
        this.obj_error.dispaly_DataSource = true;
    }

  }

  select_applicaton(dataItem, event) {
   
    if (event.target.checked) {
      this.obj_datasource_widget.select_applicaton_item.push(dataItem);
    } else {
      let index = this.obj_datasource_widget.select_applicaton_item.findIndex(item => item == dataItem);
      this.obj_datasource_widget.select_applicaton_item.splice(index, 1);
    }

    this.obj_configuration_setting.selected_datasource = this.obj_datasource_widget;
    
    if (this.obj_configuration_setting.selected_datasource.select_applicaton_item.length > 0) 
    { 
          this.obj_error.display_ErpApplication = false;
    }
    else{
          this.obj_error.display_ErpApplication = true;
    }

  }

  select_systemDiagnostics(dataItem, event) {

    if (event.target.checked) {
      this.obj_datasource_widget.select_systemDiagnostics_item.push(dataItem);
    } else {
      let index = this.obj_datasource_widget.select_systemDiagnostics_item.findIndex(item => item == dataItem);
      this.obj_datasource_widget.select_systemDiagnostics_item.splice(index, 1);
    }

    this.obj_configuration_setting.selected_datasource = this.obj_datasource_widget;
   
    if (this.obj_configuration_setting.selected_datasource.select_systemDiagnostics_item.length > 0) 
    { 
        this.obj_error.display_SystemDiagnosticsData = false;
    }
    else{
        this.obj_error.display_SystemDiagnosticsData = true;
    }
  
  }
  bindData(){
  
    this.modal_name = this.obj_configuration_setting?.selected_datasource?.viewName??''
    this.obj_datasource_widget =  this.obj_configuration_setting?.selected_datasource??{
      viewName: "",
      select_datasource_item: [],
      select_applicaton_item: [],
      select_systemDiagnostics_item: []
    }
  }
  checkApplication(item){
    return  this.obj_datasource_widget?.select_applicaton_item?.includes(item)
  }
  checkSystem(item){
    let bool = false
  this.obj_datasource_widget?.select_systemDiagnostics_item?.forEach((element) =>{
    if(element.id == item.id)
    {
      bool = true
    }
    
  });
  return bool
  }
}
