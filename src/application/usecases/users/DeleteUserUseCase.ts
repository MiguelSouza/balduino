import UserRepository from "../../../infra/repositories/UserRepository";

export default class DeleteUserUseCase {
  userRepository?: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async execute(userId: string) {
    this.userRepository?.delete(userId);
  }
}
