/* global DiagnosticsStepState */
import globalStyle from './globalStyle';
import internationalize from 'tools/internationalize';
import { html } from 'lit';

import '../components/header';

const translations: { [ key: string ]: string } = Object.fromEntries(
  Object.entries({
    'checkConflictsWithOtherExtensions':
      'check_conflicts_with_other_extensions',
    'checkBrowsecApi': 'check_browsec_api',
    'checkHttpInternetConnection':
      'check_http_internet_connection',
    'checkHttpInternetConnectionWithBrowsec':
      'check_http_internet_connection_with_browsec',
    'checkHttpsInternetConnection':
      'check_https_internet_connection',
    'checkHttpsInternetConnectionWithBrowsec':
      'check_https_internet_connection_with_browsec',
    'checkProxySettings': 'check_proxy_settings',
    'closePage': 'close_page',
    'fixIt': 'fix_it',
    'running': 'running_dots',
    'start': 'start',
    'tryAgain': 'try_again',
    'weHaveDetectedOtherExtensionsWhichBlockAccess':
      'we_have_detected_other_extensions_which_block_access',
    'weHaveDetectedOtherExtensionsWhichCanConflict':
      'we_have_detected_other_extensions_which_can_conflict',
    'youCanEnableTheseExtensionsLater':
      'you_can_enable_these_extensions_later',
  }).map( ( [ key, value ] ) => ( [ key, internationalize( value ) ] ) )
);


/** @function */
const extensionsVisibleForSection = (
  state: DiagnosticsStepState[],
  visible: boolean,
  section: string
): boolean => {
  if( !visible ) return false;

  let proxyApiStepState = state.find( ({ name }) => name === 'proxyApi' );
  if( !proxyApiStepState ) return true; // Firefox only

  // If proxy contol state error -> show only for 'proxyApi'
  let proxyApiBroken/*: boolean*/ = proxyApiStepState.state === 'error';

  return proxyApiBroken === ( section === 'proxyApi' );
};

/** @function */
const stepClass = (
  stepStates: DiagnosticsStepState[], stepName: string
): string => {
  let state = stepStates.find( ({ name }) => name === stepName )?.state;

  switch( state ) {
    case 'not started': return '';
    case 'in process': return 'progress';
    case 'success': return 'success';
    case 'partial': return 'partial';
    case 'error': return 'error';
    default: return '';
  }
};

/** @function */
const stepCompletion = (
  state: DiagnosticsStepState[], stepName: string
): string => {
  let requests = state.find( ({ name }) => name === stepName )?.requests;
  if( !requests ) return '';

  let { success, total } = requests;
  if( !success || success === total ) return '';

  return success + '/' + total;
};

/** @function */
const stepState = (
  state: DiagnosticsStepState[],
  stepName: string
): string => {
  let step = state.find( ({ name }) => name === stepName );
  if( !step ) throw new Error( `Step ${stepName} not found!` );

  return step.state;
};


