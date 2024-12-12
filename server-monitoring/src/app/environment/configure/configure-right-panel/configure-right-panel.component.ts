import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AppDataService } from 'src/app/services/app-data.service';
import { AppService } from 'src/app/services/app.service';
import { environment } from 'src/environments/environment';
 
import { NotificationsService } from 'src/app/services/notification-service/notifications.service';
import { NotificationType } from 'src/app/global/enums';

@Component({
  selector: 'app-configure-right-panel',
  templateUrl: './configure-right-panel.component.html',
  styleUrl: './configure-right-panel.component.scss'
})
export class ConfigureRightPanelComponent {

  constructor(
    public dataService: AppDataService,
    public app_service: AppService,
    private activeModal: NgbActiveModal,
     
    public service_notification : NotificationsService
  ) { }
  @Input() selectedItem: any;
  Public_dropdown_Items = ['Can View', 'Can Edit'];
  selectedValue = 'Can View';
  shared_selected_value = 'Can View';
  showSharedInput: boolean = false;
  filteredUsers: any[] = [];
  addedUsers: any[] = [];
  searchQuery: string = '';
  users: any[] = [];
  addedEmails: string[] = [];
  accessTypeObj = {
    AccessType: "PRIVATE",
    AccessPermisions: {
      "VIEW": true,
      "EDIT": false
    }
  };
  Shared_Access_Type_Obj: { U_ID: string, permission: string }[] = [];
  isDisabled:boolean=true
  
