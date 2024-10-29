import Order from "../../../domain/Order";

export default interface CreateResponseDto {
  order?: Order;
  errorMessage?: string;
  errorStatus?: number;
}
