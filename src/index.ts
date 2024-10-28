import LoginUseCase from "./application/usecases/auth/LoginUseCase";
import CreateTableUseCase from "./application/usecases/table/CreateTableUseCase";
import DeleteTableUseCase from "./application/usecases/table/DeleteTableUseCase";
import GetAllTableUseCase from "./application/usecases/table/GetAllTableUseCase";
import GetTablesByIdUseCase from "./application/usecases/table/GetTablesByIdUseCase";
import UpdateTableUseCase from "./application/usecases/table/UpdateTableUseCase";
import CreateUserUseCase from "./application/usecases/users/CreateUserUseCase";
import DeleteUserUseCase from "./application/usecases/users/DeleteUserUseCase";
import GetAllUseCase from "./application/usecases/users/GetAllUseCase";
import GetUsersByIdUseCase from "./application/usecases/users/GetUsersByIdUseCase";
import UpdateUserUseCase from "./application/usecases/users/UpdateUserUseCase";
import AuthController from "./infra/controllers/auth/AuthController";
import TableController from "./infra/controllers/table/TableController";
import UserController from "./infra/controllers/user/UserController";
import DatabaseConnection from "./infra/database/DatabaseConnection";
import HttpServer from "./infra/http/HttpServer";
import TableRepository from "./infra/repositories/TableRepository";
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
  const loginUseCase = new LoginUseCase(userRepository);
  new AuthController(httpServer, loginUseCase);
  
  const tableRepository = new TableRepository(databaseConnection);
  const createTableUseCase = new CreateTableUseCase(tableRepository);
  const updateTableUseCase = new UpdateTableUseCase(tableRepository);
  const deleteTableUseCase = new DeleteTableUseCase(tableRepository);
  const getAllTableUseCase = new GetAllTableUseCase(tableRepository);
  const getTablesByIdUseCase = new GetTablesByIdUseCase(tableRepository);
  
  new TableController(httpServer,
    createTableUseCase,
    updateTableUseCase,
    deleteTableUseCase,
    getAllTableUseCase,
    getTablesByIdUseCase
  )
  httpServer.listen(3000);
}

main();
