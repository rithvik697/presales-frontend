import { Injectable } from '@angular/core';
import {
    HttpInterceptor,
    HttpRequest,
    HttpHandler,
    HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Automatically attaches the JWT access_token to every outgoing HTTP request
 * as an Authorization: Bearer <token> header.
 *
 * This means no individual service or component needs to handle auth headers,
 * and no user identity information ever needs to be hardcoded or sent
 * manually from the frontend.
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const token = localStorage.getItem('access_token');

        if (token) {
            const authReq = req.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`
                }
            });
            return next.handle(authReq);
        }

        return next.handle(req);
    }
}
