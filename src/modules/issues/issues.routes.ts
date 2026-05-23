import { Router } from 'express';
import { issuesController } from './issues.controller';
import { authenticate, requireMaintainer } from '../../middleware/auth';
import { validateCreateIssue, validateUpdateIssue } from '../../middleware/validation';

const router = Router();

// Public routes (no authentication required)
router.get('/', issuesController.getAllIssues);
router.get('/:id', issuesController.getIssueById);

// Protected routes (authentication required)
router.post('/', authenticate, validateCreateIssue, issuesController.createIssue);
router.patch('/:id', authenticate, validateUpdateIssue, issuesController.updateIssue);
router.patch('/:id/status', authenticate, issuesController.updateIssueStatus);
router.delete('/:id', authenticate, requireMaintainer, issuesController.deleteIssue);

export default router;