export default ( selector: string ) => {
  return `
  ${selector}{
    scrollbar-width: thin;
  }
  ${selector}::-webkit-scrollbar {
    -webkit-appearance: none;
    width: 8px;
  }
  ${selector}::-webkit-scrollbar-thumb {
    border-radius: 4px;
    background-color:ButtonFace;
    box-shadow:inset 0px 0px 0px 20px rgba(128,128,128,0.3);
    /*border-left:2px solid rgba(255,255,255,0.3);
    border-right:2px solid rgba(255,255,255,0.3);*/
  }
  ${selector}::-webkit-scrollbar-thumb:hover{
    box-shadow:inset 0px 0px 0px 20px rgba(128,128,128,0.5);
  }
  ${selector}::-webkit-scrollbar-thumb:active{
    box-shadow:inset 0px 0px 0px 20px rgba(128,128,128,0.7);
  }
  ${selector}::-webkit-scrollbar-track{
    background-color:ButtonFace;
    box-shadow:inset 0px 0px 0px 20px rgba(255,255,255,0.3);
  }
  `;
};
