import UserRepository from "../../../infra/repositories/UserRepository";

export default class GetUserByEmailUseCase {
  userRepository?: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async execute(email: string) {
    return await this.userRepository?.getByEmail(email);
  }
}
