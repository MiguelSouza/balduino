import { v4 as uuid } from "uuid";

export interface ExpenseProps {
  expense_id?: string;
  description: string;
  value: number;
}

export default class Expense {
  private _expense_id?: string;
  private _description: string;
  private _value: number;
  private _created_at: Date;
  private _updated_at?: Date;

  constructor(props: ExpenseProps) {
    this._expense_id = props.expense_id ?? uuid();
    this._description = props.description;
    this._value = props.value;
    this._created_at = new Date();
    this._updated_at = props.expense_id ? new Date() : undefined;

    this.validate();
  }

  private validate() {
    if (!this._description) throw new Error("Description is required.");
    if (!this._value) throw new Error("Value is required.");
  }

  public update(props: Partial<ExpenseProps>) {
    if (props.description) this._description = props.description;
    if (props.value) this._value = props.value;
    this._updated_at = new Date();

    this.validate();
  }

  get expenseId() {
    return this._expense_id;
  }

  get description() {
    return this._description;
  }

  get value() {
    return this._value;
  }
  
  get createdAt() {
    return this._created_at;
  }

  get updatedAt() {
    return this._updated_at;
  }
}
