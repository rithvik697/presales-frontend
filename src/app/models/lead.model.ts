export interface Lead {
  id?: string;
  name: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  phone: string;
  alternatePhone?: string;
  email?: string;
  project?: string;
  projectId?: string; 
  source?: string;
  sourceId?: string;
  profession?: string;
  description?: string;
  firstContacted?: string;
  originallyCreatedBy?: string;
  firstAssignedTo?: string;
  currentAssignedTo?: string;
  assignedTo?: string;
  assignedToId?: string;
  statusId?: string;
  status?: string;
  createdAt?: string;
  createdBy?: string;     
  modifiedAt?: string;    
  modifiedBy?: string;  
}
