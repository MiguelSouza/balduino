import { v4 as uuid } from "uuid";

export interface CreditPaymentProps {
  credit_id?: string;
  credit_payment_id?: string;
  value: number;
  customer_id?: string;
  customer_origin_id?: string;
  customer_destination_id?: string;
  created_by?: string;
}

export default class CreditPayment {
  private _creditPaymentId: string;
  private _customerId?: string;
  private _createdAt: Date;
  private _updatedAt?: Date;
  private _createdBy?: string;
  private _value: number;
  private _customerOriginId?: string;
  private _customerDestinationId?: string;

  constructor(props: CreditPaymentProps) {
    this._creditPaymentId = props.credit_payment_id ?? uuid();
    this._value = props.value;
    this._createdBy = props.created_by,
    this._customerId = props.customer_id;
    this._customerOriginId = props.customer_origin_id;
    this._customerDestinationId = props.customer_destination_id;
    this._createdAt = new Date();
    this._updatedAt = new Date();
  }

  get creditPaymentId() {
    return this._creditPaymentId;
  }

  get value() {
    return this._value;
  }

  get customerOriginId() {
    return this._customerOriginId;
  }

  get customerDestinationId() {
    return this._customerDestinationId;
  }

  get createdAt() {
    return this._createdAt;
  }

  get updatedAt() {
    return this._updatedAt;
  }

  get createdBy() {
    return this._createdBy;
  }

  get customerId() {
    return this._customerId;
  }
}
