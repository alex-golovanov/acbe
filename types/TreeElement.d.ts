declare type TreeTextNode = {
  text: string;
};

declare type TreeElement = {
  attributes?: { [key: string]: string };
  children?: Array<TreeElement | TreeTextNode>;
  class?: string;
  node?: (node: HTMLElement | Node) => any;
  style?: string;
  tag: string;
  text?: string;
};

export type { TreeElement, TreeTextNode };
