import Browser from 'crossbrowser-webextension';
import log from 'log';


/**
@function
@param url - 255 symbols maximum */
export default async( url: string ): Promise<void> => {
  try {
    await Browser.runtime.setUninstallURL( url );
  }
  catch ( error ) {
    log.error( error );
  }
};
