import CreateUserUseCase from "./application/usecases/users/CreateUserUseCase";
import UserController from "./infra/controllers/user/UserController";
import DatabaseConnection from "./infra/database/DatabaseConnection";
import HttpServer from "./infra/http/HttpServer"
import UserRepository from "./infra/repositories/UserRepository";


async function main() {
    const httpServer = new HttpServer();
    const databaseConnection = new DatabaseConnection()
    const userRepository = new UserRepository(databaseConnection)
    const userUseCase = new CreateUserUseCase(userRepository);
    new UserController(httpServer, userUseCase);    
    httpServer.listen(3000);
}

main()

