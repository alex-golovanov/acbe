export default ( object: any ): boolean => Boolean(
  object && typeof object === 'object'
);
