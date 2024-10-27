import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';

export interface UserProps {
    name: string;
    email: string;
    password: string;
    cpf?: string;
    birthday?: Date;
    admin: boolean;
    active: boolean;
}

export default class User {
    private _user_id: string;
    private _name: string;
    private _email: string;
    private _password: string;
    private _cpf?: string;
    private _birthday?: Date;
    private _admin: boolean;
    private _active: boolean;
    private _created_at: Date;
    private _updated_at?: Date;

    constructor(props: UserProps) {
        this._user_id =  uuid();
        this._name = props.name;
        this._email = props.email;
        this._password = this.hashPassword(props.password);
        this._cpf = props.cpf;
        this._birthday = props.birthday;
        this._admin = props.admin;
        this._active = props.active;
        this._created_at = new Date();
        this._updated_at = new Date();

        this.validate();
    }

    private validate() {
        if (!this._name) throw new Error("Name is required.");
        if (!this._email) throw new Error("Email is required.");
        if (!this._password) throw new Error("Password is required.");
        if (typeof this._admin !== 'boolean') throw new Error("Admin must be a boolean.");
        if (typeof this._active !== 'boolean') throw new Error("Active must be a boolean.");
    }

    private hashPassword(password: string): string {
        const saltRounds = 10;
        return bcrypt.hashSync(password, saltRounds);
    }

    public async verifyPassword(password: string): Promise<boolean> {
        return await bcrypt.compare(password, this._password);
    }

    get userId() {
        return this._user_id;    
    }

    get name() {
        return this._name;
    }

    get cpf() {
        return this._cpf;
    }

    get email() {
        return this._email;
    }

    get password() {
        return this._password;
    }

    get birthday() {
        return this._birthday;
    }

    get admin() {
        return this._admin;
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
