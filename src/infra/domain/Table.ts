import { v4 as uuid } from "uuid";

export interface TableProps {
  table_id?: string;
  name: string;
  active: boolean;
}

export default class Table {
  private _table_id?: string;
  private _name: string;
  private _active: boolean;
  private _created_at: Date;
  private _updated_at?: Date;

  constructor(props: TableProps) {
    this._table_id = props.table_id ?? uuid();
    this._name = props.name;
    this._active = props.active;
    this._created_at = new Date();
    this._updated_at = props.table_id ? new Date() : undefined;

    this.validate();
  }

  private validate() {
    if (!this._name) throw new Error("Name is required.");
    if (typeof this._active !== "boolean")
      throw new Error("Active must be a boolean.");
  }

  public update(props: Partial<TableProps>) {
    if (props.name) this._name = props.name;
    if (props.active !== undefined) this._active = props.active;
    this._updated_at = new Date();

    this.validate();
  }

  get tableId() {
    return this._table_id;
  }

  get name() {
    return this._name;
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
