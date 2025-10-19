import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

export interface WeatherNow {
  temperatureC: number;
  description: string;
  icon: string;
}

@Injectable({ providedIn: 'root' })
export class WeatherService {
  constructor(private http: HttpClient) {}

  getNowByLatLon(lat: number, lon: number): Observable<WeatherNow> {
    const url = 'https://api.open-meteo.com/v1/forecast'
      + `?latitude=${lat}&longitude=${lon}`
      + `&current=temperature_2m,weather_code`
      + `&timezone=auto`;
    return this.http.get<any>(url).pipe(
      map(data => {
        const t = data?.current?.temperature_2m ?? null;
        const code = data?.current?.weather_code ?? null;
        const { label, icon } = this.mapWmoCode(code);
        return {
          temperatureC: t,
          description: label,
          icon
        } as WeatherNow;
      })
    );
  }

  private mapWmoCode(code: number | null) {
    const c = Number(code);
    const table: Record<number, {label: string, icon: string}> = {
      0:  { label: 'Clear sky',        icon: 'sunny' },
      1:  { label: 'Mainly clear',     icon: 'sunny' },
      2:  { label: 'Partly cloudy',    icon: 'partly' },
      3:  { label: 'Overcast',         icon: 'cloudy' },
      45: { label: 'Fog',              icon: 'fog' },
      48: { label: 'Depositing rime',  icon: 'fog' },
      51: { label: 'Light drizzle',    icon: 'drizzle' },
      53: { label: 'Drizzle',          icon: 'drizzle' },
      55: { label: 'Heavy drizzle',    icon: 'drizzle' },
      61: { label: 'Light rain',       icon: 'rain' },
      63: { label: 'Rain',             icon: 'rain' },
      65: { label: 'Heavy rain',       icon: 'rain' },
      71: { label: 'Light snow',       icon: 'snow' },
      73: { label: 'Snow',             icon: 'snow' },
      75: { label: 'Heavy snow',       icon: 'snow' },
      80: { label: 'Rain showers',     icon: 'rain' },
      81: { label: 'Heavy showers',    icon: 'rain' },
      82: { label: 'Violent showers',  icon: 'rain' },
      95: { label: 'Thunderstorm',     icon: 'storm' },
      96: { label: 'Storm w/ hail',    icon: 'storm' },
      99: { label: 'Storm w/ hail',    icon: 'storm' },
    };
    return table[c] ?? { label: 'Unknown', icon: 'na' };
  }
}
