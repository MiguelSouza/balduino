import { v4 as uuid } from "uuid";

export enum PaymentStatus {
  PENDING = "pending",
  PAID = "paid"
}

export interface PaymentProps {
  payment_id?: string;
  monthly_payer_id: string;
  payment_date?: Date;
  due_date?: Date;
  value: number;
  status?: PaymentStatus;
}

export default class Payment {
  private _paymentId: string;
  private _monthlyPayerId?: string;
  private _paymentDate?: Date;
  private _dueDate?: Date;
  private _value: number;
  private _status?: PaymentStatus;
  private _createdAt: Date;
  private _updatedAt?: Date;

  constructor(props: PaymentProps) {
    this._paymentId = props.payment_id ?? uuid();
    this._monthlyPayerId = props.monthly_payer_id;
    this._paymentDate = props.payment_date;
    this._dueDate = props.due_date;
    this._value = props.value;
    this._status = props.status;
    this._createdAt = new Date();
    this._updatedAt = new Date();

    this.validate();
  }

  private validate() {
  }

  public update(props: Partial<PaymentProps>) {
    if (props.monthly_payer_id) this._monthlyPayerId = props.monthly_payer_id;
    if (props.value) this._value = props.value;
    if (props.status !== undefined) this._status = props.status;
    if (props.payment_date !== undefined) this._paymentDate = props.payment_date;
    if (props.due_date !== undefined) this._dueDate = props.due_date;
    this._updatedAt = new Date();

    this.validate();
  }

  get paymentId() {
    return this._paymentId;
  }

  get paymentDate() {
    return this._paymentDate;
  }
  
  get dueDate() {
    return this._dueDate;
  }

  get monthPayerId() {
    return this._monthlyPayerId;
  }

  get value() {
    return this._value;
  }

  get status() {
    return this._status;
  }

  get createdAt() {
    return this._createdAt;
  }

  get updatedAt() {
    return this._updatedAt;
  }

}
