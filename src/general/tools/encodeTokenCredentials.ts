/* global Credentials */

// Convert credentials object to string for header in request
export default ({ access_token }: Credentials ): string => (
  `Token token="${access_token}"`
);
