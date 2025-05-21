import CreateUserUseCase from '../../application/usecases/users/CreateUserUseCase';
import UpdateUserUseCase from '../../application/usecases/users/UpdateUserUseCase';
import DeleteUserUseCase from '../../application/usecases/users/DeleteUserUseCase';
import GetAllUseCase from '../../application/usecases/users/GetAllUseCase';
import GetUsersByIdUseCase from '../../application/usecases/users/GetUsersByIdUseCase';
import UserController from '../controllers/user/UserController';
import UserRepository from '../repositories/UserRepository';
import HttpServer from '../http/HttpServer';
import DatabaseConnection from '../database/DatabaseConnection';

export default function createUserModule(httpServer: HttpServer, dbConnection: DatabaseConnection) {
  const userRepository = new UserRepository(dbConnection);
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
}
