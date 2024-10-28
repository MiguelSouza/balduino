import HttpServer from "../../http/HttpServer";
import LoginUseCase from "../../../application/usecases/auth/LoginUseCase";
import LoginDto from "./dto/LoginDto";

export default class AuthController {
  constructor(httpServer: HttpServer, loginUseCase: LoginUseCase) {
    httpServer.register(
      "post",
      "/login",
      [],
      async (params: any, body: LoginDto) => {
        const response = await loginUseCase.execute(body);
        return response;
      },
    );
  }
}
