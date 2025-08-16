import dateCodeChange from './dateCodeChange';


test( 'getTime() from another getTime()', () => {
  let ModifiedDate = dateCodeChange( Date, 12, 600 );

  let dateObject = new ModifiedDate();

  let stamp1 = dateObject.getTime();
  let stamp2 = new ModifiedDate( stamp1 ).getTime();

  expect( stamp1 === stamp2 ).toBe( true );
});
