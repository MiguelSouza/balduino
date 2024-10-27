import UserRepository from "../../../infra/repositories/UserRepository";

export default class GetUsersByIdUseCase {
    userRepository?: UserRepository;
    
    constructor(userRepository: UserRepository){
        this.userRepository = userRepository;
    }

    async execute(userId: string) {
        return await this.userRepository?.getById(userId);
    }
}