import { v4 as uuid } from "uuid";

export interface CreditPaymentUsageProps {
  usage_id?: string;
  value: number;
  customer_id?: string;
}

export default class CreditPaymentUsage {
  private _creditPaymentUsageId: string;
  private _createdAt: Date;
  private _updatedAt?: Date;
  private _value: number;
  private _customerId?: string;

  constructor(props: CreditPaymentUsageProps) {
    this._creditPaymentUsageId = props.usage_id ?? uuid();
    this._value = props.value;
    this._customerId = props.customer_id;
    this._createdAt = new Date();
    this._updatedAt = new Date();
  }

  get creditPaymentUsageId() {
    return this._creditPaymentUsageId;
  }

  get value() {
    return this._value;
  }

  get customerId() {
    return this._customerId;
  }

  get createdAt() {
    return this._createdAt;
  }

  get updatedAt() {
    return this._updatedAt;
  }
}
