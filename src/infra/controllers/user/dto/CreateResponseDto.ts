import User from "../../../domain/User";

export default interface CreateResponseDto {
  user?: User;
  errorMessage?: string;
  errorStatus?: number;
}
