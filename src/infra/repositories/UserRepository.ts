import IUserRepository  from "../../application/repositories/UserRepository";
import DatabaseConnection from "../database/DatabaseConnection";
import User from "../domain/User";

export default class UserRepository implements IUserRepository {    
    connection?: DatabaseConnection;

    constructor(connection: DatabaseConnection ){
        this.connection = connection;
    }
    async save(user: User): Promise<User> {
        return this.connection?.query('insert into balduino.user (user_id, name, cpf, password, email, birthday, admin, active, created_at, updated_at) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *', [user.userId, user.name, user.cpf, user.password,user.email, user.birthday, user.admin, user.active, user.createdAt, user.updatedAt])
    }


}