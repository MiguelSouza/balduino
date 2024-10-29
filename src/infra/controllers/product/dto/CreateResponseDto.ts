import Product from "../../../domain/Product";

export default interface CreateResponseDto {
  product?: Product;
  errorMessage?: string;
  errorStatus?: number;
}
