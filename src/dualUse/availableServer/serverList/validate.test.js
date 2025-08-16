import validate from './validate';


test( 'Validate string', () => {
  expect( () => {
    validate( 'string' );
  }).toThrow();
});

test( 'Validate empty array', () => {
  expect( () => {
    validate( [] );
  }).toThrow();
});

test( 'Validate incorrect array', () => {
  expect( () => {
    validate( [ 1, 'https://browsec.com/' ] );
  }).toThrow();
});

test( 'Validate array of string', () => {
  expect( validate( [ 'https://browsec.com/' ] ) ).toBe( undefined );
});
