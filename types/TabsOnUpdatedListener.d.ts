declare type TabsOnUpdatedListener = (
  tabId: integer, 
  changeInfo: {
    'status'?: 'loading' | 'complete'
  }, 
  tab: Tab 
) => any;