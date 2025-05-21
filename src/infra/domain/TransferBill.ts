import { v4 as uuid } from "uuid";

export interface TransferBillProps {
  transferId?: string;
  fromCustomerId?: string;
  toCustomerId?: string;
  status?: string;
  value: number;
  transferDate?: Date;
}

export default class TransferBill {
  private _transferId: string;
  private _status?: string;
  private _transferDate?: Date;
  private _value: number;
  private _fromCustomerId?: string;
  private _toCustomerId?: string;

  constructor(props: TransferBillProps) {
    this._transferId = props.transferId ?? uuid();
    this._toCustomerId = props.toCustomerId;
    this._fromCustomerId = props.fromCustomerId;
    this._transferDate = props.transferDate;
    this._value = props.value;
    this._status = props.status;
  }

  get transferId() {
    return this._transferId;
  }
  
  get toCustomerId() {
    return this._toCustomerId;
  }

  get fromCustomerId() {
    return this._fromCustomerId;
  }

  get transferDate() {
    return this._transferDate;
  }

  get value() {
    return this._value;
  }

  get status() {
    return this._status;
  }

}
