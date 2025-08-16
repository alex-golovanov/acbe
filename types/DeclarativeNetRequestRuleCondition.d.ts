type ResourceType = 
  'beacon' | 'csp_report' | 'font' | 'image' | 'imageset' | 'main_frame' | 
  'media' | 'object' | 'object_subrequest' | 'ping' | 'script' | 'speculative' |
  'stylesheet' | 'sub_frame' | 'web_manifest' | 'websocket' | 'xbl' | 
  'xml_dtd' | 'xmlhttprequest' | 'xslt' | 'other';


declare type DeclarativeNetRequestRuleCondition = {
  // The rule will only match network requests originating from the list of domains. If the list is omitted, the rule is applied to requests from all domains. An empty list is not allowed.
  'domains'?: string[],

  // Specifies whether the network request is first-party or third-party to the domain from which it originated. If omitted, all requests are accepted.
  //'domainType'?: DomainType,

  // The rule will not match network requests originating from the list of excludedDomains. If the list is empty or omitted, no domains are excluded. This takes precedence over domains.
  'excludedDomains'?: string[],

  // List of request methods which the rule won't match. Only one of requestMethods and excludedRequestMethods should be specified. If neither of them is specified, all request methods are matched.
  //'excludedRequestMethods'?: RequestMethod[],

  // List of resource types which the rule won't match. Only one of resourceTypes and excludedResourceTypes should be specified. If neither of them is specified, all resource types except "main_frame" are blocked.
  //'excludedResourceTypes'?: ResourceType[],

  // List of tabs.Tab.id which the rule should not match. An ID of tabs.TAB_ID_NONE excludes requests which don't originate from a tab. Only supported for session-scoped rules.
  'excludedTabIds'?: number[],

  // Whether the urlFilter or regexFilter (whichever is specified) is case sensitive. Default is true.
  'isUrlFilterCaseSensitive'?: boolean,

  // Regular expression to match against the network request url. This follows the RE2 syntax.
  'regexFilter'?: string,

  // List of HTTP request methods which the rule can match. An empty list is not allowed.
  //'requestMethods'?: RequestMethod[],

  // List of resource types which the rule can match. An empty list is not allowed.
  'resourceTypes'?: ResourceType[],
  
  // List of tabs.Tab.id which the rule should match. An ID of tabs.TAB_ID_NONE matches requests which don't originate from a tab. An empty list is not allowed. Only supported for session-scoped rules.
  'tabIds'?: number[],
  
  // The pattern which is matched against the network request url.
  'urlFilter'?: string
};