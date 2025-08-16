declare type DeclarativeNetRequestRule = {
  // The action to take if this rule is matched.
  'action': DeclarativeNetRequestRuleAction,

  // The condition under which this rule is triggered.
  'condition': DeclarativeNetRequestRuleCondition,

  // An id which uniquely identifies a rule. Mandatory and should be >= 1.
  'id': integer,

  // Rule priority. Defaults to 1. When specified, should be >= 1.
  'priority'?: number
};
