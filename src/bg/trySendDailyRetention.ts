import timemarks from 'bg/timemarks';


/** @function */
export default async() => {
  const currentMark = await timemarks.get( 'GA Rare dailyRetention' );

  if( currentMark && Date.now() < currentMark + 24 * 3600 * 1000 ) {
    return;
  }

  timemarks.set( 'GA Rare dailyRetention' );
};
