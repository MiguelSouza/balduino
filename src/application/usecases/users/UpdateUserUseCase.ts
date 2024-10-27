import CreateResponseDto from "../../../infra/controllers/user/dto/CreateResponseDto";
import UserDto from "../../../infra/controllers/user/dto/UserDto";
import User from "../../../infra/domain/User";
import UserRepository from "../../../infra/repositories/UserRepository";

export default class UpdateUserUseCase {
    userRepository?: UserRepository;
    
    constructor(userRepository: UserRepository){
        this.userRepository = userRepository;
    }

    async execute(user: UserDto) : Promise<void> {       
        const oldUser = await this.userRepository?.getById(user.userId);
        const newUser = new User(oldUser as User);
        newUser.update({name: user.name, active: user.active, admin: user.admin, password: user.password, birthday: user.birthday, email: user.email, cpf: user.cpf})
        await this.userRepository?.update(newUser)
    }   
}