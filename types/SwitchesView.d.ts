declare type SwitchesViewSimple = {
  'type': 'simple',
  'rating': integer | undefined
};
declare type SwitchesViewComplexOff = {
  'type': 'complex off',
  'domain': string,
  'view': string,
  'dependentDomain'?: null | string
};
declare type SwitchesViewComplexOn = {
  'type': 'complex on',
  'country': string,
  'domain': string,
  'view': string,
  'dependentDomain'?: null | string
};


declare type SwitchesView =
  SwitchesViewSimple |
  SwitchesViewComplexOff |
  SwitchesViewComplexOn;
