export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate?: string;
  lastLogin?: string;
  preferences?: {
    roomType?: string;
    floorPreference?: string;
    specialNeeds?: string[];
  };
}
