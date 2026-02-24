export interface Lead {
  id?: string | number;
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
  profession?: string;
  description?: string;
  assignedTo?: string;
  status?: string;
  createdAt?: string;
  createdBy?: string;
  modifiedAt?: string;
  modifiedBy?: string;
}
