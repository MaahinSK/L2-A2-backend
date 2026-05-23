import { query } from '../../config/database';
import { CreateIssueRequest, UpdateIssueRequest, Issue, IssueWithReporter, ReporterInfo } from '../../types';

export const issuesService = {
  async createIssue(
    issueData: CreateIssueRequest,
    reporterId: number
  ): Promise<Issue> {
    const { title, description, type } = issueData;

    const result = await query(
      `INSERT INTO issues (title, description, type, reporter_id) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, title, description, type, status, reporter_id, created_at, updated_at`,
      [title, description, type, reporterId]
    );

    return result.rows[0];
  },

  async getAllIssues(
    sort: 'newest' | 'oldest' = 'newest',
    type?: string,
    status?: string
  ): Promise<IssueWithReporter[]> {
    let sql = 'SELECT * FROM issues';
    const params: any[] = [];
    const conditions: string[] = [];

    if (type) {
      conditions.push(`type = $${params.length + 1}`);
      params.push(type);
    }

    if (status) {
      conditions.push(`status = $${params.length + 1}`);
      params.push(status);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    const orderBy = sort === 'newest' ? 'created_at DESC' : 'created_at ASC';
    sql += ` ORDER BY ${orderBy}`;

    const issuesResult = await query(sql, params);
    const issues = issuesResult.rows;

    // Get unique reporter IDs
    const reporterIds = [...new Set(issues.map((issue: Issue) => issue.reporter_id))];

    if (reporterIds.length === 0) {
      return [];
    }

    // Fetch all reporters in a separate query (no JOIN)
    const reportersResult = await query(
      `SELECT id, name, role FROM users WHERE id = ANY($1)`,
      [reporterIds]
    );

    const reportersMap = new Map<number, ReporterInfo>();
    reportersResult.rows.forEach((reporter: ReporterInfo) => {
      reportersMap.set(reporter.id, reporter);
    });

    // Combine issues with reporter data
    const issuesWithReporter: IssueWithReporter[] = issues.map((issue: Issue) => {
      const reporter = reportersMap.get(issue.reporter_id);
      return {
        ...issue,
        reporter: reporter || { id: issue.reporter_id, name: 'Unknown', role: 'unknown' },
      };
    });

    return issuesWithReporter;
  },

  async getIssueById(id: number): Promise<IssueWithReporter | null> {
    const issueResult = await query('SELECT * FROM issues WHERE id = $1', [id]);

    if (issueResult.rows.length === 0) {
      return null;
    }

    const issue = issueResult.rows[0];

    const reporterResult = await query(
      'SELECT id, name, role FROM users WHERE id = $1',
      [issue.reporter_id]
    );

    const reporter = reporterResult.rows[0] || { id: issue.reporter_id, name: 'Unknown', role: 'unknown' };

    return {
      ...issue,
      reporter,
    };
  },

  async updateIssue(
    id: number,
    updateData: UpdateIssueRequest,
    userId: number,
    userRole: string,
    _currentStatus?: string
  ): Promise<IssueWithReporter | null> {
    // First check if issue exists and get reporter_id
    const issueCheck = await query('SELECT reporter_id, status FROM issues WHERE id = $1', [id]);

    if (issueCheck.rows.length === 0) {
      return null;
    }

    const issue = issueCheck.rows[0];

    // Check permissions
    const isMaintainer = userRole === 'maintainer';
    const isOwner = issue.reporter_id === userId;
    const isOpen = issue.status === 'open';

    if (!isMaintainer && !(isOwner && isOpen)) {
      throw new Error('You do not have permission to update this issue');
    }

    // Build dynamic update query
    const updates: string[] = [];
    const params: any[] = [];
    let paramCounter = 1;

    if (updateData.title !== undefined) {
      updates.push(`title = $${paramCounter++}`);
      params.push(updateData.title);
    }

    if (updateData.description !== undefined) {
      updates.push(`description = $${paramCounter++}`);
      params.push(updateData.description);
    }

    if (updateData.type !== undefined) {
      updates.push(`type = $${paramCounter++}`);
      params.push(updateData.type);
    }

    if (updates.length === 0) {
      // Return current issue if no updates
      return this.getIssueById(id);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);

    const updateQuery = `
      UPDATE issues 
      SET ${updates.join(', ')} 
      WHERE id = $${paramCounter}
      RETURNING id, title, description, type, status, reporter_id, created_at, updated_at
    `;

    const result = await query(updateQuery, params);
    const updatedIssue = result.rows[0];

    // Get reporter info
    const reporterResult = await query(
      'SELECT id, name, role FROM users WHERE id = $1',
      [updatedIssue.reporter_id]
    );

    return {
      ...updatedIssue,
      reporter: reporterResult.rows[0],
    };
  },

  async updateIssueStatus(
    id: number,
    status: string,
    _userId: number,
    userRole: string
  ): Promise<IssueWithReporter | null> {
    // Only maintainers can change status
    if (userRole !== 'maintainer') {
      throw new Error('Only maintainers can change issue status');
    }

    const result = await query(
      `UPDATE issues 
       SET status = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING id, title, description, type, status, reporter_id, created_at, updated_at`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const updatedIssue = result.rows[0];

    const reporterResult = await query(
      'SELECT id, name, role FROM users WHERE id = $1',
      [updatedIssue.reporter_id]
    );

    return {
      ...updatedIssue,
      reporter: reporterResult.rows[0],
    };
  },

  async deleteIssue(id: number, userRole: string): Promise<boolean> {
    // Only maintainers can delete
    if (userRole !== 'maintainer') {
      throw new Error('Only maintainers can delete issues');
    }

    const result = await query('DELETE FROM issues WHERE id = $1 RETURNING id', [id]);

    return result.rows.length > 0;
  },
};