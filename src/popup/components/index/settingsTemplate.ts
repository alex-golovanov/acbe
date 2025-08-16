import createTranslation from '../../tools/createTranslationObject';
import globalStyle from '../globalStyle';
import IndexSettings from './settings';
import { html } from 'lit';


const translations: { [ key: string ]: string } = createTranslation({
  'changeTimezoneByVirtualLocation':
    'change_timezone_according_to_virtual_location',
  'dontShowPromoOffers': 'dont_show_promo_offers',
  'healthCheck': 'health_check',
  'removeCacheOnAuthPopups':
    'remove_cache_on_authorization_popups',
  'useBrowsecForWebrtcConnections':
    'use_browsec_for_webrtc_connections',
  'webrtcSettingsControlledByAnotherExtension':
    'webrtc_settings_controlled_by_another_extension',
  'dontSendTelemetry':
    'dont_send_telemetry'
});


export default function( this: IndexSettings ) {
  const isFirefox = typeof browser !== 'undefined';
  const fontSize = 16; // for more items in Settings fontSize 14 can be used
  
  return html`
  <style>
  ${globalStyle}
  .Checkboxes{
    padding: 17px 0 25px;
    font-size: ${fontSize}px;
  }
  .Checkboxes > .E{
    position: relative;
    padding: 8px 20px;
  }
  .Checkboxes > .E.disabled{
    opacity: 0.5;
  }
  .Checkboxes > .E.highlighted{
    background: #f0f5f0;
  }
  .Checkboxes > .E > .In{
    display:inline-block;vertical-align:top;
  }
  .Checkboxes > .E > .In::after{
    content:' ';clear:both;display:block;width:0;height:0;overflow:hidden;font-size:0;
  }
  .Checkboxes > .E > .In > checkbox-switch{
    float: left;
  }
  .Checkboxes > .E > .In > .R{
    margin-left: 55px;
  }
  .Checkboxes > .E > .In > .Crown + .R{
    padding-right: 25px;
  }
  .Checkboxes > .E.hasInfo > .In > .R{
    margin-right: 26px;
  }

  .Information{
    display: inline-block;
    vertical-align: top;
    position: relative;
    width: 0;
    height: 0;
  }
  .Information > .In{
    position: absolute;
    left: 0;
    top: 0;
    background: url( '/images/information_grey.svg' ) 0 0 no-repeat;
    background-size: 100% 100%;
    width: ${fontSize}px;
    padding-top: ${fontSize}px;
    overflow:hidden;font-size:0;text-indent:-9999px;height:0;
    cursor: pointer;
    margin: ${fontSize === 16 ? 4 : 3}px 0 0 ${fontSize - 6}px;
  }
  .Information > .In:hover{
    background-image: url( '/images/information_green.svg' );
  }
  .Information > .In::after{
    content: '';
    display: block;
    background: url( '/images/information_green.svg' ) 0 -5000px no-repeat;
    width: 1px;
    height: 1px;
    overflow: hidden;
    position: absolute;
    left: 0;
    top: 0;
  }

  .Crown{
    background: url( '/images/crown.svg' ) 0 0 no-repeat;
    background-size: 100% 100%;
    width: 18px;
    overflow:hidden;font-size:0;text-indent:-9999px;height:0;
    padding-top: 18px;
    position: absolute;
    right: 20px;
    top: 10px;
  }

  .Error{
    clear: both;
    padding: 2px 0 0 55px;
    color: #c00;
    font-size: 12px;
  }


  .HealthCheck{
    display: flex;
    justify-content: center;
    position: absolute;
    bottom: 25px;
    left: 25px;
    right: 25px;
    text-align: center;
  }
  .HealthCheck_Button{
    flex-grow: 0;
    flex-shrink: 0;
    position: relative;
    font-size: ${fontSize - 2}px;
    line-height: 2.714;
    padding: 0 30px 0 50px;
    border: 1px solid var( --brand-blue );
    border-radius: 4px;
    color: #494b4d;
    cursor: pointer;
    text-align: left;
  }
  .HealthCheck_Button::after{
    content: '';
    display: block;
    background: url( '/images/diagnostics.svg#health_blue' ) 0 0 no-repeat;
    width: 19px;
    padding-top: 16px;
    height: 0;
    overflow: hidden;
    position: absolute;
    top: calc(50% - 16px / 2);
    left: 23px;
  }
  </style>

  <div class="Checkboxes">
  ${( () => {
    if( !this.webrtcAvailable ) return '';
    return html`
    <div class="E hasInfo ${this.webrtcNotEnoughPermissions ? 'highlighted' : ''}"><div class="In">
      <checkbox-switch
        .checked="${this.webrtcBlocked}"
        @click="${this.changeWebrtc}">
      </checkbox-switch>
      <div class="R"><!--
     --><label @click="${this.changeWebrtc}">${
          translations.useBrowsecForWebrtcConnections
       }</label><!--
     --><div class="Information">
          <div class="In" @click="${this.showWebrtcHelp}"></div>
        </div><!--
   --></div>
        ${( () => {
      if( !this.webrtcBlockedByOtherExtension ) return '';
      return html`
      <div class="Error">
        ${translations.webrtcSettingsControlledByAnotherExtension}
      </div>`;
    })()}
    </div></div>`;
  })()}

    <div class="E hasInfo ${this.changeDateDisabledClass} ${this.changeDateFirstTimeClass}"><div class="In">
      <checkbox-switch
        .checked="${this.hideDate}"
        data-changedate="true"
        @mouseover="${this.changeDateMouseover}"
        @click="${this.changeDate}">
      </checkbox-switch>
      <div class="Crown"></div>
      <div class="R"><!--
     --><label
          data-changedate="true"
          @mouseover="${this.changeDateMouseover}"
          @click="${this.changeDate}">${
            translations.changeTimezoneByVirtualLocation
         }</label><!--
     --><div class="Information">
          <div class="In" @click="${this.showDateHelp}"></div>
        </div><!--
   --></div>
    </div></div>

    <div class="E"><div class="In">
      <checkbox-switch
        .checked="${this.blockPromos}"
        data-changedate="true"
        @click="${this.changeBlockPromos}">
      </checkbox-switch>
      <div class="R"><!--
     --><label
          data-changedate="true"
          @click="${this.changeBlockPromos}">${
            translations.dontShowPromoOffers
       }</label><!--
   --></div>
    </div></div>

    ${( () => {
      if( typeof browser !== 'undefined' ) return '';

      return html`
    <div class="E"><div class="In">
      <checkbox-switch
        .checked="${this.cacheRemoval}"
        data-changedate="true"
        @click="${this.changeCacheRemoval}">
      </checkbox-switch>
      <div class="R"><!--
     --><label
          data-changedate="true"
          @click="${this.changeCacheRemoval}">${
            translations.removeCacheOnAuthPopups
       }</label><!--
   --></div>
    </div></div>`;
    })()}

    ${( () => {
      if( !isFirefox ) return '';
      // setting for Firefox
      return html`
    <div class="E"><div class="In">
      <checkbox-switch
        .checked="${this.dontSendTelemetry}"
        data-changedate="true"
        @click="${this.changeDontSendTelemetry}">
      </checkbox-switch>
      <div class="R"><!--
     --><label
          data-changedate="true"
          @click="${this.changeDontSendTelemetry}">${
            translations.dontSendTelemetry
       }</label><!--
   --></div>
    </div></div>`;
    })()}

  <div class="HealthCheck">
    <div class="HealthCheck_Button" @click="${this.openDiagnostics}">${
      translations.healthCheck
   }</div>
  </div>`;
};
