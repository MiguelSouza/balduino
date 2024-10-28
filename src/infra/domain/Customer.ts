import { v4 as uuid } from "uuid";

export interface CustomerProps {
  customer_id?: string;
  tableId: string;
  name: string;
  cpf?: string;
  birthday?: Date;
  active: boolean;
}

export default class Customer {
  private _customer_id?: string;
  private _table_id: string;
  private _name: string;
  private _cpf?: string;
  private _birthday?: Date;
  private _active: boolean;
  private _created_at: Date;
  private _updated_at?: Date;

  constructor(props: CustomerProps) {
    this._customer_id = props.customer_id ?? uuid();
    this._table_id = props.tableId;
    this._name = props.name;
    this._cpf = props.cpf;
    this._birthday = props.birthday;
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
    if (props.cpf) this._cpf = props.cpf;
    if (props.birthday) this._birthday = props.birthday;
    if (props.active !== undefined) this._active = props.active;
    this._updated_at = new Date();

    this.validate();
  }

  get customerId() {
    return this._customer_id;
  }

  get tableId() {
    return this._table_id;
  }

  get name() {
    return this._name;
  }

  get cpf() {
    return this._cpf;
  }

  get birthday() {
    return this._birthday;
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
