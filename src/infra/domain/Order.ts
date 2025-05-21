import { v4 as uuid } from "uuid";

export enum OrderStatus {
  PENDING = "pending",
  DELIVERED = "delivered",
  CANCELED = "canceled",
}

export interface OrderProps {
  order_id?: string;
  table_id?: string;
  customer_id?: string;
  credit_destination?: string;
  created_by?: string;
  payment_method?: string;
  products: Array<{ productId: string; quantity: number, price: number }>;
  status?: OrderStatus;
}

export default class Order {
  private _orderId: string;
  private _customerId?: string;
  private _tableId?: string;
  private _payment_method?: string;
  private _credit_destination?: string;
  private _createdBy?: string;
  private _products: Array<{ productId: string; quantity: number, price: number }>;
  private _status?: OrderStatus;
  private _createdAt: Date;
  private _updatedAt?: Date;

  constructor(props: OrderProps) {
    this._orderId = props.order_id ?? uuid();
    this._createdBy = props.created_by;
    this._customerId = props.customer_id;
    this._credit_destination = props.credit_destination;
    this._tableId = props.table_id;
    this._products = props.products;
    this._payment_method = props.payment_method;
    this._status = props.status;
    this._createdAt = new Date();
    this._updatedAt = new Date();

    this.validate();
  }

  private validate() {
    if (!this._products || this._products.length === 0)
      throw new Error("At least one product is required.");
  }

  public update(props: Partial<OrderProps>) {
    if (props.customer_id) this._customerId = props.customer_id;
    if (props.products) this._products = props.products;
    if (props.status !== undefined) this._status = props.status;
    this._updatedAt = new Date();

    this.validate();
  }

  get orderId() {
    return this._orderId;
  }

  get paymentMethod() {
    return this._payment_method;
  }

  get customerId() {
    return this._customerId;
  }

  get tableId() {
    return this._tableId;
  }

  get products() {
    return this._products;
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

  get createdBy() {
    return this._createdBy;
  }
  
  get creditDestination() {
    return this._credit_destination;
  }
}
