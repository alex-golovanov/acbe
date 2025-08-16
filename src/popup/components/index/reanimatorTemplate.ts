import globalStyle from '../globalStyle';
import IndexReanimator from './reanimator';
import { html } from 'lit';
import createTranslation from '../../tools/createTranslationObject';

const translations: { [key: string]: string } = createTranslation({
  'reanimatorReconnecting': 'reanimator_reconnecting',
  'reanimatorStep': 'reanimator_step',
  'reanimatorOf': 'reanimator_of'
});

export default function( this: IndexReanimator ) { // @ts-ignore
  return html`
  <style>
  ${globalStyle}

  :host > .In{
    display: flex;
    align-items: center;
    height: 100%;
  }
  :host > .In > .In{
    width: 100%;
    flex-grow: 0;
  }

  .Icon{
    content: '';
    display:block;
    background: url( '/images/global_protection_disabled.svg' ) 50% 0 no-repeat;
    background-size: auto 100%;
    width: 100%;
    overflow:hidden;font-size:0;text-indent:-9999px;height:0;
    padding-top:114px;
  }

  .Text{
    text-align: center;
    font-size: 18px;
    font-weight: 600;
    padding-top: 40px;
    color: #7F7F7F;
  }

  .Reconnecting > .In{
    display: inline-block;
    vertical-align: top;
    position: relative;
  }
  .Dots{
    position: absolute;
    left: calc(100% + 0.3em);
    top: 0;
  }

  @keyframes fade {
    0%, 100% {
      opacity: 0;
    }
    20%, 80% {
      opacity: 1;
    }
  }
  .Dot{
    opacity: 0;
    animation: fade 1.5s infinite;
  }
  .Dot:nth-child(2) {
    animation-delay: 0.3s;
  }
  .Dot:nth-child(3) {
    animation-delay: 0.6s;
  }
  </style>

  <div class="In"><div class="In">
    <div class="Icon"></div>
    <div class="Text">
      <div class="Reconnecting"><div class="In">
        ${translations.reanimatorReconnecting}
        <div class="Dots"><span class="Dot">.</span><span class="Dot">.</span><span class="Dot">.</span></div>
      </div></div>
      <div>${translations.reanimatorStep} ${this.step} ${translations.reanimatorOf} 5</div>
    </div>
  </div></div>`;
};
