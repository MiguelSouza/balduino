import User from "../../../domain/User";

export default interface LoginResponseDto {
  accessToken?: string;
  user?: User;
  errorMessage?: string;
  stateCode?: string;
}
