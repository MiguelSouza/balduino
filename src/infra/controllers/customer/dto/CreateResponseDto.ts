import Customer from "../../../domain/Customer";

export default interface CreateResponseDto {
  customer?: Customer;
  errorMessage?: string;
  errorStatus?: number;
}
