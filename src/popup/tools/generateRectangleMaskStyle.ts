export default ({ block, rectangle }: {
  'block': {
    'width': number,
    'height': number
  },
  'rectangle': {
    'x': number,
    'y': number,
    'width': number,
    'height': number
  }
}): string => {
  const mask =
    'data:image/svg+xml;base64,' +
    btoa(
      `<svg viewBox="0 0 ${block.width} ${block.height}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <mask id="clip">
          <rect id="bg" x="0" y="0" width="100%" height="100%" fill="#fff"/>
          <rect x="${rectangle.x}" y="${rectangle.y}" width="${rectangle.width}" height="${rectangle.height}" rx="10"/>
        </mask>

        <rect x="0" y="0" width="100%" height="100%" mask="url(#clip)" fill="#000"/>
      </svg>
      `.replace( /(\n|\r)/g, '' ).trim()
    );

  return (
    `-webkit-mask: url('${mask}') 0 0 no-repeat;` +
    `mask: url('${mask}') 0 0 no-repeat;`
  );
};
