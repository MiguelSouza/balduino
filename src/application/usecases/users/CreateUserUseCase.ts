import CreateResponseDto from "../../../infra/controllers/user/dto/CreateResponseDto";
import UserDto from "../../../infra/controllers/user/dto/UserDto";
import User from "../../../infra/domain/User";
import UserRepository from "../../../infra/repositories/UserRepository";

export default class CreateUserUseCase {
    userRepository?: UserRepository;
    
    constructor(userRepository: UserRepository){
        this.userRepository = userRepository;
    }

    async execute(user: UserDto) : Promise<CreateResponseDto> {
        try{
            const userEntity = new User({name: user.name, active: user.active, admin: user.admin, password: user.password, birthday: user.birthday, email: user.email, cpf: user.cpf})
            const response = await this.userRepository?.save(userEntity)
            return {
                user: response
            }
    
        } catch (err: any) {
            return {
                user: undefined,
                errorMessage: err.message
            }
        }
    }   
}