import IUserRepository from "../../application/repositories/UserRepository";
import LoginResponseDto from "../controllers/auth/dto/LoginResponseDto";
import DatabaseConnection from "../database/DatabaseConnection";
import User from "../domain/User";

export default class UserRepository implements IUserRepository {
  connection?: DatabaseConnection;

  constructor(connection: DatabaseConnection) {
    this.connection = connection;
  }

  async save(user: User): Promise<User> {
    return this.connection?.query(
      "insert into balduino.user (user_id, name, cpf, password, email, birthday, admin, active, created_at, updated_at) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *",
      [
        user.userId,
        user.name,
        user.cpf,
        user.password,
        user.email,
        user.birthday,
        user.admin,
        user.active,
        user.createdAt,
        user.updatedAt,
      ],
    );
  }

  async update(user: User): Promise<void> {
    await this.connection?.query(
      `UPDATE balduino.user 
            SET name = $1, cpf = $2, password = $3, email = $4, birthday = $5, admin = $6, active = $7, updated_at = $8 
            WHERE user_id = $9`,
      [
        user.name,
        user.cpf,
        user.password,
        user.email,
        user.birthday,
        user.admin,
        user.active,
        new Date(),
        user.userId,
      ],
    );
  }

  async getByEmail(email: string): Promise<User> {
    const result = await this.connection?.query(
      "SELECT * FROM balduino.user WHERE email = $1",
      [email],
    );
    return result.length > 0 ? result[0] : null;
  }

  async getById(userId: string): Promise<User> {
    const result = await this.connection?.query(
      "SELECT * FROM balduino.user WHERE user_id = $1",
      [userId],
    );
    return result.length > 0 ? result[0] : null;
  }

  
  async getAll(query: any): Promise<User[]> {
    let sql = "SELECT * FROM balduino.user";
    const params: string[] = [];
  
    if (query.name) {
      sql += " WHERE LOWER(name) LIKE LOWER($1)";
      params.push(`%${query.name}%`);
    }
    
    return this.connection?.query(sql, params);
  }

  async delete(userId: string): Promise<void> {
    this.connection?.query("delete from balduino.user where user_id = $1", [
      userId,
    ]);
  }
}
