const gaConnections = require( './gaConnections' );


/** Modifies input config objects
@function */
module.exports = ( config ) => {
  if( !config.ga.enabled ) return config;

  config.ga4 = {};

  if( config.ga.tracking_id ) {
    const counterpart =
      gaConnections.find( ({ track }) => track === config.ga.tracking_id );
    if( counterpart ) {
      config.ga4.partial = {};
      config.ga4.partial.measurementId = counterpart.ga4MeasurementId;
      config.ga4.partial.apiSecret = counterpart.ga4ApiSecret;
    }
  }
  if( config.ga.fullTrackingId ) {
    const counterpart =
      gaConnections.find( ({ track }) => track === config.ga.fullTrackingId );
    if( counterpart ) {
      config.ga4.full = {};
      config.ga4.full.measurementId = counterpart.ga4MeasurementId;
      config.ga4.full.apiSecret = counterpart.ga4ApiSecret;
    }
  }
  
  return config;
};
