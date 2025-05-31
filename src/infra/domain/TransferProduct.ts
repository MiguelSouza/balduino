import { v4 as uuid } from "uuid";
import { OrderStatus } from "./Order";

export interface TransferProductProps {
  transferProductId?: string;
  productId: string;
  createdBy: string;
  fromCustomerId: string;
  toCustomerId: string;
  orderId: string;
  quantity: number;
  transferDate?: Date;
  status: OrderStatus;
  tableId: string;
}

export default class TransferProduct {
  private _transfer_product_id: string;
  private _order_id: string;
  private _created_by: string;
  private _product_id: string;
  private _transfer_date?: Date;
  private _quantity: number;
  private _from_customer_id: string;
  private _to_customer_id: string;
  private _created_at: Date;
  private _updated_at?: Date;
  private _status: OrderStatus;
  private _table_id: string;

  constructor(props: TransferProductProps) {
    this._transfer_product_id = props.transferProductId ?? uuid();
    this._to_customer_id = props.toCustomerId;
    this._created_by = props.createdBy;
    this._from_customer_id = props.fromCustomerId;
    this._order_id = props.orderId;
    this._product_id = props.productId,
    this._quantity = props.quantity;
    this._status = props.status;
    this._table_id = props.tableId;
    this._created_at = new Date();
    this._updated_at = props.transferProductId ? new Date() : undefined;
  }

  get transferId() {
    return this._transfer_product_id;
  }
  
  get toCustomerId() {
    return this._to_customer_id;
  }

  get fromCustomerId() {
    return this._from_customer_id;
  }

  get transferDate() {
    return this._transfer_date;
  }

  get quantity() {
    return this._quantity;
  }

  get orderId() {
    return this._order_id;
  }

  get createdBy() {
    return this._created_by;
  }

  get productId() {
    return this._product_id;
  }

  get tableId() {
    return this._table_id;
  }

  get status() {
    return this._status;
  }

  get createdAt() {
    return this._created_at;
  }

  get updatedAt() {
    return this._updated_at;
  }

}
