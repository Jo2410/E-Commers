import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  RequestTimeoutException,
} from '@nestjs/common';
import { catchError, Observable, tap, throwError, timeout, TimeoutError } from 'rxjs';

@Injectable()
export class preferredLanguageInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    context.switchToHttp().getRequest().headers['accept-language'] =
      context.switchToHttp().getRequest().credentials.user.preferredLanguage ??
      context.switchToHttp().getRequest().headers['accept-language'];

    return next
      .handle()
      .pipe(
        timeout(10000),
        catchError((err)=>{
            if (err instanceof TimeoutError) {
                return throwError(()=>new RequestTimeoutException())
            }
            return throwError(()=>err);
        }),
        tap(() => console.log(`Done`))
    );
  }
}
