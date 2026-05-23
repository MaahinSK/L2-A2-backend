import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export const sendSuccess = <T>(
  res: Response,
  message: string,
  data?: T,
  statusCode: number = StatusCodes.OK
): Response => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (
  res: Response,
  message: string,
  errors?: any,
  statusCode: number = StatusCodes.BAD_REQUEST
): Response => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};