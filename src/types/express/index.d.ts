import { JwtPayload } from 'src/module/auth/strategy/jwt.strategy';

declare global {
  namespace Express {
    interface User extends JwtPayload {}

    interface Request {
      user?: User;
      rawBody?: Buffer; // ✅ needed for Stripe webhook verification
    }
  }
}
