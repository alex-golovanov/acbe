declare type DeclarativeNetRequestRuleAction = {
  // The request headers to modify for the request. Only valid if RuleActionType is "modifyHeaders".
  'requestHeaders'?: DeclarativeNetRequestModifyHeaderInfo[],

  // The response headers to modify for the request. Only valid if RuleActionType is "modifyHeaders".
  'responseHeaders'?: DeclarativeNetRequestModifyHeaderInfo[],
  
  'type': 'modifyHeaders' // The type of action to perform.
} | {
  //Describes how the redirect should be performed. Only valid for redirect rules.
  'redirect': Redirect,
  'type': 'redirect' // The type of action to perform.
} | {
  // The type of action to perform.
  'type': 'block' | 'allow' | 'upgradeScheme' | 'allowAllRequests'
};