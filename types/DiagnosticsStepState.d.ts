declare type DiagnosticsStepState = {
  'errors'?: string[],
  'proxyExtensions'?: Extension[],
  'extra'?: any,
  'name': string,
  'requests'?: {
    'success': integer,
    'total': integer
  },
  'state': 'error' | 'in process' | 'not started' | 'partial' | 'success' | 'skip' | 'warning',
  'text'?: string
};
