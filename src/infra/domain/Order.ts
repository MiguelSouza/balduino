import { v4 as uuid } from "uuid";

export enum OrderStatus {
  PENDING = "pending",
  DELIVERED = "delivered",
  CANCELED = "canceled",
}

export interface OrderProps {
  orderId?: string;
  tableId: string;
  customerId: string;
  products: Array<{ productId: string; quantity: number }>;
  status?: OrderStatus;
}

export default class Order {
  private _orderId: string;
  private _tableId: string;
  private _customerId: string;
  private _products: Array<{ productId: string; quantity: number }>;
  private _status?: OrderStatus;
  private _createdAt: Date;
  private _updatedAt?: Date;

  constructor(props: OrderProps) {
    this._orderId = props.orderId ?? uuid();
    this._tableId = props.tableId;
    this._customerId = props.customerId;
    this._products = props.products;
    this._status = props.status;
    this._createdAt = new Date();
    this._updatedAt = props.orderId ? new Date() : undefined;

    this.validate();
  }

  private validate() {
    if (!this._tableId) throw new Error("Table ID is required.");
    if (!this._customerId) throw new Error("Customer ID is required.");
    if (!this._products || this._products.length === 0)
      throw new Error("At least one product is required.");
  }

  public update(props: Partial<OrderProps>) {
    if (props.customerId) this._customerId = props.customerId;
    if (props.tableId) this._tableId = props.tableId;
    if (props.products) this._products = props.products;
    if (props.status !== undefined) this._status = props.status;
    this._updatedAt = new Date();

    this.validate();
  }

  get orderId() {
    return this._orderId;
  }

  get tableId() {
    return this._tableId;
  }

  get customerId() {
    return this._customerId;
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
}
