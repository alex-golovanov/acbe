// @flow
import sendMessage from 'tools/sendMessage';


let log = Object.assign(
  ( ...args: Array<any> ) => {
    sendMessage({ 'type': 'log', 'data': args });
    console.log.apply( console, args );
  },
  {
    'warn': ( ...args: Array<any> ) => {
      sendMessage({ 'type': 'log.warn', 'data': args });
      console.warn.apply( console, args );
    },
    'error': ( ...args: Array<any> ) => {
      sendMessage({ 'type': 'log.error', 'data': args });
      console.error.apply( console, args );
    }
  }
);


export default log;
