import * as dotenv from 'dotenv';
import * as Joi from 'joi';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { Logger, InternalServerErrorException } from '@nestjs/common';
import { LoggerOptions, transports } from 'winston';

import { LoggerEnum } from '~lib/logger';

import { IEnvConfig } from './envConfig.interface';

export class ConfigService {
  private readonly configSchema: Joi.SchemaMap = {
    HOST: Joi.string().required(),
    PORT: Joi.number().default(4000),
    PROTOCOL: Joi.string()
      .lowercase()
      .valid(['http', 'https'])
      .default('http'),
  };
  private envConfig: IEnvConfig;
  private logger = new Logger(ConfigService.name);
  private rootDir: string;
  private runningDir: string;

  constructor() {
    const { CONFIG_PATH: configPath, SECRETS_PATH: secretsPath } = process.env;
    if (configPath && secretsPath) {
      this.getConfigFromVolume(configPath, secretsPath);
    } else {
      this.getConfigFromEnvFile(process.env.NODE_ENV);
    }
    this.rootDir = `${join(process.cwd())}`;
    this.runningDir = `${join(this.rootDir, process.env.baseUrl || '')}`;
  }

  /**
   * GraphQL options and configurations
   */
  // createGqlOptions(): GqlModuleOptions {
  //   const gqlLogger = new Logger(GraphQLModule.name);
  //   return {
  //     autoSchemaFile: `${join(this.runningDir, 'src/domain/schema.gql')}`,
  //     context: ({ req }) => ({ req }),
  //     debug: this.isGraphQLDebugEnabled,
  //     playground: this.isGraphQLPlaygroundEnabled,
  //     formatError: err => {
  //       const { originalError } = err;
  //       let exception: CustomException;
  //       if (originalError instanceof CustomException) {
  //         exception = originalError;
  //       } else {
  //         gqlLogger.error(err);
  //         exception = new GraphqlException(err.message);
  //         // TODO: use pipe validator for GraphQL to discriminate between internal exception and graphql exception
  //       }
  //       return {
  //         statusCode: exception.getStatus(),
  //         code: exception.getCode(),
  //         error: exception.getError(),
  //         message: exception.getMessage(),
  //         locations: err.locations,
  //         path: err.path,
  //       };
  //     },
  //   };
  // }

  /**
   * Mailer options
   */
  // createMailerOptions(): MailerOptions {
  //   return {
  //     defaults: {
  //       from: `"${this.envConfig.EMAIL_FROM_NAME}" <${this.envConfig.EMAIL_FROM_EMAIL}>`,
  //     },
  //     transport: {
  //       host: String(this.envConfig.EMAIL_HOST),
  //       port: parseInt(this.envConfig.EMAIL_PORT, 10),
  //       secure: Boolean(this.envConfig.EMAIL_IS_SECURE),
  //       auth: {
  //         user: String(this.envConfig.EMAIL_FROM_EMAIL),
  //         pass: String(this.envConfig.SECRET_EMAIL),
  //       },
  //     },
  //     template: {
  //       dir: this.rootDir + '/templates/emails',
  //       adapter: new HandlebarsAdapter(),
  //       options: {
  //         strict: true,
  //       },
  //     },
  //   };
  // }

  private extractConfigFromFileList(
    partialConfig: IEnvConfig,
    file: string,
    dir: string,
  ): IEnvConfig {
    const filePath = join(dir, file);
    const fileContent = readFileSync(filePath)
      .toString()
      .trim();
    partialConfig[file] = fileContent;
    return partialConfig;
  }

  private getConfigFromVolume(configPath: string, secretsPath: string) {
    const configFiles = readdirSync(configPath).filter(
      file => !file.includes('..'),
    );
    const secretsFiles = readdirSync(secretsPath).filter(
      file => !file.includes('..'),
    );
    const config: IEnvConfig = {};
    configFiles.reduce(
      (partialConfig, file) =>
        this.extractConfigFromFileList(partialConfig, file, configPath),
      config,
    );
    secretsFiles.reduce(
      (partialConfig, file) =>
        this.extractConfigFromFileList(partialConfig, file, secretsPath),
      config,
    );
    this.envConfig = this.validateInput(config);
  }

  private getConfigFromEnvFile(env: string) {
    if (!env) {
      const msg = `No environment definition found. Please choose one of the following options (in priority order):
      1. Set both the CONFIG_PATH and the SECRETS_PATH environment variables and fill their respective folders with corresponding environment values.
      2. Set the NODE_ENV environment variable and attach the env file to the API.`;
      throw new InternalServerErrorException(msg);
    }
    const envFilePath = join('env', `${env}.env`);
    const envConfig = dotenv.parse(readFileSync(envFilePath));
    this.envConfig = this.validateInput(envConfig);
  }

  // getDbOptions(type: DatabaseType): IDatabaseOptions {
  //   const db = String(type).toUpperCase();
  //   let migrationsRun: boolean;
  //   if (this.envConfig[`DB_${db}_RUN_MIGRATIONS`] === undefined) {
  //     migrationsRun = this.defaultMigrationPolicy;
  //   } else {
  //     migrationsRun = Boolean(this.envConfig[`DB_${db}_RUN_MIGRATIONS`]);
  //   }
  //   return {
  //     database: String(this.envConfig[`DB_${db}_DB_NAME`]),
  //     host: String(this.envConfig[`DB_${db}_HOST`]),
  //     lastMigration: String(this.envConfig[`DB_${db}_LAST_MIGRATION`]),
  //     logging: [TypeormLoggingOptionsEnum.ERROR],
  //     maxQueryExecutionTime: parseInt(
  //       this.envConfig[`DB_${db}_MAX_EXECUTION_TIME`],
  //       10,
  //     ),
  //     migrationsRun,
  //     port: parseInt(this.envConfig[`DB_${db}_PORT`], 10),
  //     password: String(this.envConfig[`SECRET_${db}`]),
  //     username: String(this.envConfig[`DB_${db}_USERNAME`]),
  //     withSample: Boolean(this.envConfig[`DB_${db}_SAMPLE`]),
  //   };
  // }

  getLogOptions(provider: LoggerEnum = LoggerEnum.DEFAULT): LoggerOptions {
    return {
      defaultMeta: {
        name: provider,
      },
      transports: [new transports.Console()],
    };
  }

  printConfig(envConfig: IEnvConfig) {
    const config = Object.keys(envConfig)
      .filter(key => !key.includes('SECRET'))
      .reduce((obj, key) => {
        obj[key] = envConfig[key];
        return obj;
      }, {});
    const secrets = Object.keys(envConfig).filter(key =>
      key.includes('SECRET'),
    );
    this.logger.log(`API configuration:\n${JSON.stringify(config, null, 2)}`);
    this.logger.log(`API secrets:\n${JSON.stringify(secrets, null, 2)}`);
  }

  /**
   * Ensures all needed variables are set, and returns the validated JavaScript object
   * including the applied default values.
   */
  private validateInput(envConfig: IEnvConfig): IEnvConfig {
    const envVarsSchema: Joi.ObjectSchema = Joi.object(this.configSchema);
    const { error, value: validatedEnvConfig } = Joi.validate(
      envConfig,
      envVarsSchema,
    );
    if (error) {
      throw new Error(`Config validation error: ${error.message}`);
    }
    this.printConfig(envConfig);
    return validatedEnvConfig;
  }

  /********************
   * Standard getters *
   ********************/

  get host(): string {
    return String(this.envConfig.HOST);
  }
}
