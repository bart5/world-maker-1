enum OpType {
  'loadApplicationData'
}

interface IpcReply {
  opType: OpType;
  data: any;
  exchangeId: string
}
