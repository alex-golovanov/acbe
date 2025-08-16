import ga from 'ga';
import runtimeOnMessage from 'bg/runtime.onMessage';


runtimeOnMessage.addListener({
  'callback': (
    { data }/*: { 'data': { 'category'?: string, 'action'?: string, 'label'?: string, 'value'?: string, 'noninteraction'?: boolean } }*/
  ) => {
    ga.partial( data );
  },
  'type': 'ga.partial',
  'popupOnly': true
});

runtimeOnMessage.addListener({
  'callback': (
    { data }/*: { 'data': { 'category'?: string, 'action'?: string, 'label'?: string, 'value'?: string, 'noninteraction'?: boolean } }*/
  ) => {
    ga.full( data );
  },
  'type': 'ga.full',
  'popupOnly': true
});
