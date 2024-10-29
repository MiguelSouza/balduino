import { v4 as uuid } from "uuid";

export interface ProductProps {
  product_id?: string;
  name: string;
  value: number;
  image?: string;
  active: boolean;
}

export default class Product {
  private _product_id?: string;
  private _name: string;
  private _value: number;
  private _image?: string;
  private _active: boolean;
  private _created_at: Date;
  private _updated_at?: Date;

  constructor(props: ProductProps) {
    this._product_id = props.product_id ?? uuid();
    this._name = props.name;
    this._value = props.value;
    this._image = props.image;
    this._active = props.active;
    this._created_at = new Date();
    this._updated_at = props.product_id ? new Date() : undefined;

    this.validate();
  }

  private validate() {
    if (!this._name) throw new Error("Name is required.");
    if (!this._value) throw new Error("Value is required.");
    if (typeof this._active !== "boolean")
      throw new Error("Active must be a boolean.");
  }

  public update(props: Partial<ProductProps>) {
    if (props.name) this._name = props.name;
    if (props.value) this._value = props.value;
    if (props.image) this._image = props.image;
    if (props.active !== undefined) this._active = props.active;
    this._updated_at = new Date();

    this.validate();
  }

  get productId() {
    return this._product_id;
  }

  get name() {
    return this._name;
  }

  get value() {
    return this._value;
  }

  get image() {
    return this._image;
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
