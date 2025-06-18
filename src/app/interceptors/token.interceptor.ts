import { HttpInterceptorFn } from '@angular/common/http';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

     console.log('TokenInterceptor: Request URL:', authReq.url);
  if (token) {
    console.log('TokenInterceptor: Authorization header added:', authReq.headers.get('Authorization'));
  }
  return next(authReq);
};
