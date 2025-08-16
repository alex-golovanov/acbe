import gaUserIdPromise from './gaUserIdPromise';


export default Object.assign(
  async( arg1: {
    'category'?: string,
    'action'?: string,
    'label'?: string,
    'value'?: string,
    'noninteraction'?: boolean
  }): Promise<any> => {},
  { 'userIdPromise': gaUserIdPromise }
);
