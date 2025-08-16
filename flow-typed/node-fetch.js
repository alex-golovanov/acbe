declare module 'node-fetch' {
  declare module.exports: (
    input: RequestInfo,
    init?: RequestOptions
  ) => Promise<Response>
}
