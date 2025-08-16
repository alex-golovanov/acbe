import ajax from 'tools/ajax';
import DelayRecord from 'DelayRecord';
import list from './defaultList.json';
import punycode from 'punycode'; // eslint-disable-line
import storage from 'storage';
import time from 'time';


type DomainZoneList = {
  'data': string[]
};


let domainZoneList: DomainZoneList = { 'data': list };

( async() => { // Initial
  let storageValue = await storage.get( 'domainZoneList' );
  
  if( Array.isArray( storageValue ) ) domainZoneList.data = storageValue;
  else storage.set( 'domainZoneList', domainZoneList.data );
})();


/** @function */
const loop = async() => {
  let timer = new DelayRecord( 'Domain zone list' );
  let data: string = await ajax(
    'https://publicsuffix.org/list/public_suffix_list.dat',
    { 'method': 'GET' }
  );

  timer.end();

  let strings: string[] = data.replace( /\r/g, '' ).split( /\n/g )
    .map( ( string: string ) => string.trim() )
    .filter( string => string && !/\/\//.test( string ) ) // Not comment
    .map( string => ( string.split( '.' ).pop() as string ) );

  domainZoneList.data = Array.from( new Set( strings ) ).map( item => (
    /[^a-z0-9_\-]/.test( item ) ? punycode.toASCII( item ) : item
  ) );
  storage.set( 'domainZoneList', domainZoneList.data );
};


time.onStart({
  'name': 'domain zone list',
  'startDelayInMs': 0,
  'repeatInMinutes': 24 * 60
}, loop );


export default domainZoneList;

// https://publicsuffix.org/list/public_suffix_list.dat
