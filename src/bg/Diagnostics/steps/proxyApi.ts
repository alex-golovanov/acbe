/* global Extension, ExtensionInfo */
import { filterExtensions } from '../filterExtensions.utils';
import proxy from 'proxy';


const name = 'proxyApi';

/** Proxy API is available
@function */
export default async(
  rawExtensions: ExtensionInfo[] | undefined
): Promise<{
  'name': string,
  'state': 'error' | 'success',
  'extensions'?: Extension[]
}> => {
  // FF -> always exist
  if( typeof browser !== 'undefined' ) return { name, 'state': 'success' };

  // Chrome
  const underControl: boolean = await proxy.isControlled();
  if( underControl ) return { name, 'state': 'success' };

  const extensions: Extension[] = filterExtensions( rawExtensions );

  return { name, 'state': 'error', extensions };
};
