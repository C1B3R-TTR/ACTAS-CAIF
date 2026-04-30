import Dexie, { type Table } from 'dexie';
import type { ImportedContact, CertificateData } from '../types';

export const db = new Dexie('db_prestamos') as Dexie & {
  contacts: Table<ImportedContact>;
  certificates: Table<CertificateData>;
};

// Define the database schema.
db.version(2).stores({
  contacts: '++id, &email, name',
  certificates: '++id, folioNumber, applicantName, date'
});
