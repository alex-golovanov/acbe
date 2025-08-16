// @flow
import { css } from 'lit';

// old version, not use in new components and reuse 'const globalStyle' below in old components while refactoring
export default `
p, ul, ol, td, th{
  padding: 0;
  margin: 0;
}

table {
  border-collapse: collapse;
}

ul, ol{
  list-style: none;
}
`;

export const globalStyle = css`
  p,
  ul,
  ol,
  td,
  th {
    padding: 0;
    margin: 0;
  }

  table {
    border-collapse: collapse;
  }

  ul,
  ol {
    list-style: none;
  }
`;
