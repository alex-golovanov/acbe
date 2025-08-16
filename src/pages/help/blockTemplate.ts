import internationalize from 'tools/internationalize';
import MainBlock from './block';
import { html } from 'lit';

import '../components/header';


const translations: { [ key: string ]: string } = Object.fromEntries(
  Object.entries({
    // 1st block
    'enableForSelectedSites': 'enable_browsec_only_for_selected_sites',
    'enableForSelectedSitesDescription1':
      'enable_browsec_only_for_selected_sites_description_1',
    'enableForSelectedSitesDescription2':
      'enable_browsec_only_for_selected_sites_description_2',
    'enableForSelectedSitesDescription3':
      'enable_browsec_only_for_selected_sites_description_3',
  
    // 2nd block
    'enableForAllSitesExcludingSelected':
      'enable_browsec_for_all_sites_excluding_selected_sites',
    'enableForAllSitesExcludingSelectedDescription1':
      'enable_browsec_for_all_sites_excluding_selected_sites_description_1',
    'enableForAllSitesExcludingSelectedDescription2':
      'enable_browsec_for_all_sites_excluding_selected_sites_description_2',
    'enableForAllSitesExcludingSelectedDescription3':
      'enable_browsec_for_all_sites_excluding_selected_sites_description_3',
  
    // 3rd block
    'useDifferentLocationsForDifferentSites':
      'use_different_locations_for_different_sites',
    'useDifferentLocationsForDifferentSitesDescription1':
      'use_different_locations_for_different_sites_description_1',
    'useDifferentLocationsForDifferentSitesDescription2':
      'use_different_locations_for_different_sites_description_2',
    'useDifferentLocationsForDifferentSitesDescription3':
      'use_different_locations_for_different_sites_description_3',
  
    'howToUseSmartSettings': 'how_to_use_smart_settings',
    'iWantTo': 'i_want_to'
  }).map( ( [ key, value ] ) => ( [ key, internationalize( value ) ] ) )
);


