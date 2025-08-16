/* global OnAuthRequiredDetails */
import ga from 'ga';
import log from 'log';
import storage from 'storage';
import browserType from '../../general/helpers/browserType';
import throttledPingSmartSettingsServers from '../pingSmartSettings';


type AuthHistoryItem = {
  'periodStart': number,
  'authRequestsNum': integer
};


const timeFrameMs/*: integer*/ = 10000;
const authRequestsLimit/*: integer*/ =
browserType.isFirefox() ? 200 : 50; // increase limit for onAuthRequired cache requests


/** @function */
const makeHostDecision = (
  hostInfo: AuthHistoryItem | undefined,
  timestamp: number
): {
  'breakAuthProccess': boolean,
  'newHostInfo': AuthHistoryItem | undefined
  'logs': any[][]
} => {
  // No information
  if( !hostInfo || !hostInfo.periodStart || !hostInfo.authRequestsNum ) {
    let object = { 'periodStart': timestamp, 'authRequestsNum': 1 };

    return {
      'breakAuthProccess': false,
      'newHostInfo': object,
      'logs': [
        [
          'No host auth history. Create record: ',
          object
        ]
      ]
    };
  }

  hostInfo = Object.assign({}, hostInfo );

  let logs = [
    [
      'Host history record already exists',
      hostInfo
    ]
  ];

  let { periodStart } = hostInfo;

  // Timeframe expired
  if( timestamp - periodStart > timeFrameMs ) {
    logs.push( [
      'Time frame already finished. Create new row.'
    ] );

    return {
      'breakAuthProccess': false,
      'newHostInfo': {
        'periodStart': timestamp,
        'authRequestsNum': 1
      },
      logs
    };
  }

  logs.push( [
    'We are still in tracked time frame. Increase auth requests counter'
  ] );

  let newCount = hostInfo.authRequestsNum + 1;

  if( newCount < authRequestsLimit ) {
    hostInfo.authRequestsNum++;

    return {
      'breakAuthProccess': false,
      'newHostInfo': hostInfo,
      logs
    };
  }
  else {
    logs.push( [
      'Limit exceeded. Return true and clear host auth history'
    ] );

    return {
      'breakAuthProccess': true,
      'newHostInfo': undefined,
      logs
    };
  }
};


/** @function */
export default async(
  { 'challenger': { host }, 'timeStamp': timestamp }: OnAuthRequiredDetails
): Promise<boolean> => {
  let authHistory: { [ key: string ]: AuthHistoryItem } =
    await storage.get( 'authHistory' ) || {};

  let {
    breakAuthProccess,
    newHostInfo,
    logs
  } = makeHostDecision( authHistory[ host ], timestamp );

  if( newHostInfo ) {
    authHistory[ host ] = newHostInfo;

    if(newHostInfo.authRequestsNum === 10) {
      logs.push( [
        'Ping SmartSettings servers after 10 auth requests'
      ] );
      await throttledPingSmartSettingsServers();
    }
  } else {
    delete authHistory[ host ];
  }

  if( breakAuthProccess ) {
    ga.partial({ 'category': 'auth_request_limit_exceeded' });
  }

  logs.push( [ 'Save auth history' ] );

  log.group( 'Check if onAuthRequired limit - ' + host, logs );

  storage.set( 'authHistory', authHistory );

  return breakAuthProccess;
};
