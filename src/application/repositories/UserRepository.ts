import User from "../../infra/domain/User";

export default interface IUserRepository {
    save(user: User): Promise<User>
}