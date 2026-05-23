export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

export const validateName = (name: string): boolean => {
  return name.trim().length >= 2;
};

export const validateTitle = (title: string): boolean => {
  return title.trim().length > 0 && title.length <= 150;
};

export const validateDescription = (description: string): boolean => {
  return description.trim().length >= 20;
};

export const isValidIssueType = (type: string): boolean => {
  return type === 'bug' || type === 'feature_request';
};

export const isValidStatus = (status: string): boolean => {
  return status === 'open' || status === 'in_progress' || status === 'resolved';
};

export const isValidRole = (role: string): boolean => {
  return role === 'contributor' || role === 'maintainer';
};