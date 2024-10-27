import { plainToInstance } from "class-transformer";
import HttpServer from "../../http/HttpServer";
import UserDto from "./dto/UserDto";
import UserUseCase from "../../../application/usecases/users/CreateUserUseCase";

export default class UserController {
  constructor(httpServer: HttpServer, userUseCase: UserUseCase) {
    httpServer.register("post", "/user", async (params: any, body: UserDto) => {
        const response = await userUseCase.execute(body);
        return response;
    });

    httpServer.register("put", "/user", async (params: any, body: any) => {

        return false;
    });

    httpServer.register("delete", "/user/:userId", async (params: any, body: any) => {

        return false;
    });


    httpServer.register("get", "/users", async (params: any, body: any) => {

        return false;
    });

    httpServer.register("get", "/user", async (params: any, body: any) => {

      return false;
  });

  }
  
}

