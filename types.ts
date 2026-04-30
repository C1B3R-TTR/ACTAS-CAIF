export interface LoanFormData {
  applicantName: string;
  applicantArea: string;
  delivererName: string;
  hardwareItems: string;
  applicantEmail: string;
}

export interface CertificateData extends LoanFormData {
  id?: number;
  agreementText: string;
  folioNumber: string;
  date: Date;
}

export interface ImportedContact {
  id?: number;
  name: string;
  email: string;
}
