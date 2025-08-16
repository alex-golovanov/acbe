import sendMessage from 'tools/sendMessage';


let log = ( ...args: any[] ) => {
  sendMessage({ 'type': 'log', 'data': args });
  console.log.apply( console, args );
};


export default Object.assign(
  log,
  {
    'warn': ( ...args: any[] ) => {
      sendMessage({ 'type': 'log.warn', 'data': args });
      console.warn.apply( console, args );
    },
    'error': ( ...args: any[] ) => {
      sendMessage({ 'type': 'log.error', 'data': args });
      console.error.apply( console, args );
    }
  }
);
