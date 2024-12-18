import User from "../../infra/domain/User";

export default interface IUserRepository {
  save(user: User): Promise<User>;
  update(user: User): void;
  getById(userId: string): Promise<User>;
  getAll(query: any): Promise<User[]>;
  delete(userId: string): void;
  getByEmail(email: string): Promise<User>;
}
