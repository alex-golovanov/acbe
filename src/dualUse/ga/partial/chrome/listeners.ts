import GA from './index';
import Counters from 'bg/Counters';


export default ( ga: typeof GA ): void => {
  Counters.addListener( 'popup: menu: smart settings click', () => {
    ga({ 'category': 'Smart Settings', 'action': 'Menu click' });
  });

  Counters.addListener( 'popup: smart settings: open help', () => {
    ga({ 'category': 'Smart Settings', 'action': 'Open help' });
  });

  Counters.addListener( 'popup: smart settings: open list', () => {
    ga({ 'category': 'Smart Settings', 'action': 'Open edit page' });
  });

  Counters.addListener( 'popup: smart settings: add rule', () => {
    ga({ 'category': 'Smart Settings', 'action': 'Add rule' });
  });
};
