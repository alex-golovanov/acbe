declare type PacSetState = ( arg: {
  premiumServers: Map<string, PacHost[]>,
  servers: Map<string, PacHost[]>,
  state: UserPac
}) => Promise<[ UserPac, UserPac ]>;