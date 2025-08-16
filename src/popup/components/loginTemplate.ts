import globalStyle from './globalStyle';
import MainLogin from './login';
import { html } from 'lit';


/** @method */
export default function( this: MainLogin ) {
  // @ts-ignore
  const language = window.language as string;
  
  return html`
  <style>
  ${globalStyle}
  @keyframes rotating {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  a:hover{
    text-decoration: none;
  }

  :host{
    display: block;
  }

  .Login{
    padding: ${language === 'ru' ? '30px' : '38px'} 12px 2px;
    font-size: 14px;
    min-height: 140px;
    height: 318px;
    font-size: 11px;
  }

  .Title{
    font-size: 20px;
    font-weight: 500;
    text-align: center;
  }
  .Title::after{
    display: block;
    content: '';
    width: 100px;
    margin: 0 auto;
    overflow:hidden;font-size:0;text-indent:-9999px;height:0;
    padding-top:20px;
    border-bottom: 4px solid var( --brand-green );
  }

  .Notice {
    position: absolute;
    font-size: 13px;
    color: #090;
    top: -24px;
    width: 100%;
    left: -2px;
  }
  .Error {
    position: absolute;
    bottom: calc(100% + ${language === 'ru' ? '5px' : '6px'});
    left: 20px;
    right: 20px;
    font-size: 13px;
    line-height: 15px;
    color: var( --brand-burgundy );
    text-align: center;
  }

  .Login input[type="text"],
  .Login input[type="password"] {
    display: block;
    box-sizing: border-box;
    font:100% arial,sans-serif;
    vertical-align:middle;
    outline:none;
    /*width: 315px;*/
    width: 100%;
    margin: 1px 0px;
    height: 40px;
    border-radius: 5px;
    padding: 1px 10px;
    font-size: 15px;
    outline: none;
    background: #f5f5f5;
    border: 1px #7b7c80 solid;
    color: #1c304e;
  }
  .Login input[type="text"]::placeholder,
  .Login input[type="password"]::placeholder {
    color: #9b9c9e;
  }
  .Login input[type="text"].invalid,
  .Login input[type="password"].invalid{
    border: 1px solid var( --brand-burgundy );
  }
  .Login input[type="text"].invalid:focus,
  .Login input[type="password"].invalid:focus{
    outline: none;
  }

  .Login_Form{
    margin:0;
    padding:0;
    border-style:none;
    margin-top: ${language === 'ru' ? '54px' : '46px'};
    text-align: center;
    padding: 0 20px;
    position:relative;
  }
  @media( max-width: 401px ){
    .Login_Form{
      padding: 0 10px;
    }
  }

  .Login_Row{
    width:100%;
    padding: 0 0 14px;
  }
  .Login_Row::after{
    display:block;
    clear:both;
    content:'';
  }
  .Login_Row label{
    box-sizing: border-box;
    display: inline-block;
    min-width: 100px;
    padding: 6px 5px 0 0;
  }

  .Login_ForgotPassword {
    color: #1c304e;
    font-size: 12px;
    line-height: 1;
    margin-top: 3px;
    float: right;
  }

  .Login_Button{
    margin-top: 18px;
  }
  .Login_Button > .In{
    display: inline-block;
    vertical-align: top;
    position: relative;
  }
  .Login_Button.loading > .In::after{
    content: '';
    display: block;
    position: absolute;
    left: 12px;
    top: calc(50% - 12px);
    width: 24px;
    padding-top: 24px;
    overflow: hidden;
    height: 0;
  }
  .Login_Button_Overlay{
    display: none;
    position: absolute;
    left: 9px;
    top: calc(50% - 15px);
    width: 24px;
    padding-top: 24px;
    height: 0;
    overflow: hidden;
    background:
      #fff radial-gradient(circle at 80% 80%, #1c304e 0, #1c304e 13%, transparent 90%, transparent 100%);
    border-radius: 50%;
    border: 3px solid #1c304e;
    animation: rotating 1.2s linear infinite;
  }
  .Login_Button.loading .Login_Button_Overlay{
    display: block;
  }
  .Login_Button_Overlay::after{
    content: '';
    display: block;
    position: absolute;
    width: 16px;
    padding-top: 16px;
    height: 0;
    overflow: hidden;
    top: calc( 50% - 16px / 2 );
    left: calc( 50% - 16px / 2 );
    background: #1c304e;
    border-radius: 50%;
  }

  .Login_Button button{
    box-sizing: border-box;
    display: inline-block;
    border: 0;
    border-radius: 5px;
    position:relative;
    background-color: #1c304e;
    color:#fff;
    text-align:center;
    font-family: inherit;
    font-weight: 400;
    padding: 2px 12px;
    font-size: 18px;
    line-height: 30px;
    height: 45px;
    cursor:pointer;
    min-width: 190px;
  }

  .Login_Register {
    margin-top: 7px;
    font-size: 12px;
  }
  .Login_Register a {
    color: #1c304e;
  }
  </style>

  <div class="Login">
    <div class="Title">${this.translations.signInTitle}</div>
    <form class="Login_Form" action="#" @submit="${this.formSubmit}">

    ${( () => {
    if( !this.notice ) return '';
    return html`<div class="Notice">${this.notice}</div>`;
  })()}
    ${( () => {
    if( !this.error ) return '';
    return html`<div class="Error"></div>`;
  })()}

      <div class="Login_Row">
        <input 
          type="text"
          class="${this.error ? 'invalid' : ''}" 
          size="30" 
          name="email" 
          autofocus 
          placeholder="${this.translations.email}"
        />
      </div>
      <div class="Login_Row">
        <input 
          type="password"
          class="${this.error ? 'invalid' : ''}" 
          size="30" 
          name="password" 
          placeholder="${this.translations.password}"
        />
        <a href="${this.links.resetPassword}" class="Login_ForgotPassword" target="_blank" @click="${this.forgotPasswordClick}">${
          this.translations.forgotYourPassword
       }</a>
      </div>

      <div class="Login_Row">
        <div class="Login_Button${this.loading ? ' loading' : ''}"><div class="In">
          <button>${this.translations.signIn}</button>
          <div class="Login_Button_Overlay"></div>
        </div></div>

        <div class="Login_Register">
          ${this.translations.dontHaveAnAccount}
          <a href="${this.links.signUp}" target="_blank" @click="${this.registerClick}">${
            this.translations.signUp
         }</a>
        </div>
      </div>
    </form>
  </div>`;
};
