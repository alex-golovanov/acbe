declare type DiagnosticsRequestState = {
  'errors'?: string[],
  'requests'?: { 'total': integer, 'success': integer },
  'state': 'error' | 'skip' | 'success' | 'warning'
};
