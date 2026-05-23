import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { sendError } from '../utils/response';
import {
  validateName,
  validateEmail,
  validatePassword,
  validateTitle,
  validateDescription,
  isValidIssueType,
  isValidRole,
} from '../utils/validators';

export const validateSignup = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { name, email, password, role } = req.body;

  const errors: string[] = [];

  if (!name || !validateName(name)) {
    errors.push('Name is required and must be at least 2 characters');
  }

  if (!email || !validateEmail(email)) {
    errors.push('Valid email is required');
  }

  if (!password || !validatePassword(password)) {
    errors.push('Password is required and must be at least 6 characters');
  }

  if (role && !isValidRole(role)) {
    errors.push('Role must be either contributor or maintainer');
  }

  if (errors.length > 0) {
    sendError(res, 'Validation failed', errors, StatusCodes.BAD_REQUEST);
    return;
  }

  next();
};

export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { email, password } = req.body;

  const errors: string[] = [];

  if (!email || !validateEmail(email)) {
    errors.push('Valid email is required');
  }

  if (!password) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    sendError(res, 'Validation failed', errors, StatusCodes.BAD_REQUEST);
    return;
  }

  next();
};

export const validateCreateIssue = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { title, description, type } = req.body;

  const errors: string[] = [];

  if (!title || !validateTitle(title)) {
    errors.push('Title is required and must be maximum 150 characters');
  }

  if (!description || !validateDescription(description)) {
    errors.push('Description is required and must be at least 20 characters');
  }

  if (!type || !isValidIssueType(type)) {
    errors.push('Type must be either bug or feature_request');
  }

  if (errors.length > 0) {
    sendError(res, 'Validation failed', errors, StatusCodes.BAD_REQUEST);
    return;
  }

  next();
};

export const validateUpdateIssue = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { title, description, type } = req.body;

  const errors: string[] = [];

  if (title && !validateTitle(title)) {
    errors.push('Title must be maximum 150 characters');
  }

  if (description && !validateDescription(description)) {
    errors.push('Description must be at least 20 characters');
  }

  if (type && !isValidIssueType(type)) {
    errors.push('Type must be either bug or feature_request');
  }

  if (errors.length > 0) {
    sendError(res, 'Validation failed', errors, StatusCodes.BAD_REQUEST);
    return;
  }

  next();
};