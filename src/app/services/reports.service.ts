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

    private buildParams(startDate?: string, endDate?: string, projectId?: string, userId?: string, sourceId?: string, statusId?: string): HttpParams {
        let params = new HttpParams();
        if (startDate) params = params.set('startDate', startDate);
        if (endDate) params = params.set('endDate', endDate);
        if (projectId) params = params.set('projectId', projectId);
        if (userId) params = params.set('userId', userId);
        if (sourceId) params = params.set('sourceId', sourceId);
        if (statusId) params = params.set('statusId', statusId);
        return params;
    }

    getSummary(startDate?: string, endDate?: string, projectId?: string, userId?: string, sourceId?: string, statusId?: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/summary`, { params: this.buildParams(startDate, endDate, projectId, userId, sourceId, statusId) });
    }

    getWeeklyReport(startDate?: string, endDate?: string, projectId?: string, userId?: string, sourceId?: string, statusId?: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/weekly`, { params: this.buildParams(startDate, endDate, projectId, userId, sourceId, statusId) });
    }

    getMonthlyReport(startDate?: string, endDate?: string, projectId?: string, userId?: string, sourceId?: string, statusId?: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/monthly`, { params: this.buildParams(startDate, endDate, projectId, userId, sourceId, statusId) });
    }

    getAnnualReport(startDate?: string, endDate?: string, projectId?: string, userId?: string, sourceId?: string, statusId?: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/annual`, { params: this.buildParams(startDate, endDate, projectId, userId, sourceId, statusId) });
    }

    getStatusDistribution(startDate?: string, endDate?: string, projectId?: string, userId?: string, sourceId?: string, statusId?: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/status`, { params: this.buildParams(startDate, endDate, projectId, userId, sourceId, statusId) });
    }

    getUserPerformance(startDate?: string, endDate?: string, projectId?: string, userId?: string, sourceId?: string, statusId?: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/user-performance`, { params: this.buildParams(startDate, endDate, projectId, userId, sourceId, statusId) });
    }

    getDailyLog(projectId?: string, userId?: string, sourceId?: string, statusId?: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/daily-log`, { params: this.buildParams(undefined, undefined, projectId, userId, sourceId, statusId) });
    }

    downloadActiveLeads() {
        return this.http.get(`${this.apiUrl}/download`, { responseType: 'blob' });
    }

    getActiveLeadsJson(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/active-leads-json`);
    }

    downloadUserLeads(empId: string, userName: string, activity: string, startDate?: string, endDate?: string, projectId?: string, sourceId?: string, statusId?: string): Observable<Blob> {
        let params = new HttpParams()
            .set('emp_id', empId)
            .set('user_name', userName)
            .set('activity', activity);

        if (startDate) params = params.set('startDate', startDate);
        if (endDate) params = params.set('endDate', endDate);
        if (projectId) params = params.set('projectId', projectId);
        if (sourceId) params = params.set('sourceId', sourceId);
        if (statusId) params = params.set('statusId', statusId);

        return this.http.get(`${this.apiUrl}/user-leads-export`, { params, responseType: 'blob' });
    }

    getUserLeadsJson(empId: string, userName: string, activity: string, startDate?: string, endDate?: string, projectId?: string, sourceId?: string, statusId?: string): Observable<any> {
        let params = new HttpParams()
            .set('emp_id', empId)
            .set('user_name', userName)
            .set('activity', activity);

        if (startDate) params = params.set('startDate', startDate);
        if (endDate) params = params.set('endDate', endDate);
        if (projectId) params = params.set('projectId', projectId);
        if (sourceId) params = params.set('sourceId', sourceId);
        if (statusId) params = params.set('statusId', statusId);

        return this.http.get<any>(`${this.apiUrl}/user-leads-export-json`, { params });
    }

    getSummaryLeads(type: string, startDate?: string, endDate?: string, projectId?: string, userId?: string, sourceId?: string, statusId?: string): Observable<any> {
        let params = new HttpParams().set('type', type);
        if (startDate) params = params.set('startDate', startDate);
        if (endDate) params = params.set('endDate', endDate);
        if (projectId) params = params.set('projectId', projectId);
        if (userId) params = params.set('userId', userId);
        if (sourceId) params = params.set('sourceId', sourceId);
        if (statusId) params = params.set('statusId', statusId);
        
        return this.http.get<any>(`${this.apiUrl}/summary-leads`, { params });
    }

    getWeeklyLog(startDate?: string, endDate?: string, projectId?: string, userId?: string, sourceId?: string, statusId?: string): Observable<any> {
        let params = new HttpParams();
        if (startDate) params = params.set('startDate', startDate);
        if (endDate) params = params.set('endDate', endDate);
        if (projectId) params = params.set('projectId', projectId);
        if (userId) params = params.set('userId', userId);
        if (sourceId) params = params.set('sourceId', sourceId);
        if (statusId) params = params.set('statusId', statusId);
        return this.http.get<any>(`${this.apiUrl}/weekly-log`, { params });
    }

    getMonthlyPerformanceReport(month?: number, year?: number, projectId?: string): Observable<any> {
        let params = new HttpParams();
        if (month) params = params.set('month', month.toString());
        if (year) params = params.set('year', year.toString());
        if (projectId) params = params.set('projectId', projectId);
        return this.http.get<any>(`${this.apiUrl}/monthly-performance-report`, { params });
    }

    getWeeklyPerformanceReport(projectId?: string): Observable<any> {
        let params = new HttpParams();
        if (projectId) params = params.set('projectId', projectId);
        return this.http.get<any>(`${this.apiUrl}/weekly-performance-report`, { params });
    }

    getAnnualPerformanceReport(year?: number, projectId?: string): Observable<any> {
        let params = new HttpParams();
        if (year) params = params.set('year', year.toString());
        if (projectId) params = params.set('projectId', projectId);
        return this.http.get<any>(`${this.apiUrl}/annual-performance-report`, { params });
    }

    getDailyReport(projectId?: string, userId?: string, sourceId?: string, statusId?: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/daily`, { params: this.buildParams(undefined, undefined, projectId, userId, sourceId, statusId) });
    }

    getMonthlyLog(month?: number, year?: number, projectId?: string, userId?: string, sourceId?: string, statusId?: string): Observable<any> {
        let params = this.buildParams(undefined, undefined, projectId, userId, sourceId, statusId);
        if (month) params = params.set('month', month.toString());
        if (year) params = params.set('year', year.toString());
        return this.http.get<any>(`${this.apiUrl}/monthly-log`, { params });
    }

    getHistoryReport(type: 'site_visit' | 'deal_closed', startDate?: string, endDate?: string, projectId?: string, userId?: string): Observable<any> {
        let params = new HttpParams().set('type', type);
        if (startDate) params = params.set('startDate', startDate);
        if (endDate) params = params.set('endDate', endDate);
        if (projectId) params = params.set('projectId', projectId);
        if (userId) params = params.set('userId', userId);
        return this.http.get<any>(`${this.apiUrl}/history-report`, { params });
    }
}