  inviteType:string='Done'
  selectAccessType(type: string): void {
    if(type=='SHARED')  this.inviteType='Invite'
    else   this.inviteType='Done'
    if(this.dataService.changedAccessType==type)this.isDisabled=true
    else this.isDisabled=false
    if(this.dataService.changedAccessType=='SHARED' && this.addedUsers.length>0){
      this.inviteType='Invite'
      
    }
    this.showSharedInput = false;
    this.accessTypeObj.AccessType = type;
    this.Shared_Access_Type_Obj = [];
    if (type == "PUBLIC") {
      this.accessTypeObj = {
        AccessType: "PUBLIC",
        AccessPermisions: {
          "VIEW": true,
          "EDIT": false
        }
      };
      this.addedUsers = []
    }
    else if (type == "PRIVATE") {
      this.accessTypeObj = {
        AccessType: "PRIVATE",
        AccessPermisions: {
          "VIEW": true,
          "EDIT": false
        }
      };
      this.addedUsers = [];
    }

    else if (type == "SHARED") {
      this.showSharedInput = true;
      this.Shared_Access_Type_Obj["AccessType"] = type;
      this.perform_Shared_Access_Operation();
    }

  }
  addEmailToTempList(): void {
    if (this.searchQuery.trim()) {
        this.addedEmails.push(this.searchQuery.trim());
        this.searchQuery = ''; 
    }
}
removeTempEmail(email: string): void {
  this.addedEmails = this.addedEmails.filter(e => e !== email);
}


selectViewOrEdit(option: string): void {
 
    event.preventDefault();
    event.stopPropagation();

    if (option == "Can View") {
      this.accessTypeObj.AccessPermisions.EDIT = false;
    }
    else if (option == "Can Edit") {
      this.accessTypeObj.AccessPermisions.VIEW = true
      this.accessTypeObj.AccessPermisions.EDIT = true
    }

  }
  deleteUser(index: number): void {
    this.addedUsers.splice(index, 1);
}
  getAllProjects() {
   

    let form_url = environment.BASE_OPKEY_URL + "Profile/GetAssignedUsersInProject";

    let form_data = { P_ID: this.dataService.UserDto.ProjectDTO.P_ID };

    this.app_service.make_get_server_call(form_url, form_data)
      .subscribe({

        next: (result: any) => {
          // this.showSharedInput = true
          // this.Show_Project_Access = true
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


  perform_Shared_Access_Operation(): void {
 

  }

  ngOnInit(): void {

    this.getAllProjects();
  
    if(this.selectedItem?.AccessType){
      
      let obj = {
        AccessType: this.selectedItem?.AccessType,
        AccessPermisions: this.selectedItem?.AccessPermisions
      }
      this.accessTypeObj = obj
    }
    else  if(this.selectedItem?.selected_view?.accessType){
      
      let obj = {
        AccessType: this.selectedItem?.selected_view?.accessType,
        AccessPermisions: this.selectedItem?.AccessPermisions
      }
      this.accessTypeObj = obj
    }
  }
  toggleSharedPermission(dataItem) {
    
  }
  filterUsers(query: string) {
    if (!query) {
        this.filteredUsers = [];
        return;
    }
    this.filteredUsers = this.users.filter(user =>
        user.Name.toLowerCase().includes(query.toLowerCase()) ||
        user.email_ID.toLowerCase().includes(query.toLowerCase())
    );
}
selectUser(user: any) {
  // Add email to the list if not already added
  if (!this.addedEmails.includes(user.email_ID)) {
      this.addedEmails.push(user.email_ID);
  }
  this.searchQuery = '';
  this.filteredUsers = [];
}
  addAllEmailsToGrid(): void {
    this.addedEmails.forEach(email => {
        const userToAdd = this.users.find(user =>
            user.email_ID.toLowerCase() === email.toLowerCase() ||
            user.UserName.toLowerCase() === email.toLowerCase()
        );

        if (userToAdd && !this.addedUsers.some(u => u.U_ID === userToAdd.U_ID)) {
            this.addedUsers.push(userToAdd);
            this.Shared_Access_Type_Obj.push({
                U_ID: userToAdd.U_ID,
                permission: 'VIEW'
            });
        }

    });
    this.isDisabled=false
    this.addedEmails = []; // Clear the temporary list after processing
}
  removeUser(user: any): void {
 
    this.addedUsers = this.addedUsers.filter(u => u.U_ID !== user.U_ID);
  }
  updateUserPermission(user: any, selectedPermission: string): void {
   
    selectedPermission = selectedPermission === 'Can Edit' ? 'ALL' : (selectedPermission === 'Can View' ? 'VIEW' : selectedPermission);
    const userIndex = this.addedUsers.findIndex(u => u.U_ID === user.U_ID);
    if (userIndex !== -1) {
      this.addedUsers[userIndex].permission = selectedPermission;
    }
    const sharedUserIndex = this.Shared_Access_Type_Obj.findIndex(obj => obj.U_ID === user.U_ID);
    if (sharedUserIndex !== -1) {
      this.Shared_Access_Type_Obj[sharedUserIndex].permission = selectedPermission;
    }
    console.log(this.Shared_Access_Type_Obj, 'Updated Shared_Access_Type_Obj');
  }

  InviteUsers() {
   
    let finalAccessObj;

    if (this.Shared_Access_Type_Obj.length === 0) {
      if(this.accessTypeObj.AccessType == "SHARED"){
        this.service_notification.notifier(NotificationType.error, 'Please select At least one person to share.');
        return
      }

      finalAccessObj = this.accessTypeObj;
    } else {

      finalAccessObj = this.Shared_Access_Type_Obj;
    }
    this.app_service.dataTransmitter(finalAccessObj);
    this.close_model()
    this.dataService.isEnablePersister = true
     this.dataService.changedAccessType=finalAccessObj.AccessType
     console.log("this===================",this.dataService.changedAccessType)
   if(this.inviteType=='Invite') this.service_notification.notifier(NotificationType.success, 'Invite sent successfully');
   else if(this.inviteType=='Done'&& !this.isDisabled) this.service_notification.notifier(NotificationType.success, 'Access type selected ');
  }
  close_model() {
    this.activeModal.dismiss('close modal');
  }

  close_right_panel() {
    this.activeModal.dismiss('close modal');
  }
  
}
