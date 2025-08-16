/* global PingCountryAverage, PingSortedServer, PingRating */
type Multiplier = {
  'denominator': Segment, // eslint-disable-line no-use-before-define
  'multiplier': number,
  'numerator': Segment // eslint-disable-line no-use-before-define
};

type Segment = {
  'end': PingRating,
  'start': PingRating,
  'value': number
};


// Actual count of grades
const pieces/*: integer*/ = 4;

const keyLowLimit/*: number*/ = 1.8;
const keyHighLimit/*: number*/ = 2.4;


/** @function */
export default (
  { delayData, servers }: {
    'delayData': PingCountryAverage[],
    'servers': PingSortedServer[]
  }
): PingRating[] => {
  // Add little inflation to doubles
  delayData.forEach( delayElement => {
    const delay/*: number*/ = delayElement.delay;
    const doubles/*: Array<PingCountryAverage>*/ =
      delayData.filter( ({ 'delay': ownDelay }) => ownDelay === delay );
    if( doubles.length === 1 ) return;

    doubles.forEach( double => {
      double.delay += Math.random() * 2 - 1;
    });
  });

  if( !delayData.length ) throw new Error( 'delayData is empty' );

  let min: integer = delayData[ 0 ].delay;
  let max: integer = delayData[ 0 ].delay;
  for( const { delay } of delayData ) {
    if( delay < min ) min = delay;
    if( delay > max ) max = delay;
  }
  const delta: number = ( max - min ) / pieces;

  let data: PingRating[] = delayData.map( ({ country, premium, delay }) => {
    let mark/*: integer*/ = ( () => {
      let floatValue/*: number*/ = ( delay - min ) / delta; // from 0 to 8 -> 0 - best, 8 - worst

      return pieces - floatValue;
    })();

    return { country, premium, delay, mark };
  });

  let sorted: PingRating[] = data.slice().sort( ( a, b ) => a.mark - b.mark );

  let segments: Segment[] = sorted
    .slice( 0, -1 ) // Cut end array element
    .map( ( current: PingRating, index ) => {
      let next: PingRating = sorted[ index + 1 ];
      let value/*: number*/ = next.mark - current.mark;

      return { 'start': current, 'end': next, value };
    });

  let sortedSegments/*: Segment[]*/ =
    segments.slice().sort( ( a, b ) => a.value - b.value ); // .filter( ({ value }) => value > 0.1 )

  let multipliers: Multiplier[] = sortedSegments
    .slice( 0, -1 ) // Cut end array element
    .map( ( current/*: Segment*/, index ) => {
      let next/*: Segment*/ = sortedSegments[ index + 1 ];
      let multiplier/*: number*/ = next.value / current.value;

      return { 'denominator': current, 'numerator': next, multiplier };
    });
  
  let modifiedMultipliers/*: Multiplier[]*/ = multipliers.slice().sort(
    ( a, b ) => a.multiplier - b.multiplier
  );

  // Decreasing multipliers more then keyLowLimit to range keyLowLimit - keyHighLimit
  const logBase/*: number*/ = ( () => {
    let prevMax/*: number*/ = (
      modifiedMultipliers.filter(
        ({ multiplier }) => multiplier <= keyLowLimit
      ).pop() || {}
    ).multiplier || 0;

    return Math.max( prevMax * 1.1, keyLowLimit );
  })();

  // Change gaps into range [keyLowLimit - keyHighLimit]
  let criticalValues/*: Multiplier[]*/ = modifiedMultipliers.filter(
    ({ multiplier, denominator, numerator }) => (
      multiplier !== Infinity && multiplier >= keyLowLimit
      && ( denominator.value > 0.1 || numerator.value > 0.1 ) // Remove too short ranges (they don't create entropy)
    )
  );
  if( criticalValues.length ) {
    if( criticalValues.length === 1 ) criticalValues[ 0 ].multiplier = logBase;
    else {
      let min/*: number*/ = criticalValues[ 0 ].multiplier;
      let max/*: number*/ = Math.max(
        criticalValues[ criticalValues.length - 1 ].multiplier,
        keyHighLimit
      );
      let delta/*: number*/ = keyHighLimit - logBase;

      criticalValues.forEach( multiplierData => {
        multiplierData.multiplier =
          delta * ( multiplierData.multiplier - min ) / ( max - min ) + logBase;
      });
    }

    /** Restoring segments */
    let newSegments/*: Segment[]*/ = ( () => {
      let currentValues/*: number[]*/ = ( () => {
        let previousValue: number | undefined;

        return multipliers.map( (
          { denominator, numerator, multiplier }/*:
            { 'denominator': Segment, 'numerator': Segment, 'multiplier': number }*/
        ) => {
          let base/*: number*/ = previousValue ?? denominator.value;
          let currentValue/*: number*/ = base * multiplier;

          previousValue = currentValue; // Loop
  
          return currentValue;
        });
      })();

      return [ multipliers[ 0 ].denominator ].concat( multipliers.map(
        (
          { numerator }/*: { 'numerator': Segment }*/,
          index
        ) => {
          numerator.value = currentValues[ index ];
  
          return numerator;
        }
      ) );
    })();

    {
      let sum/*: number*/ = newSegments.map( ({ value }) => value )
        .reduce( ( carry, value ) => carry + value, 0 );
      let multiplier/*: number*/ = pieces / sum;

      newSegments = newSegments.map( segment => {
        segment.value *= multiplier;
        return segment;
      });
    }

    {
      let previousValue: number | undefined;

      segments.forEach(
        (
          { start, end, value }/*:
            { 'start': PingRating, 'end': PingRating, 'value': number }*/,
          index
        ) => {
          let base/*: number*/ = previousValue ?? start.mark;
          end.mark = base + value;
  
          previousValue = base + value;
        }
      );
    }
  }

  data.forEach( ( dataElement/*: PingRating*/ ) => {
    const serverLoad: number | undefined = servers.find(
      ({ country, premium }) => (
        dataElement.country === country && dataElement.premium === premium
      )
    )?.serverLoad;
    if( typeof serverLoad !== 'number' ) return;

    let difference/*: number*/ = ( 1 - serverLoad ) * dataElement.mark;
    if( difference > 0 && difference < 1 ) difference = 1;

    dataElement.mark -= difference;
    if( dataElement.mark < 0 ) dataElement.mark = 0;
  });

  data.forEach( ( dataElement/*: PingRating*/ ) => {
    dataElement.mark = Math.floor( 2 + dataElement.mark );
    if( dataElement.mark === 6 ) dataElement.mark = 5;

    dataElement.delay = Math.round( dataElement.delay );
  });

  return data;
};