/** @method */
export default function( this: MainBlock )/*: string*/ {
  // @ts-ignore
  const language = window.language as string;

  return html`
  <style>
  :host{
    display: block;
    height: 100%;
    min-height: 100%;
  }

  table{
    border-collapse: collapse;
  }
  td, th{
    padding: 0;
  }
  img{
    display: block;
  }

  .Main{
    position: relative;
    height: 100%;
    min-height: 100%;
    min-width:600px;
  }
  .Main > .T{
    position: absolute;
    top:0px;
    right:0px;
    left:0px;
  }

  .Main > .In{
    display: table;
    width: 100%;
    height: 100%;
  }
  .Main > .In > .In{
    display: table-cell;
    vertical-align: middle;
    padding: 215px 25px 35px;
  }

  .PageName{
    text-align: center;
    color: #494b4d;
    font-size: 24px;
    text-transform: uppercase;
    padding-top: 45px;
  }
  .PageName::after{
    content: '';
    display: block;
    width: 100px;
    overflow:hidden;font-size:0;text-indent:-9999px;height:0;
    padding-top: 4px;
    background: var( --brand-green );
    margin: 15px auto 0;
  }

  .Title{
    font-size: 33px;
    color: var( --brand-green );
    padding-bottom: 45px;
    text-align: center;
  }

  .Section{
    max-width: 850px;
    margin: 0 auto;
    border: 1px solid #a9b0b5;
    border-radius: 4px;
  }
  .Section + .Section{
    margin-top: 20px;
  }

  .Section_Name{
    color: #1c304e;
    font-size: 20px;
    position: relative;
    cursor: pointer;
    padding-right: 25px;
    border: 1px solid transparent;
    border-width: 22px 40px;
    background: url( '/images/help/arrow_down.svg' ) 0 -5000px no-repeat;
  }
  .Section_Name::after{
    content: '';
    display: block;
    width: 16px;
    overflow:hidden;font-size:0;text-indent:-9999px;height:0;
    padding-top: 9px;
    background: url( '/images/help/arrow_up.svg' ) 0 0 no-repeat;
    background-size: 100% 100%;
    position: absolute;
    top: 50%;
    right: 0;
    margin-top: -4px;
  }
  .Section.open .Section_Name::after{
    background-image: url( '/images/help/arrow_down.svg' );
  }

  .Section_Information{
    display: none;
    font-size: 16px;
    line-height: 1.5;
    padding: 8px 40px 40px;
  }
  .Section.open .Section_Information{
    display: block;
  }
  .Section_Information > table{
    width: 100%;
  }
  @media( max-width: 800px ){
    .Section_Information > table{
      display: block;
      width: auto;
    }
    .Section_Information > table > tbody{
      display: block;
    }
    .Section_Information > table > tbody > tr{
      display: block;
    }
    .Section_Information > table > tbody > tr > td{
      display: block;
    }
  }
  .Section_Information > table > tbody > tr > td:last-child{
    width: 1px;
    padding-left: 30px;
  }
  @media( max-width: 800px ){
    .Section_Information > table > tbody > tr > td:last-child{
      width: auto;
      padding-left: 0;
      padding-top: 30px;
    }
    .Section_Information > table > tbody > tr > td:last-child img{
      display: block;
      margin: 0 auto;
    }
  }

  .Section_Information ol{
    list-style: none;
    counter-reset: list;
  }
  .Section_Information ol > li{
    padding-left: 40px;
    position: relative;
  }
  .Section_Information ol > li::before{
    content: counter( list );
    counter-increment: list;
    position: absolute;
    top: -3px;
    left: 0;
    width: 28px;
    line-height: 28px;
    text-align: center;
    color: var( --brand-green );
    border: 1px solid var( --brand-green );
    border-radius: 50%;
  }
  .Section_Information ol > li + li{
    border-top: 10px solid transparent;
  }

  .Section_Text img{
    vertical-align: middle;
    padding-left: 3px;
  }

  .BigImage img{
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
  }
  </style>

  <div class="Main">
    <div class="T">
    <tab-header></tab-header>
      <div class="PageName">${
        translations.howToUseSmartSettings
     }</div>
    </div>

    <div class="In"><div class="In">
      <div class="Title">${
        translations.iWantTo
     }</div>
      <div class="Section" data-role="section">
        <div class="Section_Name" data-click="trigger">${
          translations.enableForSelectedSites
       }</div>
        <div class="Section_Information"><table><tbody><tr>
          <td>
            <div class="Section_Text">
              <ol>
                <li>
                  ${translations.enableForSelectedSitesDescription1}
                </li>
                <li>
                  ${translations.enableForSelectedSitesDescription2}
                </li>
                <li data-role="with image">
                  ${translations.enableForSelectedSitesDescription3}
                </li>
              </ol>
            </div>
          </td>
          <td>${( () => {
            if( language === 'ru' ) {
              return html`
            <img src="/images/help/1_ru.png" width="452" height="470" alt=""/>`;
            }
            
            return html`
            <img src="/images/help/1.png" width="474" height="526" alt=""/>`;
     })()}</td>
        </tr></tbody></table></div>
      </div>

      <div class="Section" data-role="section">
        <div class="Section_Name" data-click="trigger">${
          translations.enableForAllSitesExcludingSelected
       }</div>
        <div class="Section_Information"><table><tbody><tr>
          <td>
            <div class="Section_Text">
              <ol>
                <li>${
                  translations.enableForAllSitesExcludingSelectedDescription1
               }</li>
                <li>${
                  translations.enableForAllSitesExcludingSelectedDescription2
               }</li>
                <li data-role="with image">${
                  translations.enableForAllSitesExcludingSelectedDescription3
               }</li>
              </ol>
            </div>
          </td>
          <td>${( () => {
            if( language === 'ru' ) {
              return html`
            <img src="/images/help/2_ru.png" width="452" height="470" alt=""/>`;
            }
            
            return html`
            <img src="/images/help/2.png" width="474" height="526" alt=""/>`;
     })()}</td>
        </tr></tbody></table></div>
      </div>

      <div class="Section" data-role="section">
        <div class="Section_Name" data-click="trigger">${
          translations.useDifferentLocationsForDifferentSites
       }</div>
        <div class="Section_Information"><table><tbody><tr>
          <td>
            <div class="Section_Text">
              <ol>
                <li>
                  ${translations.useDifferentLocationsForDifferentSitesDescription1}
                </li>
                <li>
                  ${translations.useDifferentLocationsForDifferentSitesDescription2}
                </li>
                <li data-role="with image">
                  ${translations.useDifferentLocationsForDifferentSitesDescription3}
                </li>
              </ol>
            </div>
          </td>
          <td>${( () => {
            if( language === 'ru' ) {
              return html`
            <img src="/images/help/3_ru.webp" width="452" height="470" alt=""/>`;
            }
            
            return html`
            <img src="/images/help/3.png" width="474" height="526" alt=""/>`;
     })()}</td>
        </tr></tbody></table></div>
      </div>

    </div></div>
  </div>`;
};
