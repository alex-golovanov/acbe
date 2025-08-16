import Browser from 'crossbrowser-webextension';
import generate from './generate';


const alarmsPermission: boolean =
  Browser.runtime.getManifest().permissions.includes( 'alarms' );


export default alarmsPermission
  ? generate( Browser.alarms )
  : generate();
