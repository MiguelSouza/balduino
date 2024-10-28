import Table from "../../../domain/Table";

export default interface CreateResponseDto {
  table?: Table;
  errorMessage?: string;
  errorStatus?: number;
}
