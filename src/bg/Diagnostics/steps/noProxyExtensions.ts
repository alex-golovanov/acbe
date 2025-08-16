/* global DiagnosticsStepState, Extension, ExtensionInfo */
import { filterExtensions } from '../filterExtensions.utils';

interface NoProxyExtensionsStepState extends DiagnosticsStepState {
  allExtensions: Extension[];
}

/** No other proxy extensions (Chrome only)
@function */
export default async(
  rawExtensions: ExtensionInfo[] | undefined,
  proxyApiError: boolean
): Promise<NoProxyExtensionsStepState> => {
  const proxyExtensions: Extension[] = filterExtensions( rawExtensions );
  const allExtensions = filterExtensions( rawExtensions, false );

  return {
    'name': 'noProxyExtensions',
    'state': proxyExtensions.length ? 'warning' : 'success',
    allExtensions,
    proxyExtensions,
  };
};
