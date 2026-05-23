import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { sendError } from '../utils/response';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', err);

  // Handle specific error types
  if (err.code === '23505') {
    sendError(res, 'Duplicate entry', 'Email already exists', StatusCodes.CONFLICT);
    return;
  }

  if (err.code === '23502') {
    sendError(res, 'Missing required field', err.column, StatusCodes.BAD_REQUEST);
    return;
  }

  if (err.code === '22P02') {
    sendError(res, 'Invalid input format', err.message, StatusCodes.BAD_REQUEST);
    return;
  }

  // Default error response
  sendError(
    res,
    'Internal server error',
    process.env.NODE_ENV === 'development' ? err.message : undefined,
    StatusCodes.INTERNAL_SERVER_ERROR
  );
};