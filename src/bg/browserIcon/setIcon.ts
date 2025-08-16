import browserAction from './browserAction';


/** @function */
const generateIconSet = ( fileName: string ) => ({
  'path': {
    '16': 'images/icons/16x16' + fileName,
    '19': 'images/icons/19x19' + fileName,
    '24': 'images/icons/24x24' + fileName,
    '32': 'images/icons/32x32' + fileName,
    '38': 'images/icons/38x38' + fileName
  }
});


/** @function */
export default (
  type: 'disabled' | 'disabled notification' | 'enabled' | 'enabled notification' | 'error'
): void => {
  const iconPath: string = ( () => {
    switch( type ) {
      case 'disabled':
        return '/disabled.png';
      case 'disabled notification':
        return '/disabled_notification.png';
      case 'enabled':
        return '/enabled.png';
      case 'enabled notification':
        return '/enabled_notification.png';
      case 'error':
        return '/error.png';
      default:
        throw new Error( `Incorrect type ${type} in setIcon` );
    }
  })();

  browserAction.setIcon( generateIconSet( iconPath ) );
};
