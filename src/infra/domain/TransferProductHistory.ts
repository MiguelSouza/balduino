import { v4 as uuid } from "uuid";

import { OrderStatus } from "./Order";

export interface TransferProductHistoryProps {
  transferProductHistoryId?: string;
  fromOrderId: string;
  toOrderId: string;
  productId: string;
  quantityTransferred: number;
  fromCustomerId: string;
  toCustomerId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export default class TransferProductHistory {
  private _order_transfer_history_id: string;
  private _from_order_id: string;
  private _to_order_id: string;
  private _product_id: string;
  private _quantity_transferred: number;
  private _from_customer_id: string;
  private _to_customer_id: string;
  private _createdAt: Date;
  private _updatedAt?: Date;

  constructor(props: TransferProductHistoryProps) {
    this._order_transfer_history_id = props.transferProductHistoryId ?? uuid();
    this._from_order_id = props.fromOrderId;
    this._to_order_id = props.toOrderId;
    this._product_id = props.productId;
    this._quantity_transferred = props.quantityTransferred;
    this._from_customer_id = props.fromCustomerId;
    this._to_customer_id = props.toCustomerId;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt;
  }

  get orderTransferHistoryId() {
    return this._order_transfer_history_id;
  }

  get fromOrderId() {
    return this._from_order_id;
  }

  get toOrderId() {
    return this._to_order_id;
  }

  get productId() {
    return this._product_id;
  }

  get quantityTransferred() {
    return this._quantity_transferred;
  }

  get fromCustomerId() {
    return this._from_customer_id;
  }

  get toCustomerId() {
    return this._to_customer_id;
  }

  get createdAt() {
    return this._createdAt;
  }

  get updatedAt() {
    return this._updatedAt;
  }

}
