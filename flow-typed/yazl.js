class ZipFile{
  outputStream: stream$Duplex

  addFile(
    filePath, 
    metaFilePath, 
    options?: {| 'forceZip64Format'?: boolean |} 
  ){}

  end( options?: {| 'forceZip64Format'?: boolean |} ){}
};


declare module 'yazl' {
  declare module.exports: {|
    'ZipFile': typeof ZipFile
  |}
}