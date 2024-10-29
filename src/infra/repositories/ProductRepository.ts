import IProductRepository from "../../application/repositories/ProductRepository";
import DatabaseConnection from "../database/DatabaseConnection";
import Product from "../domain/Product";

export default class ProductRepository implements IProductRepository {
  connection?: DatabaseConnection;

  constructor(connection: DatabaseConnection) {
    this.connection = connection;
  }

  async save(product: Product): Promise<Product> {
    return this.connection?.query(
      "insert into balduino.product (product_id, name, value, image, active, created_at, updated_at) values ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [
        product.productId,
        product.name,
        product.value,
        product.image,
        product.active,
        product.createdAt,
        product.updatedAt,
      ],
    );
  }

  async update(product: Product): Promise<void> {
    await this.connection?.query(
      `UPDATE balduino.product
            SET name = $1, value = $2, image = $3, active = $4, updated_at = $5 
            WHERE product_id = $6`,
      [
        product.name,
        product.value,
        product.image,
        product.active,
        new Date(),
        product.productId,
      ],
    );
  }

  async getByName(name: string): Promise<Product> {
    const result = await this.connection?.query(
      "SELECT * FROM balduino.product WHERE table_id like '%$1%'",
      [name],
    );
    return result.length > 0 ? result[0] : null;
  }

  async getById(productId: string): Promise<Product> {
    const result = await this.connection?.query(
      "SELECT * FROM balduino.product WHERE product_id = $1",
      [productId],
    );
    return result.length > 0 ? result[0] : null;
  }

  async getAll(): Promise<Product[]> {
    return this.connection?.query("SELECT * FROM balduino.product", null);
  }

  async delete(productId: string): Promise<void> {
    this.connection?.query("delete from balduino.product where product_id = $1", [
      productId,
    ]);
  }
}
