import { v4 as uuid } from "uuid";

export interface PartialPaymentProps {
  partial_payment_id?: string;
  order_id: string;
  payment_method?: string;
  payment_date?: Date;
  value: number;
}

export default class PartialPayment {
  private _partialPaymentId: string;
  private _orderId: string;
  private _paymentMethod?: string;
  private _createdAt: Date;
  private _updatedAt?: Date;
  private _paymentDate?: Date;
  private _value: number;

  constructor(props: PartialPaymentProps) {
    this._partialPaymentId = props.partial_payment_id ?? uuid();
    this._orderId = props.order_id;
    this._paymentMethod = props.payment_method;
    this._paymentDate = props.payment_date;
    this._value = props.value;
    this._createdAt = new Date();
    this._updatedAt = new Date();
  }

  get partialPaymentId() {
    return this._partialPaymentId;
  }
  
  get orderId() {
    return this._orderId;
  }

  get paymentMethod() {
    return this._paymentMethod;
  }

  get paymentDate() {
    return this._paymentDate;
  }

  get value() {
    return this._value;
  }

  get createdAt() {
    return this._createdAt;
  }

  get updatedAt() {
    return this._updatedAt;
  }
}
