import internationalize from 'tools/internationalize';
import MainBlock from './blockModern';
import { html } from 'lit';
import jitsu from 'jitsu';


const translations: { [ key: string ]: string } = Object.fromEntries(
  Object.entries({
    'browsecHasBeenInstalled': 'browsec_has_been_installed',
    'clickAndThen1': 'click_and_then_1',
    'clickAndThen2': 'click_and_then_2',
    'pinTheBrowsecExtension': 'pin_the_browsec_extension',
    'youMayNowOpenTheExtension': 'you_may_now_open_the_extension',
    'subscriberText': 'subscriber_text'
  }).map( ( [ key, value ] ) => ( [ key, internationalize( value ) ] ) )
);

let tgUrl: string;
const _browser = typeof browser !== 'undefined' ? browser : chrome;
const locale = _browser.i18n.getUILanguage();

if( locale === 'ru' ) {
  tgUrl = 'https://t.me/BrowsecVPNru';
} else {
  tgUrl = 'https://t.me/BrowsecVPNofficial';
}

function onSubscribeClick() {
  jitsu.track( 'congrats_tab_tgclick' );
}

/** @method */
export default function( this: MainBlock ) {
  return html`
  <style>
  :host{
    display: block;
  }
  :host > .In{
    padding: 27px 0 0;
    position: relative;
  }

  .Plate{
    background: #262829;
    width: 610px;
    padding: 25px 35px 15px;
    margin: 0 auto;
  }

  .BrowsecInstalled{
    text-align: center;
    font-size: 24px;
    font-weight: bold;
  }
  .BrowsecInstalled::before{
    content: '';
    display:block;
    width:85px;
    padding-top: 86px;
    height:0;
    background: url( '/images/checked_2.svg' );
    margin: 0 auto 20px;
  }

  .Decription{
    padding: 20px 0 30px;
    text-align: center;
  }

  .Image{
    margin: 0 -16px;
    padding: 10px 0 40px;
  }

  .Pointer{
    position: absolute;
    top: 0;
    right: 132px;
    width: 190px;
    font-size: 18px;
  }
  .Pointer.withScroll{
    right: 115px;
  }
  .Pointer::before{
    content: '';
    display: block;
    background: rgba(28, 30, 31, 0.6);
    position: absolute;
    top: 0;
    right: -25px;
    left: -25px;
    bottom: -10px;
  }
  .Pointer > .In{
    position: relative;
    padding: 110px 0 0;
  }
  .Pointer_Arrow{
    position: absolute;
    height: 65px;
    top: 30px;
    right: 0;
    left: 0;
    border: 1px solid #fff;
    border-width: 0 1px 1px 0;
    border-radius: 0 0 8px 0;
  }
  .Pointer_Arrow::before,
  .Pointer_Arrow::after{
    content: '';
    display: block;
    height: 17px;
    width: 1px;
    background: #fff;
    position: absolute;
    top:0;
    right:-1px;
  }
  .Pointer_Arrow::before{
    transform-origin: top left;
    transform: rotate(-45deg);
  }
  .Pointer_Arrow::after{
    transform-origin: top right;
    transform: rotate(45deg);
  }
  .Pointer_Title{
    text-align: center;
  }
  .Pointer_Text{
    text-align: center;
    padding: 17px 0 0;
    margin: 0 -20px;
  }

  .Pointer_Icon{
    display: inline-block;
    vertical-align: bottom;
    margin: 0 2px;
  }
  .Pointer_Icon.extensions{
    background: url( '/images/congratulations/extensions_icon_3.svg' );
    background-size: contain;
    background-repeat: no-repeat;
    width: 31px;
    height: 30px;
  }
  .Pointer_Icon.pin{
    background: url( '/images/congratulations/pin.svg' );
    background-size: contain;
    background-repeat: no-repeat;
    width: 22px;
    height: 29px;
  }

  .Subscriber {
    border-radius: 8px;
    overflow: hidden;
    display: block;
    text-decoration: none;
  }

  .Subscriber > .In {
    padding: 10px;
    background: #F8F8F8;
    color: #222;
    display: flex;
    flex-direction: row;
    align-items: center;
    text-align: center;
    font-size: 14px;
    transition: background 0.3s;
    gap: 20px;
  }

  .Subscriber:hover > .In {
    background:rgb(217, 217, 217);
  }

  .Subscriber .Subscriber_Text {
    order: 2;
  }

  .Subscriber .Subscriber_Img {
    background: url('/images/congratulations/telegram-logo.svg');
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    width: 36px;
    height: 36px;
  }

  @media (min-width: 1410px) {
    .Subscriber {
      position: absolute;
      top: 300px;
      right: 60px;
      width: 290px;
    }

    .Subscriber > .In {
      flex-direction: column;
      gap: 0;
    }

    .Subscriber .Subscriber_Text {
      order: 0;
      margin-bottom: 10px;
    }
  }
  </style>

  <div class="In">
    <div class="Plate">
      <div class="BrowsecInstalled">${translations.browsecHasBeenInstalled}</div>
      <div class="Decription">${translations.youMayNowOpenTheExtension}</div>

      <a class="Subscriber" href="${tgUrl}" target="_blank" rel="noopener" @click="${onSubscribeClick}">
        <div class="In">
          <div class="Subscriber_Text">${translations.subscriberText}</div>
          <div class="Subscriber_Img"></div>
        </div>
      </a>

      <div class="Image">
        <use-animation></use-animation>
      </div>
    </div>

    <div class="Pointer ${this.withScroll ? 'withScroll' : ''}">
      <div class="In">
        <div class="Pointer_Arrow"></div>
        <div class="Pointer_Title">${translations.pinTheBrowsecExtension}</div>
        <div class="Pointer_Text">
          ${translations.clickAndThen1}
          <div class="Pointer_Icon extensions"></div>
          ${translations.clickAndThen2}
          <div class="Pointer_Icon pin"></div>
        </div>
      </div>
    </div>
  </div>`;
};
