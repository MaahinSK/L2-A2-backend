import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { issuesService } from './issues.service';
import { sendSuccess, sendError } from '../../utils/response';
import { CreateIssueRequest, UpdateIssueRequest } from '../../types';
import { isValidStatus } from '../../utils/validators';

export const issuesController = {
  async createIssue(req: Request, res: Response): Promise<void> {
    try {
      const issueData: CreateIssueRequest = req.body;
      const reporterId = req.user!.id;

      const issue = await issuesService.createIssue(issueData, reporterId);

      sendSuccess(res, 'Issue created successfully', issue, StatusCodes.CREATED);
    } catch (error: any) {
      sendError(res, 'Failed to create issue', error.message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  async getAllIssues(req: Request, res: Response): Promise<void> {
    try {
      const sort = (req.query.sort as 'newest' | 'oldest') || 'newest';
      const type = req.query.type as string | undefined;
      const status = req.query.status as string | undefined;

      const issues = await issuesService.getAllIssues(sort, type, status);

      sendSuccess(res, 'Issues retrieved successfully', issues);
    } catch (error: any) {
      sendError(res, 'Failed to retrieve issues', error.message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  async getIssueById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        sendError(res, 'Invalid issue ID', null, StatusCodes.BAD_REQUEST);
        return;
      }

      const issue = await issuesService.getIssueById(id);

      if (!issue) {
        sendError(res, 'Issue not found', null, StatusCodes.NOT_FOUND);
        return;
      }

      sendSuccess(res, 'Issue retrieved successfully', issue);
    } catch (error: any) {
      sendError(res, 'Failed to retrieve issue', error.message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  async updateIssue(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const updateData: UpdateIssueRequest = req.body;
      const userId = req.user!.id;
      const userRole = req.user!.role;

      if (isNaN(id)) {
        sendError(res, 'Invalid issue ID', null, StatusCodes.BAD_REQUEST);
        return;
      }

      const updatedIssue = await issuesService.updateIssue(
        id,
        updateData,
        userId,
        userRole
      );

      if (!updatedIssue) {
        sendError(res, 'Issue not found', null, StatusCodes.NOT_FOUND);
        return;
      }

      sendSuccess(res, 'Issue updated successfully', updatedIssue);
    } catch (error: any) {
      if (error.message === 'You do not have permission to update this issue') {
        sendError(res, error.message, null, StatusCodes.FORBIDDEN);
      } else {
        sendError(res, 'Failed to update issue', error.message, StatusCodes.INTERNAL_SERVER_ERROR);
      }
    }
  },

  async updateIssueStatus(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    if (isNaN(id)) {
      sendError(res, 'Invalid issue ID', null, StatusCodes.BAD_REQUEST);
      return;
    }

    if (!status || !isValidStatus(status)) {
      sendError(res, 'Invalid status. Must be open, in_progress, or resolved', null, StatusCodes.BAD_REQUEST);
      return;
    }

    const updatedIssue = await issuesService.updateIssueStatus(id, status, userId, userRole);

    if (!updatedIssue) {
      sendError(res, 'Issue not found', null, StatusCodes.NOT_FOUND);
      return;
    }

    sendSuccess(res, 'Issue status updated successfully', updatedIssue);
  } catch (error: any) {
    if (error.message === 'Only maintainers can change issue status') {
      sendError(res, error.message, null, StatusCodes.FORBIDDEN);
    } else if (error.message === 'You do not have permission to update this issue') {
      sendError(res, error.message, null, StatusCodes.FORBIDDEN);
    } else {
      sendError(res, 'Failed to update issue status', error.message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
},

  async deleteIssue(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const userRole = req.user!.role;

      if (isNaN(id)) {
        sendError(res, 'Invalid issue ID', null, StatusCodes.BAD_REQUEST);
        return;
      }

      const deleted = await issuesService.deleteIssue(id, userRole);

      if (!deleted) {
        sendError(res, 'Issue not found', null, StatusCodes.NOT_FOUND);
        return;
      }

      sendSuccess(res, 'Issue deleted successfully');
    } catch (error: any) {
      if (error.message === 'Only maintainers can delete issues') {
        sendError(res, error.message, null, StatusCodes.FORBIDDEN);
      } else {
        sendError(res, 'Failed to delete issue', error.message, StatusCodes.INTERNAL_SERVER_ERROR);
      }
    }
  },
};