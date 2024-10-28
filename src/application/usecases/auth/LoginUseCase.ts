import LoginDto from "../../../infra/controllers/auth/dto/LoginDto";
import UserRepository from "../../../infra/repositories/UserRepository";
import bcrypt from "bcrypt";
import jwt, { Secret, JwtPayload } from "jsonwebtoken";

export const SECRET_KEY: Secret = "teste";

export default class LoginUseCase {
  userRepository?: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async execute(loginParam: LoginDto) {
    const user = await this.userRepository?.getByEmail(loginParam.email);
    if (!user) {
      return;
    }

    const isPasswordValid = await bcrypt.compare(
      loginParam.password,
      user.password,
    );

    if (!isPasswordValid) {
      return {
        user: null,
        accessToken: null,
        errorMessage: "Email ou senha inválidos!",
        stateCode: 401,
      };
    }

    const token = jwt.sign({ id: user.userId, name: user.name }, SECRET_KEY, {
      expiresIn: "2 days",
    });

    return { user, accessToken: token, stateCode: 200 };
  }
}
