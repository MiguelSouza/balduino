import LoginUseCase from "./application/usecases/auth/LoginUseCase";
import CreateCustomerUseCase from "./application/usecases/customer/CreateCustomerUseCase";
import DeleteCustomerUseCase from "./application/usecases/customer/DeleteCustomerUseCase";
import GetAllCustomerUseCase from "./application/usecases/customer/GetAllCustomerUseCase";
import GetCustomerByIdUseCase from "./application/usecases/customer/GetCustomerByIdUseCase";
import UpdateCustomerUseCase from "./application/usecases/customer/UpdateCustomerUseCase";
import CreateExpenseUseCase from "./application/usecases/expense/CreateExpenseUseCase";
import DeleteExpenseUseCase from "./application/usecases/expense/DeleteExpenseUseCase";
import GetAllExpensesUseCase from "./application/usecases/expense/GetAllExpensesUseCase";
import GetExpenseByIdUseCase from "./application/usecases/expense/GetExpenseByIdUseCase";
import UpdateExpenseUseCase from "./application/usecases/expense/UpdateExpenseUseCase";
import CreateMonthlyPayerUseCase from "./application/usecases/monthlyPayer/CreateMonthlyPayerUseCase";
import DeleteMonthlyPayerUseCase from "./application/usecases/monthlyPayer/DeleteMonthlyPayerUseCase";
import GetAllMonthlyPayerUseCase from "./application/usecases/monthlyPayer/GetAllMonthlyPayerUseCase";
import GetMonthlyPayerByIdUseCase from "./application/usecases/monthlyPayer/GetMonthlyPayerByIdUseCase";
import GetPaymentsByMonthlyPayerUseCase from "./application/usecases/monthlyPayer/GetPaymentsByMonthlyPayerUseCase";
import PaymentMonthlyUseCase from "./application/usecases/monthlyPayer/PaymentMonthlyUseCase";
import UpdateMonthlyPayerUseCase from "./application/usecases/monthlyPayer/UpdateMonthlyPayerUseCase";
import CloseAccountUseCase from "./application/usecases/order/CloseAccountUseCase";
import CloseAccountWithoutCustomerUseCase from "./application/usecases/order/CloseAccountWithoutCustomerUseCase";
import CreateOrderUseCase from "./application/usecases/order/CreateOrderUseCase";
import DeleteOrderUseCase from "./application/usecases/order/DeleteOrderUseCase";
import GetAllOrdersByCustomerUseCase from "./application/usecases/order/GetAllOrdersByCustomerUseCase copy";
import GetAllOrdersUseCase from "./application/usecases/order/GetAllOrdersUseCase";
import GetOrderByIdUseCase from "./application/usecases/order/GetOrderById";
import GetOrdersToCloseOfTheDayUseCase from "./application/usecases/order/GetOrdersToCloseOfTheDayUseCase";
import PartialPaymentUseCase from "./application/usecases/order/PartialPaymentUseCase";
import UpdateOrderUseCase from "./application/usecases/order/UpdateOrderUseCase";
import CreateProductUseCase from "./application/usecases/product/CreateProductUseCase";
import DeleteProductUseCase from "./application/usecases/product/DeleteProductUseCase";
import GetAllProductsUseCase from "./application/usecases/product/GetAllProductsUseCase";
import GetProductByIdUseCase from "./application/usecases/product/GetProductByIdUseCase";
import UpdateProductUseCase from "./application/usecases/product/UpdateProductUseCase";
import UploadImageUseCase from "./application/usecases/product/UploadImageUseCase";
import CreateTableUseCase from "./application/usecases/table/CreateTableUseCase";
import DeleteTableUseCase from "./application/usecases/table/DeleteTableUseCase";
import GetAllTableUseCase from "./application/usecases/table/GetAllTableUseCase";
import GetTablesByIdUseCase from "./application/usecases/table/GetTablesByIdUseCase";
import UpdateTableUseCase from "./application/usecases/table/UpdateTableUseCase";
import CreateUserUseCase from "./application/usecases/users/CreateUserUseCase";
import DeleteUserUseCase from "./application/usecases/users/DeleteUserUseCase";
import GetAllUseCase from "./application/usecases/users/GetAllUseCase";
import GetUserByEmailUseCase from "./application/usecases/users/GetUserByEmailUseCase";
import GetUsersByIdUseCase from "./application/usecases/users/GetUsersByIdUseCase";
import UpdateUserUseCase from "./application/usecases/users/UpdateUserUseCase";
import AuthController from "./infra/controllers/auth/AuthController";
import CustomerController from "./infra/controllers/customer/CustomerController";
import ExpenseController from "./infra/controllers/expense/ExpenseController";
import MonthlyPayerController from "./infra/controllers/monthlyPayer/MonthlyPayerController";
import OrderController from "./infra/controllers/order/OrderController";
import ProductController from "./infra/controllers/product/ProductController";
import TableController from "./infra/controllers/table/TableController";
import UserController from "./infra/controllers/user/UserController";
import DatabaseConnection from "./infra/database/DatabaseConnection";
import HttpServer from "./infra/http/HttpServer";
import CustomerRepository from "./infra/repositories/CustomerRepository";
import ExpenseRepository from "./infra/repositories/ExpenseRepository";
import MonthlyPayerRepository from "./infra/repositories/MonthlyPayerRepository";
import OrderRepository from "./infra/repositories/OrderRepository";
import ProductRepository from "./infra/repositories/ProductRepository";
import TableRepository from "./infra/repositories/TableRepository";
import UserRepository from "./infra/repositories/UserRepository";

