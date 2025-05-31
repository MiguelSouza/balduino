import DatabaseConnection from '../database/DatabaseConnection';
import HttpServer from '../http/HttpServer';
import createUserModule from './user.module';

export default function initializeModules(httpServer: HttpServer, dbConnection: DatabaseConnection) {
  createUserModule(httpServer, dbConnection);
}