/** @method */
export default function(
  this: any,
  { possibleSteps }: { 'possibleSteps': string[] }
) {
  return html`
  <style>
  ${globalStyle}
  :host{
    display: block;
    font-size: 14px;
  }

  input[type="button"]{
    display: block;
    margin: 0 auto;
    padding: 0px 70px;
    border: 0;
    font-size: 18px;
    height: 48px;
    color: #fff;
    background: var( --brand-green );
    border-radius: 4px;
    cursor: pointer;
  }

  .MainStatus{
    padding-top: 30px;
    text-align: center;
  }
  .MainStatus_Running,
  .MainStatus_Complete{
    display:inline-block;
    vertical-align:top;
    padding: 0px 70px;
    font-size: 18px;
    line-height: 48px;
    background: #e9eaee;
    border-radius: 4px;
  }

  .Steps{
    margin-top: 55px;
    border: 1px solid #a8afb5;
    padding: 40px 30px 40px 20px;
    border-radius: 3px;
    overflow: hidden;
  }
  @media( max-width: 479px ){
    padding: 30px 20px 30px 15px;
  }
  .Steps > .E{
    position: relative;
  }
  .Steps > .E::after{
    content:' ';clear:both;display:block;width:0;height:0;overflow:hidden;font-size:0;
  }
  .Steps > .E ~ .E{
    border-top: 16px solid transparent;
  }
  .Steps > .E::before{
    content: '';
    display: block;
    background: #e6e6e6;
    position: absolute;
    top: -500px;
    left: 114px;
    width: 2px;
    overflow:hidden;
    font-size:0;
    text-indent:-9999px;
    height:0;
    padding-top: 500px;
  }
  .Steps > .E:first-child::before{
    background: #fff;
    z-index: 2;
  }
  .Steps step-state{
    float: left;
  }
  .Steps_Name{
    font-size: 16px;
    color: #4c4c4c;
    overflow: hidden;
    padding: 5px 0 0 25px;
    line-height: 1.3;
  }
  @media( max-width: 479px ){
    .Steps_Name{
      padding-left: 15px;
    }
  }

  .Extensions{
    padding: 16px 0 0 114px;
    clear: both;
    position: relative;
  }
  .Extensions::after{
    content: '';
    display: block;
    position: absolute;
    top: 0;
    left: 114px;
    width: 2px;
    padding-top:16px;
    overflow:hidden;font-size:0;text-indent:-9999px;height:0;
    background: #e6e6e6;
  }
  .Extensions > .In{
    border-left: 2px solid #e6e6e6;
    background: #f7f7f7;
    padding: 27px 40px;
    border-radius: 0 4px 4px 0;
  }
  .Extensions_Text{
    padding-bottom: 15px;
  }
  .Extensions_Later{
    font-size: 12px;
    color: #808080;
    padding-top: 10px;
  }

  c-summary{
    padding-top: 55px;
  }

  .FinalActionButton{
    text-align: center;
    padding-top: 35px;
  }
  .FinalActionButton input[type="button"]{
    display: block;
    margin: 0 auto;
    border: 0;
    cursor: pointer;
    padding: 0 65px;
    height: 48px;
    color: #fff;
    background: var( --brand-green );
    border-radius: 4px;
    font-size: 18px;
  }

  c-logs{
    padding-top: 50px;
  }
  </style>

  <div class="MainStatus">
  ${( () => {
    if( !this.noStepsStarted ) return '';
    return html`
    <div class="MainStatus_Button">
      <input
        type="button"
        value="${translations.start}"
        @click="${this.startDiagnostics}"
      />
    </div>`;
  })()}

  ${( () => {
    if( !this.runningSteps ) return '';
    return html`
    <div class="MainStatus_Running">${translations.running}</div>`;
  })()}

  ${( () => {
    if( !this.allStepsComplete ) return '';
    return html`
    <div class="MainStatus_Button">
      <input
        type="button"
        value="${translations.tryAgain}"
        @click="${this.startDiagnostics}"
      />
    </div>`;
  })()}
  </div>

  <div class="Steps">
  ${( () => {
    if( !possibleSteps.includes( 'proxyApi' ) ) return '';
    return html`
    <div class="E ${stepClass( this.state, 'proxyApi' )}">
      <step-state
        .state="${stepState( this.state, 'proxyApi' )}"
        .completion="${stepCompletion( this.state, 'proxyApi' )}"></step-state>
      <div class="Steps_Name">${translations.checkProxySettings}</div>
    ${( () => {
      if( !extensionsVisibleForSection( this.state, this.extensionsVisible, 'proxyApi' ) ) return '';

      return html`
      <div class="Extensions"><div class="In">
        <div class="Extensions_Text">${
          translations.weHaveDetectedOtherExtensionsWhichBlockAccess
       }</div>
        <c-extensions
          .extensions="${this.extensions}"
          @extensions-update="${this.extensionsUpdate}"></c-extensions>
        <div class="Extensions_Later">${
          translations.youCanEnableTheseExtensionsLater
       }</div>
      </div></div>`;
    })()}
    </div>`;
  })()}

  ${( () => {
    if( !possibleSteps.includes( 'noProxyExtensions' ) ) return '';
    return html`
    <div class="E ${stepClass( this.state, 'noProxyExtensions' )}">
      <step-state
        .state="${stepState( this.state, 'noProxyExtensions' )}"
        .completion="${stepCompletion( this.state, 'noProxyExtensions' )}"></step-state>
      <div class="Steps_Name">${
        translations.checkConflictsWithOtherExtensions
     }</div>
    ${( () => {
      if( !extensionsVisibleForSection( this.state, this.extensionsVisible, 'noProxyExtensions' ) ) return '';
      return html`
      <div class="Extensions"><div class="In">
        <div class="Extensions_Text">${
          translations.weHaveDetectedOtherExtensionsWhichCanConflict
       }</div>
        <c-extensions
          .extensions="${this.extensions}"
          @extensions-update="${this.extensionsUpdate}"></c-extensions>
        ${( () => {
          if( typeof browser !== 'undefined' ) return '';

          return html`
          <div class="Extensions_Later">${
            translations.youCanEnableTheseExtensionsLater
         }</div>`;
        })()}
      </div></div>`;
    })()}
    </div>`;
  })()}

  ${( () => {
    if( !possibleSteps.includes( 'httpConnection' ) ) return '';
    return html`
    <div class="E ${stepClass( this.state, 'httpConnection' )}">
      <step-state
        .state="${stepState( this.state, 'httpConnection' )}"
        .completion="${stepCompletion( this.state, 'httpConnection' )}"></step-state>
      <div class="Steps_Name">${translations.checkHttpInternetConnection}</div>
    </div>`;
  })()}

    ${( () => {
    if( !possibleSteps.includes( 'httpsConnection' ) ) return '';
    return html`
    <div class="E ${stepClass( this.state, 'httpsConnection' )}">
      <step-state
        .state="${stepState( this.state, 'httpsConnection' )}"
        .completion="${stepCompletion( this.state, 'httpsConnection' )}"></step-state>
      <div class="Steps_Name">${translations.checkHttpsInternetConnection}</div>
    </div>`;
  })()}

  ${( () => {
    if( !possibleSteps.includes( 'browsecApi' ) ) return '';
    return html`
    <div class="E ${stepClass( this.state, 'browsecApi' )}">
      <step-state
        .state="${stepState( this.state, 'browsecApi' )}"
        .completion="${stepCompletion( this.state, 'browsecApi' )}"></step-state>
      <div class="Steps_Name">${translations.checkBrowsecApi}</div>
    </div>`;
  })()}

  ${( () => {
    if( !possibleSteps.includes( 'httpProxyConnection' ) ) return '';
    return html`
    <div class="E ${stepClass( this.state, 'httpProxyConnection' )}">
      <step-state
        .state="${stepState( this.state, 'httpProxyConnection' )}"
        .completion="${stepCompletion( this.state, 'httpProxyConnection' )}"></step-state>
      <div class="Steps_Name">${
        translations.checkHttpInternetConnectionWithBrowsec
     }</div>
    </div>`;
  })()}

  ${( () => {
    if( !possibleSteps.includes( 'httpsProxyConnection' ) ) return '';
    return html`
    <div class="E ${stepClass( this.state, 'httpsProxyConnection' )}">
      <step-state
        .state="${stepState( this.state, 'httpsProxyConnection' )}"
        .completion="${stepCompletion( this.state, 'httpsProxyConnection' )}"></step-state>
      <div class="Steps_Name">${
        translations.checkHttpsInternetConnectionWithBrowsec
     }</div>
    </div>`;
  })()}
  </div>

  ${( () => { // <template id="AllStepsComplete" is="dom-if" if="[[allStepsComplete]]">
    if( !this.allStepsComplete ) return '';

    return html`
    <c-summary
      .fixable="${this.extensionsVisible}"
      .blockedByAntivirus="${this.blockedByAntivirus}"
      .state="${this.state}"></c-summary>
    ${( () => {
      if( this.extensionsVisible ) {
        return html`
    <div class="FinalActionButton">
      <input
        type="button"
        value="${translations.fixIt}"
        @click="${this.fixExtensions}"
      />
    </div>`;
      }

      if( this.blockedByAntivirus ) {
        return html`
    <div class="FinalActionButton">
      <input
        type="button"
        value="${translations.tryAgain}"
        @click="${this.startDiagnostics}"
      />
    </div>`;
      }

      return html`
      <div class="FinalActionButton">
        <input
          type="button"
          value="${translations.closePage}"
          @click="${this.closePage}"
        />
      </div>`;
    })()}
    <c-logs></c-logs>`;
  })()}`;
};
