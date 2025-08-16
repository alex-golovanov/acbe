import AnimationElement from './AnimationElement';


const delays/*: number[]*/ = [
  1000, // Move cursor to extensions icon
  400, // Click on extensions icon shows popup (fadeIn)
  1250, // Move cursor to pin
  200, // Do nothing
  300, // Pin clicked & search panel with browsec icon
  1250, // Move cursor to Browsec icon
  200, // Do nothing
  400, // Click on Browsec icon shows Browsec popup (fadeIn)
  1250, // Move cursor to OFF
  200, // Do nothing
  400, // Click on Off -> Change mode to protection and change browsec icon (fadeIn / fadeOut)
  750, // Move cursor to Change
  200, // Do nothing
  400, // Click on Change button -> show smart settings (fadeIn / fadeOut)
  1250, // Move cursor to United States
  200, // Do nothing
  400, // Click on United States
  1250 // Do nothing
];


const animationLoopLength/*: number*/ =
  delays.reduce( ( carry, value ) => carry + value, 0 );
const steps/*: number[]*/ = delays.map( delay => delay / animationLoopLength );
const stepsSumm = steps.map( ( x, index ) => (
  steps.slice( 0, index + 1 ).reduce( ( carry, value ) => carry + value, 0 )
) );


export default (
  mainElement: HTMLElement
)/*: { start: () => Promise<void> } */ => {
  let searchPanel = new AnimationElement(
    mainElement.querySelector( 'div.Animation_Search' )
  );
  let cursor = new AnimationElement(
    mainElement.querySelector( 'div.Animation_Cursor' )
  );
  let extensionsIcon = new AnimationElement(
    mainElement.querySelector( 'div.Animation_ExtensionsIcon' )
  );

  let browsecIcon = new AnimationElement(
    mainElement.querySelector( 'div.Animation_BrowsecIcon' )
  );
  let browsecIconUk = new AnimationElement(
    mainElement.querySelector( 'div.Animation_BrowsecIconUk' )
  );
  let browsecIconUs = new AnimationElement(
    mainElement.querySelector( 'div.Animation_BrowsecIconUs' )
  );

  let extensionsPopup = new AnimationElement(
    mainElement.querySelector( 'div.Animation_ExtensionsPopup' )
  );
  let pinIcon = new AnimationElement(
    mainElement.querySelector( 'div.Animation_PinEnabled' )
  );
  let pinIconHover = new AnimationElement(
    mainElement.querySelector( 'div.Animation_PinEnabledHover' )
  );

  let browsecPopup = new AnimationElement(
    mainElement.querySelector( 'div.Animation_BrowsecPopup' )
  );
  let switchOn = new AnimationElement(
    mainElement.querySelector( 'div.Animation_SwitchOn' )
  );
  let switchOff = new AnimationElement(
    mainElement.querySelector( 'div.Animation_SwitchOff' )
  );
  let browsecPopupNoProtection = new AnimationElement(
    mainElement.querySelector( 'div.Animation_BrowsecPopup_NoProtection' )
  );
  let browsecPopupProtection = new AnimationElement(
    mainElement.querySelector( 'div.Animation_BrowsecPopup_Protection' )
  );
  let browsecPopupProtectionHover = new AnimationElement(
    mainElement.querySelector( 'div.Animation_BrowsecPopup_Protection_Hover' )
  );
  let browsecPopupProtectionUs = new AnimationElement(
    mainElement.querySelector( 'div.Animation_BrowsecPopup_ProtectionUs' )
  );
  let browsecPopupSmartSettings = new AnimationElement(
    mainElement.querySelector( 'div.Animation_BrowsecPopup_SmartSettings' )
  );
  let browsecPopupSmartSettingsHover = new AnimationElement(
    mainElement.querySelector( 'div.Animation_BrowsecPopup_SmartSettingsHover' )
  );


  /** @function */
  let start = (): Promise<void> => new Promise( resolve => {
    let startStamp: number | undefined;

    /** @function */
    let step = ( timestamp: number ) => {
      if( startStamp === undefined ) startStamp = timestamp;
      let delta/*: number*/ = timestamp - startStamp;
      if( delta > animationLoopLength ) {
        resolve();
        return;
      }

      let tail/*: number*/ = ( () => {
        let ratio = Math.floor( delta / animationLoopLength );
        return delta - ratio * animationLoopLength;
      })();

      const percent = tail / animationLoopLength;

      { // Cursor
        let x = ( () => {
          switch( true ) {
            case percent <= stepsSumm[ 1 ]:
              return 532;
            case percent <= stepsSumm[ 2 ]: {
              let localPercent = ( percent - stepsSumm[ 1 ] ) / steps[ 2 ];
              return 487 + ( 532 - 487 ) * ( 1 - localPercent );
            }
            case percent <= stepsSumm[ 4 ]:
              return 487;
            case percent <= stepsSumm[ 5 ]: {
              let localPercent = ( percent - stepsSumm[ 4 ] ) / steps[ 5 ];
              return 487 + ( 500 - 487 ) * localPercent;
            }
            case percent <= stepsSumm[ 7 ]:
              return 500;
            case percent <= stepsSumm[ 8 ]: {
              let localPercent = ( percent - stepsSumm[ 7 ] ) / steps[ 8 ];
              return 500 + ( 320 - 500 ) * localPercent;
            }
            case percent <= stepsSumm[ 10 ]:
              return 320;
            case percent <= stepsSumm[ 11 ]: {
              let localPercent = ( percent - stepsSumm[ 10 ] ) / steps[ 11 ];
              return 320 + ( 444 - 320 ) * localPercent;
            }
            case percent <= stepsSumm[ 13 ]:
              return 444;
            case percent <= stepsSumm[ 14 ]: {
              let localPercent = ( percent - stepsSumm[ 13 ] ) / steps[ 14 ];
              return 444 + ( 324 - 444 ) * localPercent;
            }
            default:
              return 324;
          }
        })();

        let y = ( () => {
          switch( true ) {
            case percent <= steps[ 0 ]: {
              let localPercent = percent / steps[ 0 ];
              return 19 + ( 183 - 19 ) * ( 1 - localPercent );
            }
            case percent <= stepsSumm[ 1 ]:
              return 19;
            case percent <= stepsSumm[ 2 ]: {
              let localPercent = ( percent - stepsSumm[ 1 ] ) / steps[ 2 ];
              return 19 + ( 163 - 19 ) * localPercent;
            }
            case percent <= stepsSumm[ 4 ]:
              return 163;
            case percent <= stepsSumm[ 5 ]: {
              let localPercent = ( percent - stepsSumm[ 4 ] ) / steps[ 5 ];
              return 19 + ( 163 - 19 ) * ( 1 - localPercent );
            }
            case percent <= stepsSumm[ 7 ]:
              return 19;
            case percent <= stepsSumm[ 8 ]: {
              let localPercent = ( percent - stepsSumm[ 7 ] ) / steps[ 8 ];
              return 19 + ( 355 - 19 ) * localPercent;
            }
            case percent <= stepsSumm[ 10 ]:
              return 355;
            case percent <= stepsSumm[ 11 ]: {
              let localPercent = ( percent - stepsSumm[ 10 ] ) / steps[ 11 ];
              return 355 + ( 344 - 355 ) * localPercent;
            }
            case percent <= stepsSumm[ 13 ]:
              return 344;
            case percent <= stepsSumm[ 14 ]: {
              let localPercent = ( percent - stepsSumm[ 13 ] ) / steps[ 14 ];
              return 344 + ( 297 - 344 ) * localPercent;
            }
            default:
              return 297;
          }
        })();

        cursor.value = `left:${x}px;top:${y}px;`;
      }

      // Extensions icon
      extensionsIcon.value = ( ()/*: string*/ => {
        if( percent <= steps[ 0 ] ) {
          return 'opacity:0;';
        }
        if( percent <= stepsSumm[ 6 ] ) {
          return 'opacity:1;';
        }
        return 'opacity:0;';
      })();

      { // Extensions popup
        let value/*: number*/ = ( () => {
          if( percent <= steps[ 0 ] ) {
            return 0;
          }
          if( percent <= stepsSumm[ 1 ] ) {
            return ( percent - steps[ 0 ] ) / steps[ 1 ];
          }
          if( percent <= stepsSumm[ 6 ] ) {
            return 1;
          }
          return 0;
        })();

        extensionsPopup.value = `opacity:${value};`;
      }

      // Extensions popup pin hovered
      pinIconHover.value = ( ()/*: string*/ => {
        if( percent <= stepsSumm[ 3 ] ) {
          return 'opacity:0';
        }
        if( percent <= stepsSumm[ 4 ] ) {
          return 'opacity:1';
        }
        return 'opacity:0';
      })();

      // Extensions popup pin (not hovered)
      pinIcon.value = ( ()/*: string*/ => {
        if( percent <= stepsSumm[ 4 ] ) {
          return 'opacity:0';
        }
        if( percent <= stepsSumm[ 6 ] ) {
          return 'opacity:1';
        }
        return 'opacity:0';
      })();

      // Alternative search panel
      searchPanel.value = percent <= stepsSumm[ 3 ]
        ? 'opacity:0'
        : 'opacity:1';

      // Browsec icon
      browsecIcon.value = ( ()/*: string*/ => {
        if( percent <= stepsSumm[ 6 ] ) {
          return 'opacity:0;';
        }
        if( percent <= stepsSumm[ 9 ] ) {
          return 'opacity:1;';
        }
        return 'opacity:0;';
      })();

      // Browsec icon: UK
      browsecIconUk.value = ( ()/*: string*/ => {
        if( percent <= stepsSumm[ 9 ] ) {
          return 'opacity:0;';
        }
        if( percent <= stepsSumm[ 15 ] ) {
          return 'opacity:1;';
        }
        return 'opacity:0;';
      })();

      // Browsec icon: US
      browsecIconUs.value = ( ()/*: string*/ => {
        if( percent <= stepsSumm[ 15 ] ) {
          return 'opacity:0';
        }
        if( percent <= stepsSumm[ 16 ] ) {
          return 'opacity:1';
        }
        return 'opacity:1';
      })();

      // Browsec popup
      browsecPopup.value = ( ()/*: string*/ => {
        if( percent <= stepsSumm[ 6 ] ) {
          return '';
        }
        if( percent <= stepsSumm[ 7 ] ) {
          let localPercent = ( percent - stepsSumm[ 6 ] ) / steps[ 7 ];
          return `opacity:${localPercent};`;
        }
        return 'opacity:1;';
      })();

      { // Browsec popup switch off
        let value = ( ()/*: number*/ => {
          if( percent <= stepsSumm[ 6 ] ) {
            return 0;
          }
          if( percent <= stepsSumm[ 9 ] ) {
            return 1;
          }
          if( percent <= stepsSumm[ 10 ] ) {
            return 1 - ( percent - stepsSumm[ 9 ] ) / steps[ 10 ];
          }
          return 0;
        })();

        switchOff.value = `opacity:${value};`;
      }

      { // Browsec popup switch on
        let value = ( ()/*: number*/ => {
          if( percent <= stepsSumm[ 9 ] ) {
            return 0;
          }
          else if( percent <= stepsSumm[ 10 ] ) {
            return ( percent - stepsSumm[ 9 ] ) / steps[ 10 ];
          }
          return 1;
        })();

        switchOn.value = `opacity:${value};`;
      }

      // Browsec popup: no protection
      browsecPopupNoProtection.value = ( ()/*: string*/ => {
        if( percent <= stepsSumm[ 6 ] ) {
          return '';
        }
        if( percent <= stepsSumm[ 9 ] ) {
          return 'opacity:1;';
        }
        if( percent <= stepsSumm[ 10 ] ) {
          let localPercent = 1 - ( percent - stepsSumm[ 9 ] ) / steps[ 10 ];
          return `opacity:${localPercent};`;
        }
        return '';
      })();

      // Browsec popup: protection UK
      browsecPopupProtection.value = ( ()/*: string*/ => {
        if( percent <= stepsSumm[ 9 ] ) {
          return '';
        }
        else if( percent <= stepsSumm[ 10 ] ) {
          let localPercent = ( percent - stepsSumm[ 9 ] ) / steps[ 10 ];
          return `opacity:${localPercent};`;
        }
        else if( percent <= stepsSumm[ 11 ] ) {
          let localPercent = ( percent - stepsSumm[ 10 ] ) / steps[ 11 ];
          return localPercent < 0.7 ? 'opacity:1;' : '';
        }
        return '';
      })();

      // Browsec popup: protection UK hover
      browsecPopupProtectionHover.value = ( ()/*: string*/ => {
        if( percent <= stepsSumm[ 10 ] ) {
          return '';
        }
        if( percent <= stepsSumm[ 11 ] ) {
          let localPercent = ( percent - stepsSumm[ 10 ] ) / steps[ 11 ];
          return localPercent < 0.7 ? '' : 'opacity:1;';
        }
        if( percent <= stepsSumm[ 13 ] ) {
          let localPercent = 1 - ( percent - stepsSumm[ 12 ] ) / steps[ 13 ];
          return `opacity:${localPercent};`;
        }
        return '';
      })();

      // Browsec popup: smart settings
      browsecPopupSmartSettings.value = ( ()/*: string*/ => {
        if( percent <= stepsSumm[ 12 ] ) {
          return '';
        }
        if( percent <= stepsSumm[ 13 ] ) {
          let localPercent = ( percent - stepsSumm[ 12 ] ) / steps[ 13 ];
          return `opacity:${localPercent};`;
        }
        if( percent <= stepsSumm[ 14 ] ) {
          let localPercent = ( percent - stepsSumm[ 13 ] ) / steps[ 14 ];
          return localPercent > 0.7 ? '' : 'opacity:1';
        }
        return '';
      })();

      // Browsec popup: smart settings: hover
      browsecPopupSmartSettingsHover.value = ( ()/*: string*/ => {
        if( percent <= stepsSumm[ 13 ] ) {
          return '';
        }
        if( percent <= stepsSumm[ 14 ] ) {
          let localPercent = ( percent - stepsSumm[ 13 ] ) / steps[ 14 ];
          return localPercent > 0.7 ? 'opacity:1' : '';
        }
        if( percent <= stepsSumm[ 15 ] ) {
          return 'opacity:1;';
        }
        if( percent <= stepsSumm[ 16 ] ) {
          let localPercent = 1 - ( percent - stepsSumm[ 15 ] ) / steps[ 16 ];
          return `opacity:${localPercent};`;
        }
        return '';
      })();

      // Browsec popup: protection US
      browsecPopupProtectionUs.value = ( ()/*: string*/ => {
        if( percent <= stepsSumm[ 15 ] ) {
          return '';
        }
        if( percent <= stepsSumm[ 16 ] ) {
          let localPercent = ( percent - stepsSumm[ 15 ] ) / steps[ 16 ];
          return `opacity:${localPercent};`;
        }
        return 'opacity:1;';
      })();

      self.requestAnimationFrame( step );
    };
    self.requestAnimationFrame( step );
  });

  return { start };
};
