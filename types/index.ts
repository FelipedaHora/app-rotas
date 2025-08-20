export interface Client {
  id: string;
  name: string;
  phone?: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  createdAt: string;
}

export interface Route {
  id: string;
  name: string;
  daysOfWeek: DayOfWeek[];
  clientOrder: string[];
}

export interface WeeklyStatus {
  weekKey: string;
  attended: {
    [routeId: string]: {
      [clientId: string]: {
        checked: boolean;
        checkedAt: string;
      };
    };
  };
}

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface AppData {
  clients: Client[];
  routes: Route[];
  weeklyStatus: WeeklyStatus;
}