async function main() {
  const httpServer = new HttpServer();
  const databaseConnection = new DatabaseConnection();
  const userRepository = new UserRepository(databaseConnection);
  const createUserUseCase = new CreateUserUseCase(userRepository);
  const updateUserUseCase = new UpdateUserUseCase(userRepository);
  const deleteUserUseCase = new DeleteUserUseCase(userRepository);
  const getAllUseCase = new GetAllUseCase(userRepository);
  const getUsersByIdUseCase = new GetUsersByIdUseCase(userRepository);

  new UserController(
    httpServer,
    createUserUseCase,
    updateUserUseCase,
    deleteUserUseCase,
    getAllUseCase,
    getUsersByIdUseCase,
  );
  const loginUseCase = new LoginUseCase(userRepository);
  new AuthController(httpServer, loginUseCase);

  const tableRepository = new TableRepository(databaseConnection);
  const createTableUseCase = new CreateTableUseCase(tableRepository);
  const updateTableUseCase = new UpdateTableUseCase(tableRepository);
  const deleteTableUseCase = new DeleteTableUseCase(tableRepository);
  const getAllTableUseCase = new GetAllTableUseCase(tableRepository);
  const getTablesByIdUseCase = new GetTablesByIdUseCase(tableRepository);

  new TableController(
    httpServer,
    createTableUseCase,
    updateTableUseCase,
    deleteTableUseCase,
    getAllTableUseCase,
    getTablesByIdUseCase,
  );

  const customerRepository = new CustomerRepository(databaseConnection);
  const createCustomerUseCase = new CreateCustomerUseCase(customerRepository);
  const updateCustomerUseCase = new UpdateCustomerUseCase(customerRepository);
  const deleteCustomerUseCase = new DeleteCustomerUseCase(customerRepository);
  const getAllCustomerUseCase = new GetAllCustomerUseCase(customerRepository);
  const getCustomerByIdUseCase = new GetCustomerByIdUseCase(customerRepository);

  new CustomerController(
    httpServer,
    createCustomerUseCase,
    updateCustomerUseCase,
    deleteCustomerUseCase,
    getAllCustomerUseCase,
    getCustomerByIdUseCase,
  );

  const productRepository = new ProductRepository(databaseConnection);
  const createProductUseCase = new CreateProductUseCase(productRepository);
  const updateProductUseCase = new UpdateProductUseCase(productRepository);
  const deleteProductUseCase = new DeleteProductUseCase(productRepository);
  const getAllProductUseCase = new GetAllProductsUseCase(productRepository);
  const getProductByIdUseCase = new GetProductByIdUseCase(productRepository);
  const uploadImageUseCase = new UploadImageUseCase();

  new ProductController(
    httpServer,
    createProductUseCase,
    updateProductUseCase,
    deleteProductUseCase,
    getAllProductUseCase,
    getProductByIdUseCase,
    uploadImageUseCase,
  );

  const orderRepository = new OrderRepository(databaseConnection);
  const createOrderUseCase = new CreateOrderUseCase(orderRepository, userRepository);
  const updateOrderUseCase = new UpdateOrderUseCase(orderRepository);
  const deleteOrderUseCase = new DeleteOrderUseCase(orderRepository);
  const getAllOrderUseCase = new GetAllOrdersUseCase(orderRepository);
  const getAllOrdersByCustomerUseCase = new GetAllOrdersByCustomerUseCase(orderRepository);
  const getOrderByIdUseCase = new GetOrderByIdUseCase(orderRepository);
  const closeAccountUseCase = new CloseAccountUseCase(orderRepository);
  const closeAccountWithoutCustomerUseCase = new CloseAccountWithoutCustomerUseCase(orderRepository, userRepository);
  const getOrdersToCloseOfTheDayUseCase = new GetOrdersToCloseOfTheDayUseCase(orderRepository);
  const partialPaymentUseCase = new PartialPaymentUseCase(orderRepository);

  new OrderController(
    httpServer,
    createOrderUseCase,
    updateOrderUseCase,
    deleteOrderUseCase,
    getAllOrderUseCase,
    getAllOrdersByCustomerUseCase,
    getOrderByIdUseCase,
    closeAccountUseCase,
    closeAccountWithoutCustomerUseCase,
    getOrdersToCloseOfTheDayUseCase,
    partialPaymentUseCase
  );

  const expenseRepository = new ExpenseRepository(databaseConnection);
  const createExpenseUseCase = new CreateExpenseUseCase(expenseRepository);
  const updateExpenseUseCase = new UpdateExpenseUseCase(expenseRepository);
  const deleteExpenseUseCase = new DeleteExpenseUseCase(expenseRepository);
  const getAllExpenseUseCase = new GetAllExpensesUseCase(expenseRepository);
  const getExpenseByIdUseCase = new GetExpenseByIdUseCase(expenseRepository);

  new ExpenseController(
    httpServer,
    createExpenseUseCase,
    updateExpenseUseCase,
    deleteExpenseUseCase,
    getAllExpenseUseCase,
    getExpenseByIdUseCase,
  );

  const monthlyPayerRepository = new MonthlyPayerRepository(databaseConnection);
  const createMonthlyPayerUseCase = new CreateMonthlyPayerUseCase(monthlyPayerRepository);
  const updateMonthlyPayerUseCase = new UpdateMonthlyPayerUseCase(monthlyPayerRepository);
  const deleteMonthlyPayerUseCase = new DeleteMonthlyPayerUseCase(monthlyPayerRepository);
  const getAllMonthlyPayerUseCase = new GetAllMonthlyPayerUseCase(monthlyPayerRepository);
  const getMonthlyPayerByIdUseCase = new GetMonthlyPayerByIdUseCase(monthlyPayerRepository);
  const getPaymentsByMonthlyPayerUseCase = new GetPaymentsByMonthlyPayerUseCase(monthlyPayerRepository);
  const paymentMonthlyUseCase = new PaymentMonthlyUseCase(monthlyPayerRepository);

  new MonthlyPayerController(
    httpServer,
    createMonthlyPayerUseCase,
    updateMonthlyPayerUseCase,
    deleteMonthlyPayerUseCase,
    getAllMonthlyPayerUseCase,
    getMonthlyPayerByIdUseCase,
    getPaymentsByMonthlyPayerUseCase,
    paymentMonthlyUseCase
  );

  httpServer.listen(3000);
}

process.on('uncaughtException', (error: Error) => {
  console.log(JSON.stringify(error))
  console.error(`Uncaught Exception: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
 });

main();
