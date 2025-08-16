import Browser from 'crossbrowser-webextension';
import jitsu from 'jitsu';
import store from 'store';


const possibleErrors = new Set(
  typeof browser === 'undefined'
    ? [ // Chrome errors
        'net::ERR_ABORTED',
        'net::ERR_TIMED_OUT', // tcp.connection.timed_out
        'net::ERR_CONNECTION_CLOSED', // tcp.connection.closed
        'net::ERR_CONNECTION_RESET', // tcp.connection.reset
        'net::ERR_CONNECTION_REFUSED', // tcp.connection.refused
        'net::ERR_CONNECTION_ABORTED', // tcp.connection.aborted
        'net::ERR_CONNECTION_FAILED', // tcp.connection.failed
        'net::ERR_NAME_NOT_RESOLVED', // dns
        'net::ERR_SSL_PROTOCOL_ERROR', //ssl.protocol.error
        'net::ERR_ADDRESS_INVALID', //tcp.connection.address_invalid
        'net::ERR_ADDRESS_UNREACHABLE', //tcp.connection.address_unreachable
        'net::ERR_CONNECTION_TIMED_OUT', //tcp.connection.timed_out
        'net::ERR_NAME_RESOLUTION_FAILED', //dns
        'net::ERR_SSL_PINNED_KEY_NOT_IN_CERT_CHAIN', //ssl.cert.pinned_key_not_in_cert_chain
        'net::ERR_CERT_COMMON_NAME_INVALID', //ssl.cert.name_invalid
        'net::ERR_CERT_DATE_INVALID', //ssl.cert.date_invalid
        'net::ERR_CERT_AUTHORITY_INVALID', //ssl.cert.authority_invalid
        'net::ERR_CERT_REVOKED', // ssl.cert.revoked
        'net::ERR_CERT_INVALID', // ssl.cert.invalid
        'net::ERR_EMPTY_RESPONSE', // http.response.empty
        'net::ERR_SPDY_PING_FAILED', // spdy.ping_failed
        'net::ERR_SPDY_PROTOCOL_ERROR', // spdy.protocol
        'net::ERR_QUIC_PROTOCOL_ERROR', // quic.protocol
        'net::ERR_DNS_MALFORMED_RESPONSE', // dns.protocol
        'net::ERR_DNS_SERVER_FAILED', // dns.server
        'net::ERR_DNS_TIMED_OUT', // dns.timed_out
        'net::ERR_INSECURE_RESPONSE', // ssl
        // 'net::ERR_CONTENT_LENGTH_MISMATCH', // http.response.content_length_mismatch
        'net::ERR_INCOMPLETE_CHUNKED_ENCODING', // http.response.incomplete_chunked_encoding
        'net::ERR_SSL_VERSION_OR_CIPHER_MISMATCH', // ssl.version_or_cipher_mismatch
        'net::ERR_BAD_SSL_CLIENT_AUTH_CERT', // ssl.bad_client_auth_cert
        'net::ERR_INVALID_CHUNKED_ENCODING', //http.response.invalid_chunked_encoding
        'net::ERR_RESPONSE_HEADERS_TRUNCATED', // http.response.headers.truncated
        'net::ERR_REQUEST_RANGE_NOT_SATISFIABLE', // http.request.range_not_satisfiable
        'net::ERR_INVALID_RESPONSE', //http.response.invalid
        //'net::ERR_RESPONSE_HEADERS_MULTIPLE_CONTENT_DISPOSITION', // http.response.headers.multiple_content_disposition
        //'net::ERR_RESPONSE_HEADERS_MULTIPLE_CONTENT_LENGTH', // http.response.headers.multiple_content_length
        'net::ERR_SSL_UNRECOGNIZED_NAME_ALERT', //ssl.unrecognized_name_alert
      ]
    : [ // Firefox errors
        'NS_BINDING_FAILED', // The async request failed for some unknown reason
        'NS_BINDING_ABORTED', // The async request failed because it was aborted by some user action
        'NS_BINDING_REDIRECTED', // The async request has been redirected to a different async request
        'NS_BINDING_RETARGETED', // The async request has been retargeted to a different handler
        'NS_ERROR_NO_CONTENT', // Channel opened successfully but no data will be returned
        'NS_ERROR_CORRUPTED_CONTENT', // Corrupted content received from server (potentially MIME type mismatch because of 'X-Content-Type-Options: nosniff')
        'NS_ERROR_NOT_CONNECTED', // The connection does not exist
        'NS_ERROR_CONNECTION_REFUSED', // The connection was refused
        'NS_ERROR_NET_TIMEOUT', // The connection has timed out
        'NS_ERROR_NET_TIMEOUT_EXTERNAL', // The request has been cancelled because of a timeout
        'NS_ERROR_PORT_ACCESS_NOT_ALLOWED', // Establishing a connection to an unsafe or otherwise banned port was prohibited
        'NS_ERROR_NET_RESET', // The connection was established, but no data was ever received
        'NS_ERROR_NET_INTERRUPT', // The connection was established, but the data transfer was interrupted
        'NS_ERROR_NET_PARTIAL_TRANSFER', // A transfer was only partially done when it completed
        // 'NS_ERROR_NET_HTTP3_PROTOCOL_ERROR', // There has been a http3 protocol error
        // 'NS_ERROR_NOT_RESUMABLE', // This request is not resumable, but it was tried to resume it, or to request resume-specific data
        'NS_ERROR_ENTITY_CHANGED', // It was attempted to resume the request, but the entity has changed in the meantime
        // 'NS_ERROR_REDIRECT_LOOP', // The request failed as a result of a detected redirection loop
        'NS_ERROR_LOAD_SHOWED_ERRORPAGE', // The load caused an error page to be displayed.
        'NS_ERROR_BLOCKED_BY_POLICY', // The request was blocked by a policy set by the system administrator
        'NS_ERROR_UNKNOWN_HOST', // The lookup of the hostname failed

        'NS_ERROR_FAILURE',
        'NS_ERROR_UNKNOWN_CERT',
        'SEC_ERROR_UNKNOWN_ISSUER',
      ]
);


const nonProxyRequests: Set<string> = new Set();
let lastStamp: number | undefined;


Browser.webRequest.onBeforeSendHeaders.addListener(
  async({ requestId }) => {
    const { userPac } = await store.getStateAsync();
    if( userPac.mode === 'direct' ) nonProxyRequests.add( requestId );
  },
  {
    'types': [ 'main_frame' ],
    'urls': [ '<all_urls>' ]
  }
);

Browser.webRequest.onCompleted.addListener(
  ({ requestId }) => {
    nonProxyRequests.delete( requestId );
  },
  {
    'types': [ 'main_frame' ],
    'urls': [ '<all_urls>' ]
  }
);

Browser.webRequest.onErrorOccurred.addListener(
  ( details ) => {
    const { 'error': errorReason, requestId } = details;

    if( !possibleErrors.has( errorReason ) ) {
      nonProxyRequests.delete( requestId );
      return;
    }
    if( !nonProxyRequests.has( requestId ) ) return;

    const now = Date.now();
    if( lastStamp === undefined || now > lastStamp + 10 * 60 * 1000 ) {
      jitsu.track( 'connection_error' );
      lastStamp = now;
    }

    nonProxyRequests.delete( requestId );
  },
  {
    'types': [ 'main_frame' ],
    'urls': [ '<all_urls>' ]
  }
);


