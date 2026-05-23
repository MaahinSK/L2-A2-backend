import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { authService } from './auth.service';
import { sendSuccess, sendError } from '../../utils/response';
import { SignupRequest, LoginRequest } from '../../types';

export const authController = {
  async signup(req: Request, res: Response): Promise<void> {
    try {
      const userData: SignupRequest = req.body;
      const user = await authService.signup(userData);

      sendSuccess(
        res,
        'User registered successfully',
        user,
        StatusCodes.CREATED
      );
    } catch (error: any) {
      if (error.message === 'Email already registered') {
        sendError(res, error.message, null, StatusCodes.CONFLICT);
      } else {
        sendError(
          res,
          'Registration failed',
          error.message,
          StatusCodes.INTERNAL_SERVER_ERROR
        );
      }
    }
  },

  async login(req: Request, res: Response): Promise<void> {
    try {
      const credentials: LoginRequest = req.body;
      const { token, user } = await authService.login(credentials);

      sendSuccess(res, 'Login successful', { token, user });
    } catch (error: any) {
      if (error.message === 'Invalid email or password') {
        sendError(res, error.message, null, StatusCodes.UNAUTHORIZED);
      } else {
        sendError(
          res,
          'Login failed',
          error.message,
          StatusCodes.INTERNAL_SERVER_ERROR
        );
      }
    }
  },
};