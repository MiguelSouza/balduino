import CreateUserUseCase from "./application/usecases/users/CreateUserUseCase";
import DeleteUserUseCase from "./application/usecases/users/DeleteUserUseCase";
import GetAllUseCase from "./application/usecases/users/GetAllUseCase";
import GetUsersByIdUseCase from "./application/usecases/users/GetUsersByIdUseCase";
import UpdateUserUseCase from "./application/usecases/users/UpdateUserUseCase";
import UserController from "./infra/controllers/user/UserController";
import DatabaseConnection from "./infra/database/DatabaseConnection";
import HttpServer from "./infra/http/HttpServer";
import UserRepository from "./infra/repositories/UserRepository";

async function main() {
  const httpServer = new HttpServer();
  const databaseConnection = new DatabaseConnection();
  const userRepository = new UserRepository(databaseConnection);
  const createUserUseCase = new CreateUserUseCase(userRepository);
  const updateUserUseCase = new UpdateUserUseCase(userRepository);
  const deleteUserUseCase = new DeleteUserUseCase(userRepository);
  const getAllUseCase = new GetAllUseCase(userRepository);
  const getUsersByIdUseCase = new GetUsersByIdUseCase(userRepository);
  new UserController(
    httpServer,
    createUserUseCase,
    updateUserUseCase,
    deleteUserUseCase,
    getAllUseCase,
    getUsersByIdUseCase,
  );
  httpServer.listen(3000);
}

main();
