// @flow
const _ = require( 'lodash' );
const config = require( '../../configuration' );
const gulp = require( 'gulp' );
const jeditor = require( 'gulp-json-editor' );

const { createMultifileTask } = require( '../../taskFunctions' );
const directory /*: string*/ = require( '../../outputDirectory' );

/** @function */
const createLocaleKey = ( message ) => {
  return {
    message,
    'description': '',
  };
};

/** @function */
function getLocaleLanguageCode( file ) {
  return file.match( /([a-z]{2})(\/|\\)messages/ )?.[ 1 ];
}

/** Helper function to substitute templates like $1, $2, $3... in string line as per i18n.getMessage API
@function */
function substituteTemplate( str /*: string*/, substitutions /*: string[]*/ ) {
  if( !str || str.length === 0 || typeof str !== 'string' ) {
    return str;
  }
  if( !substitutions || substitutions.length === 0 ) {
    return str;
  }
  return str.replace( /\$(\d+)/g, function( match, index ) {
    const substitutionIndex = parseInt( index ) - 1;
    if( substitutionIndex >= 0 && substitutionIndex < substitutions.length ) {
      return substitutions[ substitutionIndex ];
    }
    return match;
  });
}

const createTask = ( name /*: string*/ ) => {
  const browser = name.split( ':' )[ 1 ];

  // Locales
  createMultifileTask( name, 'src/_locales/**/*.json', ( files ) =>
    files
      .filter( ( item ) => !item.endsWith( 'messages.crap.json' ) )
      .map( ( file ) => {
        // get language from file path of localized messages file
        const language = getLocaleLanguageCode( file ) || 'en';
        const isRu = language === 'ru';
        const isEn = language === 'en';
        const isCustomizedLocale = !isRu && !isEn;

        return gulp
          .src( file, { 'base': 'src' })
          .pipe(
            jeditor( ( json ) => {
              // we need to customize browser type for all locales
              if( isCustomizedLocale ) {
                const browserName = _.capitalize( browser );
                const endExtra = ( () => {
                  if( config.type === 'development' ) return ' - dev';
                  if( config.type === 'lvh' ) return ' - lvh';
                  if( config.type.startsWith( 'qa' ) ) { return ' - ' + config.type.toUpperCase(); }
                  return '';
                })();
                const substitutions = [ browserName, endExtra ];
                json.extension_description.message = substituteTemplate( json.extension_description.message, substitutions );
                json.extension_name.message = substituteTemplate( json.extension_name.message, substitutions );
                json.esn.message = substituteTemplate( json.esn.message, substitutions );
                return json;
              };

              // rewrite 'extension_description', 'extension_name', 'extension_short_name' for ru and en locales
              // extension_description
              json.extension_description = createLocaleKey(
                ( () => {
                  const browserName = _.capitalize( browser );

                  if( language === 'ru' ) {
                    return `Browsec VPN - это бесплатное ВПН-расширение для ${browserName}. Для доступа к Youtube, Facebook, и другим заблокированным сервисам.`;
                  }

                  return `Browsec VPN is a ${browserName} VPN extension that protects your IP from Internet threats and lets you browse privately for free.`;
                })(),
              );
              // extension_name
              json.extension_name = createLocaleKey(
                ( () => {
                  const endExtra = ( () => {
                    if( config.type === 'development' ) return ' - dev';
                    if( config.type === 'lvh' ) return ' - lvh';
                    if( config.type.startsWith( 'qa' ) ) { return ' - ' + config.type.toUpperCase(); }
                    return '';
                  })();

                  if( language === 'ru' ) {
                    if( browser === 'firefox' ) {
                      return `Browsec VPN - бесплатное ВПН расширение${endExtra}`;
                    }

                    const browserName = ( () => {
                      switch( browser ) {
                        case 'chrome':
                          return 'Хрома';
                        case 'firefox':
                          return 'Файрфокс';
                        case 'opera':
                          return 'Оперы';
                        case 'edge':
                          return 'Edge';
                        default:
                          return '';
                      }
                    })();

                    return `Browsec VPN - бесплатный ВПН для ${browserName}${endExtra}`;
                  }

                  if( browser === 'firefox' ) {
                    return `Browsec VPN - Free VPN Extension${endExtra}`;
                  }

                  const browserName = _.capitalize( browser );

                  return `Browsec VPN - Free VPN for ${browserName}${endExtra}`;
                })(),
              );

              // extension_short_name
              json.esn = createLocaleKey(
                ( () => {
                  if( config.type.startsWith( 'qa' ) ) return 'Browsec-qa';
                  if( config.type === 'development' ) return 'Browsec-dev';
                  if( config.type === 'lvh' ) return 'Browsec-lvh';
                  if( config.type === 'staging' ) return 'Browsec-staging';

                  return 'Browsec VPN';
                })(),
              );

              return json;
            }),
          )
          .pipe( gulp.dest( directory ) );
      }),
  );
};

createTask( 'locales:chrome' );
createTask( 'locales:edge' );
createTask( 'locales:firefox' );
createTask( 'locales:opera' );
