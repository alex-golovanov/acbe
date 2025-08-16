import ga from 'ga';
import highLevelPac from 'highLevelPac';
import jitsu from 'jitsu';
import proxy from 'proxy';
import runtimeOnMessage from 'bg/runtime.onMessage';


runtimeOnMessage.addListener({
  'callback': async() => {
    try {
      const output = await highLevelPac.disable();
      return { 'success': output };
    }
    catch ( error ) {
      return { error };
    }
  },
  'type': 'proxy.disable',
  'popupOnly': true
});

runtimeOnMessage.addListener({
  'callback': async() => {
    try {
      const output = await highLevelPac.enable();
      return { 'success': output };
    }
    catch ( error ) {
      return { error };
    }
  },
  'type': 'proxy.enable',
  'popupOnly': true
});

/*runtimeOnMessage.addListener({
  'callback': ({ premiumServers, servers, state }: {
    premiumServers: { [ country: string ]: PacHost[] },
    servers: { [ country: string ]: PacHost[] },
    state: UserPac,
  }) => originalSetState({
    'premiumServers': new Map( Object.entries( premiumServers ) ),
    'servers': new Map( Object.entries( servers ) ),
    state,
  }),
  'type': 'proxy.internalSetState',
  'popupOnly': true
});*/

runtimeOnMessage.addListener({
  'callback': () => proxy.isControlled(),
  'type': 'proxy.isControlled',
  'popupOnly': true
});

runtimeOnMessage.addListener({
  'callback': async({ country }/*: { 'country': string }*/ ) => {
    try {
      const output = await highLevelPac.setCountry( country );
      return { 'success': output };
    }
    catch ( error ) {
      return { error };
    }
  },
  'type': 'proxy.setCountry',
  'popupOnly': true
});

runtimeOnMessage.addListener({
  'callback': async(
    { 'data': { country, domain, type } }/*:
    { 'data': {
      'country'?: string,
      'domain': string,
      'type': 'proxy' | 'direct'
    } }*/
  ) => {
    try {
      let output = await highLevelPac.siteFilters.add({ country, domain, type });
      return { 'success': output };
    }
    catch ( error ) {
      return { error };
    }
  },
  'type': 'proxy.siteFilters.add',
  'popupOnly': true
});

runtimeOnMessage.addListener({
  'callback': async({ country, domain }) => {
    try {
      let output = await highLevelPac.siteFilters.changeCountry({ country, domain });

      ga.full({ 'action': 'smartSettingsEdit', 'category': 'smartSettings' });
      jitsu.track( 'smartSettingsEdit' );

      return { 'success': output };
    }
    catch ( error ) {
      return { error };
    }
  },
  'type': 'proxy.siteFilters.changeCountry',
  'popupOnly': true
});

runtimeOnMessage.addListener({
  'callback': async({ domain }) => {
    try {
      let output = await highLevelPac.siteFilters.remove( domain );
      return { 'success': output };
    }
    catch ( error ) {
      return { error };
    }
  },
  'type': 'proxy.siteFilters.remove',
  'popupOnly': true
});

runtimeOnMessage.addListener({
  'callback': async({ domain }) => {
    try {
      let output = await highLevelPac.siteFilters.toggle( domain );
      return { 'success': output };
    }
    catch ( error ) {
      return { error };
    }
  },
  'type': 'proxy.siteFilters.toggle',
  'popupOnly': true
});
