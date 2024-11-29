import { v4 as uuid } from "uuid";

export interface MonthlyPayerProps {
  monthly_payer_id?: string;
  name: string;
  value: number;
}

export default class MonthlyPayer {
  private _monthly_payer_id?: string;
  private _name: string;
  private _value: number;
  private _created_at: Date;
  private _updated_at?: Date;

  constructor(props: MonthlyPayerProps) {
    this._monthly_payer_id = props.monthly_payer_id ?? uuid();
    this._name = props.name;
    this._value = props.value;
    this._created_at = new Date();
    this._updated_at = new Date();

    this.validate();
  }

  private validate() {
    if (!this._name) throw new Error("Name is required.");
    if (!this._value) throw new Error("Value is required.");
  }

  public update(props: Partial<MonthlyPayerProps>) {
    if (props.name) this._name = props.name;
    if (props.value) this._value = props.value;
    this._updated_at = new Date();

    this.validate();
  }

  get monthlyPayerId() {
    return this._monthly_payer_id;
  }

  get name() {
    return this._name;
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
