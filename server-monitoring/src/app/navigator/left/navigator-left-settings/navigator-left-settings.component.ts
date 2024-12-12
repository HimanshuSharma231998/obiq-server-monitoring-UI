import { Component, Input, OnInit ,output} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfigurationSettingsComponent } from 'src/app/environment/configure/configuration-settings/configuration-settings.component';
import { AppDataService } from 'src/app/services/app-data.service';
import { AppService } from 'src/app/services/app.service';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-navigator-left-settings',
  templateUrl: './navigator-left-settings.component.html',
  styleUrl: './navigator-left-settings.component.scss'
})
export class NavigatorLeftSettingsComponent implements OnInit  {
  constructor(
    private modalService: NgbModal,
    private router: Router,
    private route: ActivatedRoute,
    private service_data: AppDataService,
    public app_service:AppService,
    public dataService:AppDataService


  ) { }
  ngOnInit(): void {
    
  }
  add_environment() {
    const modalRef = this.modalService.open( ConfigurationSettingsComponent,{
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
      else if(response == 'create_environment')
      this.select_service_data();
    });
  }
  select_service_data() {
    this.service_data.is_env_configure = true;
    this.router.navigate(['/environment']);
  }
  totalViews:any = []
  isopenSettings:boolean = false
  tempTotalViews:any = []
  @Input('child_data') set child_data({ totalViews,isopenSettings,selectedViewSettings }) {
    this.totalViews = [...totalViews]
    this.tempTotalViews = JSON.parse(JSON.stringify(totalViews))
    this.isopenSettings = isopenSettings
    this.selectedViewSettings = selectedViewSettings
    
  }
  selectedViewSettings:any = {}
  onSettingsSelected = output<any>()
  onViewDelete = output<any>()

  settingsViewSelect(val){

    this.selectedViewSettings = val
    this.onSettingsSelected.emit({isOpen:this.isopenSettings,selectedViewSettings:this.selectedViewSettings})

  }
  renameSelectedView(view){
    view['isRenamed'] = true
      setTimeout(() => {
        let ele = document.getElementById('renameInput')
        ele.focus()
      }, 0);
  
  }
  deleteSelectedView(view){
    this.onViewDelete.emit(view)

  }
  renameView(view){
    debugger;
    
   
    let form_url = environment.BASE_OBIQ_SERVER_URL + "OpkeyObiqServerApi/OpkeyTraceIAAnalyticsApi/TelemetryViewController/renameView";

    let form_data = { viewId: view.viewId,viewName:view.viewName,projectId:this.service_data.UserDto.ProjectDTO.P_ID,userId:this.service_data.UserDto.UserDTO.U_ID };

    this.app_service.make_post_server_call(form_url, form_data)
      .subscribe({
        next: (result: any) => {
          delete view['isRenamed']
         

        },
        error: (error: any) => {
          delete view['isRenamed']
        }
      });
  }

  starView(view){
    view['isStarred'] = true
    this.totalViews.forEach((item,index)=>{
      if(view.viewId == item.viewId){
        this.totalViews.splice(0,0,this.totalViews.splice(index, 1)[0])
      }
  })
  }
  unStarView(view){
   delete view['isStarred']
   this.totalViews.forEach((item,index)=>{
     if(view.viewId == item.viewId){
      let newInd = this.tempTotalViews.findIndex(ele=> ele.viewId == view.viewId) 
      this.totalViews.splice(newInd,0,this.totalViews.splice(index, 1)[0])
    }
})
  }
}
