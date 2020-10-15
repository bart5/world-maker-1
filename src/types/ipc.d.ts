type OpType =
  'loadApplicationData'
  | 'saveApplicationData'

interface IpcReply {
  opType: OpType;
  exchangeId: string
  data: any;
}

interface IpcRequest {
  opType: OpType;
  exchangeId: string
  data?: any,
}
