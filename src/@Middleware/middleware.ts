import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private request: { reqTime: Date; req: string };
  constructor() {}

  use(req: any, res: any, next: (error?: Error | any) => void) {
    try {
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token!' });
    }
  }
}
