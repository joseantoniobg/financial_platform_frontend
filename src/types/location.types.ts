export interface Country {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface State {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  countryId?: string;
  country?: Country;
  createdAt: string;
  updatedAt: string;
}

export interface City {
  id: string;
  name: string;
  isActive: boolean;
  stateId?: string;
  state?: State;
  createdAt: string;
  updatedAt: string;
}
