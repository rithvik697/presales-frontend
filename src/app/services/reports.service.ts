import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ReportsService {

    private apiUrl = environment.apiUrl + '/reports';

    constructor(private http: HttpClient) { }

    private buildParams(startDate?: string, endDate?: string, projectId?: string, userId?: string): HttpParams {
        let params = new HttpParams();
        if (startDate) params = params.set('startDate', startDate);
        if (endDate) params = params.set('endDate', endDate);
        if (projectId) params = params.set('projectId', projectId);
        if (userId) params = params.set('userId', userId);
        return params;
    }

    getSummary(startDate?: string, endDate?: string, projectId?: string, userId?: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/summary`, { params: this.buildParams(startDate, endDate, projectId, userId) });
    }

    getWeeklyReport(startDate?: string, endDate?: string, projectId?: string, userId?: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/weekly`, { params: this.buildParams(startDate, endDate, projectId, userId) });
    }

    getMonthlyReport(startDate?: string, endDate?: string, projectId?: string, userId?: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/monthly`, { params: this.buildParams(startDate, endDate, projectId, userId) });
    }

    getAnnualReport(startDate?: string, endDate?: string, projectId?: string, userId?: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/annual`, { params: this.buildParams(startDate, endDate, projectId, userId) });
    }

    getStatusDistribution(startDate?: string, endDate?: string, projectId?: string, userId?: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/status`, { params: this.buildParams(startDate, endDate, projectId, userId) });
    }

    getUserPerformance(startDate?: string, endDate?: string, projectId?: string, userId?: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/user-performance`, { params: this.buildParams(startDate, endDate, projectId, userId) });
    }

    getDailyLog(projectId?: string, userId?: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/daily-log`, { params: this.buildParams(undefined, undefined, projectId, userId) });
    }

    downloadActiveLeads() {
        return this.http.get(`${this.apiUrl}/download`, { responseType: 'blob' });
    }
}
