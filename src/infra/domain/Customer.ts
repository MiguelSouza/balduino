import { v4 as uuid } from "uuid";

export interface CustomerProps {
  customer_id?: string;
  name: string;
  phone?: string;
  active: boolean;
}

export default class Customer {
  private _customer_id?: string;
  private _name: string;
  private _phone?: string;
  private _active: boolean;
  private _created_at: Date;
  private _updated_at?: Date;

  constructor(props: CustomerProps) {
    this._customer_id = props.customer_id ?? uuid();
    this._name = props.name;
    this._phone = props.phone;
    this._active = props.active;
    this._created_at = new Date();
    this._updated_at = props.customer_id ? new Date() : undefined;

    this.validate();
  }

  private validate() {
    if (!this._name) throw new Error("Name is required.");
    if (typeof this._active !== "boolean")
      throw new Error("Active must be a boolean.");
  }

  public update(props: Partial<CustomerProps>) {
    if (props.name) this._name = props.name;
    if (props.phone) this._phone = props.phone;
    if (props.active !== undefined) this._active = props.active;
    this._updated_at = new Date();

    this.validate();
  }

  get customerId() {
    return this._customer_id;
  }

  get name() {
    return this._name;
  }

  get phone() {
    return this._phone;
  }

  get active() {
    return this._active;
  }

  get createdAt() {
    return this._created_at;
  }

  get updatedAt() {
    return this._updated_at;
  }

}
