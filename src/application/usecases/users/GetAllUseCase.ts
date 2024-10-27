import UserRepository from "../../../infra/repositories/UserRepository";

export default class GetAllUseCase {
    userRepository?: UserRepository;
    
    constructor(userRepository: UserRepository){
        this.userRepository = userRepository;
    }

    async execute() {
        return await this.userRepository?.getAll();
    }
}