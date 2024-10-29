import Product from "../../infra/domain/Product";

export default interface IProductRepository {
  save(product: Product): Promise<Product>;
  update(product: Product): void;
  getById(productId: string): Promise<Product>;
  getAll(): Promise<Product[]>;
  delete(productId: string): void;
  getByName(name: string): Promise<Product>;
}
