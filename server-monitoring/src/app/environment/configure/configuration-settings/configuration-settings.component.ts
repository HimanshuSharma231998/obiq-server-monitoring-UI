import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AppDataService } from 'src/app/services/app-data.service';


@Component({
  selector: 'app-configuration-settings',
  templateUrl: './configuration-settings.component.html',
  styleUrl: './configuration-settings.component.scss'
})
export class ConfigurationSettingsComponent {

  constructor( 
    public activeModal: NgbActiveModal,
    private router: Router,
    private route: ActivatedRoute,
    private service_data: AppDataService
  ) {}
  close_model() {
    this.activeModal.dismiss('close modal');
  }


  obj_configuration_setting = {
    tab: "datasource",
    is_inner_tab: false,
    title: "Add View",
    viewName:"",
    selected_datasource: [],
    selected_erp_analytics: [],
    selected_system_diagnostics: [],
    ErpAnalytics:{},
    SystemDiagnostics:{},
    active_dataSource_widjets:[]
  }
  error_obj={
    ViewNameFlag : false,
    DataSourceFlag :false,
    ErpApplication:false,
    SystemDiagnosticsData:false,
  }

  revert_Error_Flags(){
    this.error_obj.ViewNameFlag = false;
    this.error_obj.DataSourceFlag = false;
    this.error_obj.ErpApplication = false;
    this.error_obj.SystemDiagnosticsData = false;
  }
  ValidationCheck(): boolean {
  debugger;
  this.revert_Error_Flags()
  const allWidgets = this.obj_configuration_setting.active_dataSource_widjets;
  const selectedDataSource: any = this.obj_configuration_setting.selected_datasource;
  if(this.obj_configuration_setting.viewName == ""){
    this.error_obj.ViewNameFlag = true
   return false;
  }
  else if (Array.isArray(allWidgets) && allWidgets.length == 0) {
    this.error_obj.DataSourceFlag = true
    return false
  } 
  else if (Array.isArray(this.obj_configuration_setting.selected_datasource)) {
    this.error_obj.ErpApplication = true
    return false;
  }
  else if (typeof selectedDataSource === 'object' && this.obj_configuration_setting.selected_datasource !== null) {
    for (const key in selectedDataSource) {
      if (selectedDataSource.hasOwnProperty(key)) {
        const dataSource = selectedDataSource[key];
    
        if (dataSource) {
          // Check kr rhe  'ERP Analytics' aur 'SystemDiagnostics' properties ke liye
          const hasErpAnalytics = dataSource.hasOwnProperty('ERP Analytics');
          const hasSystemDiagnostics = dataSource.hasOwnProperty('SystemDiagnostics');

          // if (!hasErpAnalytics ) { // hiiden as i dont have data for now && !hasSystemDiagnostics
            
          // } 
          if (!hasErpAnalytics) {
            this.error_obj.ErpApplication = true
            return false;
          }
          //  else if (!hasSystemDiagnostics) {
          //   alert("'SystemDiagnostics' nhi hai.");
          // }
  
        } 
      }
    }
  }
  return true;
}
  next() {
    debugger;
    if (!this.ValidationCheck()) {
      return; 
    }
    if (this.obj_configuration_setting.tab == "datasource") { 
      this.obj_configuration_setting.tab = "ERP_Analytics";
      this.obj_configuration_setting.title = "Add ERP Analytics";
      this.obj_configuration_setting.is_inner_tab = true;
    }
    else if (this.obj_configuration_setting.tab == "ERP_Analytics") { 
      this.obj_configuration_setting.tab = "system_diagnostics";
      this.obj_configuration_setting.title = "Add System Diagnostics";
      this.obj_configuration_setting.is_inner_tab = true;
    }
    else if (this.obj_configuration_setting.tab == "system_diagnostics") { 
      this.obj_configuration_setting.tab = "view_summary";
      this.obj_configuration_setting.title = "Create View";
      this.obj_configuration_setting.is_inner_tab = false;
    }
    else if (this.obj_configuration_setting.tab == "view_summary") { 
      this.obj_configuration_setting.is_inner_tab = false;
      alert("error"); 
      
    }

  }

  back() {
    debugger;
    if (this.obj_configuration_setting.tab == "view_summary") { 
      this.obj_configuration_setting.tab = "system_diagnostics";
      this.obj_configuration_setting.title = "Add System Diagnostics";
      this.obj_configuration_setting.is_inner_tab = true;
    }
    else if (this.obj_configuration_setting.tab == "system_diagnostics") { 
      this.obj_configuration_setting.tab = "ERP_Analytics"; 
      this.obj_configuration_setting.title = "Add ERP Analytics";
      this.obj_configuration_setting.is_inner_tab = true;
    }
    else if (this.obj_configuration_setting.tab == "ERP_Analytics") { 
      this.obj_configuration_setting.tab = "datasource"; 
      this.obj_configuration_setting.title = "Create View";
      this.obj_configuration_setting.is_inner_tab = false;
    }
    else if (this.obj_configuration_setting.tab == "datasource") { 
      this.obj_configuration_setting.is_inner_tab = false;
      alert("error");
    }

  }

  finish() {
    debugger;
    this.service_data.is_env_configure = true;
    this.close_model();
    this.router.navigate(['/environment']);
  }

}
