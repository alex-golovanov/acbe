/* global OnCompletedDetails, SiteFilter */
import Browser from 'crossbrowser-webextension';
import Counters from 'bg/Counters';
import dependencies from 'lowLevelPac/domainDependencies';
import findMatchingDependencyForDomain from 'tools/findMatchingDependencyForDomain';
import findMatchingFilterForDomain from 'tools/findMatchingFilterForDomain';
import store from 'store';
import urlToDomain from 'tools/urlToDomain';
import { trafficCounter } from 'bg/services';
import trySendDailyRetention from 'bg/trySendDailyRetention';
import { smartSettingsDailyAnalytics } from 'bg/utils';
import jitsu from 'jitsu';


/** @function */
export default () => {
  Browser.webRequest.onCompleted.addListener(
    async({ parentFrameId, url }: OnCompletedDetails ) => {
      if( parentFrameId !== -1 ) return;

      let domain = urlToDomain( url );
      if( !domain ) return; // Case of local browser page

      let { 'userPac': pac } = await store.getStateAsync();
      let { mode, filters } = pac;

      let filter: SiteFilter | undefined = findMatchingFilterForDomain(
        filters, domain
      );

      if( filter ? filter.proxyMode : mode === 'proxy' ) {
        Counters.increase( 'proxied pages' );
        jitsu.track( 'connection' );

        trySendDailyRetention();
      }
    },
    { 'urls': [ '<all_urls>' ], 'types': [ 'main_frame' ] }
  );

  Browser.webRequest.onCompleted.addListener(
    async( details: OnCompletedDetails ) => {
      const domain = ( () => {
        try {
          return new URL( details.url ).hostname;
        }
        catch ( x ) {}
      })();
      if( !domain ) return;

      const { 'userPac': pac } = await store.getStateAsync();

      // Traffic counter
      const proxyRequest = ( () => {
        const filters =
          pac.filters.filter( ({ disabled }) => !disabled );
        let filter: SiteFilter | undefined = findMatchingFilterForDomain(
          filters, domain
        );

        ( () => {
          const dependency =
            findMatchingDependencyForDomain( dependencies, domain );
          if( !dependency ) return;

          filter = filters.find( ({ value }) => (
            typeof value === 'string' && (
              dependency.domain.some(
                item => value === item || value.endsWith( '.' + item )
              )
              || dependency.fullDomain.includes( value )
            )
          ) );
        })();

        if( filter ) return filter.proxyMode;

        return pac.mode === 'proxy';
      })();

      if( proxyRequest ) {
        const bytes: number = Number(
          details.responseHeaders.find(
            ({ name }) => name.toLowerCase() === 'content-length'
          )?.value
        );
        
        if( bytes ) trafficCounter.add( bytes );
        smartSettingsDailyAnalytics(details.url, pac);
      }
    },
    { 'urls': [ '<all_urls>' ] },
    typeof browser === 'undefined'
      ? [ 'responseHeaders', 'extraHeaders' ] // extraHeaders only for Chrome
      : [ 'responseHeaders' ]
  );
};
