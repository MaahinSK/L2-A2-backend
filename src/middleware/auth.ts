import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { verifyToken, TokenPayload } from '../utils/jwt';
import { sendError } from '../utils/response';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    sendError(res, 'No token provided', null, StatusCodes.UNAUTHORIZED);
    return;
  }

  const token = authHeader;

  const decoded = verifyToken(token);

  if (!decoded) {
    sendError(res, 'Invalid or expired token', null, StatusCodes.UNAUTHORIZED);
    return;
  }

  req.user = decoded;
  next();
};

export const requireMaintainer = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    sendError(res, 'Authentication required', null, StatusCodes.UNAUTHORIZED);
    return;
  }

  if (req.user.role !== 'maintainer') {
    sendError(
      res,
      'Maintainer access required',
      null,
      StatusCodes.FORBIDDEN
    );
    return;
  }

  next();
};