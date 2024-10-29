import HttpServer from "../../http/HttpServer";
import UserDto from "./dto/UserDto";
import CreateUserUseCase from "../../../application/usecases/users/CreateUserUseCase";
import UpdateUserUseCase from "../../../application/usecases/users/UpdateUserUseCase";
import DeleteUserUseCase from "../../../application/usecases/users/DeleteUserUseCase";
import GetAllUseCase from "../../../application/usecases/users/GetAllUseCase";
import GetUsersByIdUseCase from "../../../application/usecases/users/GetUsersByIdUseCase";

export default class UserController {
  constructor(
    httpServer: HttpServer,
    createUserUseCase: CreateUserUseCase,
    updateUserUseCase: UpdateUserUseCase,
    deleteUserUseCase: DeleteUserUseCase,
    getAllUseCase: GetAllUseCase,
    getUserByIdUseCase: GetUsersByIdUseCase,
  ) {
    httpServer.register(
      "post",
      "/user",
      [],
      async (params: any, body: UserDto) => {
        const response = await createUserUseCase.execute(body);
        return response;
      },
    );

    httpServer.register("put", "/user", [], async (params: any, body: any) => {
      await updateUserUseCase.execute(body);
    });

    httpServer.register(
      "delete",
      "/user/:userId",
      [],
      async (params: any, body: any) => {
        await deleteUserUseCase.execute(body.userId);
      },
    );

    httpServer.register("get", "/users", [], async (params: any, body: any) => {
      return await getAllUseCase.execute();
    });

    httpServer.register(
      "get",
      "/users/:userId",
      [],
      async (params: any, body: any) => {
        return await getUserByIdUseCase.execute(params.userId);
      },
    );
  }
}
