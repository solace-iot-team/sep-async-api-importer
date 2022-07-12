import { CliError, ConfigMissingEnvVarError, InvalidEnvVarValueFromListError, InvalidFileConfigError } from './CliError';
import { CliLogger, ECliStatusCodes } from './CliLogger';
import { Command, OptionValues } from 'commander';
import { CliUtils } from './CliUtils';

export enum ECliAssetImportTargetLifecycleState_VersionStrategy {
  BUMP_MINOR = "bump_minor",
  BUMP_PATCH = "bump_patch"
}
const ValidEnvAssetImportTargetLifecycleState_VersionStrategy = {
  BUMP_MINOR: ECliAssetImportTargetLifecycleState_VersionStrategy.BUMP_MINOR,
  BUMP_PATCH: ECliAssetImportTargetLifecycleState_VersionStrategy.BUMP_PATCH
}
export enum ECliAssetImportTargetLifecycleState {
  RELEASED = "released",
  DRAFT = "draft",
}
const ValidEnvAssetImportTargetLifecycleState = {
  RELEASED: ECliAssetImportTargetLifecycleState.RELEASED,
  DRAFT: ECliAssetImportTargetLifecycleState.DRAFT,
}
export type TAssetImportTargetLifecycleState_Base = {
  versionStrategy: ECliAssetImportTargetLifecycleState_VersionStrategy;
}
export type TAssetImportTargetLifecycleState_Draft = TAssetImportTargetLifecycleState_Base & {
  type: ECliAssetImportTargetLifecycleState.DRAFT;
}
export type TAssetImportTargetLifecycleState_Released = TAssetImportTargetLifecycleState_Base & {
  type: ECliAssetImportTargetLifecycleState.RELEASED;
}
export type TAssetImportTargetLifecycleState = TAssetImportTargetLifecycleState_Draft | TAssetImportTargetLifecycleState_Released;

export enum ECliAssetsTargetState {
  PRESENT = "present",
  ABSENT = "absent",
}
const ValidEnvAssetsTargetState = {
  PRESENT: ECliAssetsTargetState.PRESENT,
  ABSENT: ECliAssetsTargetState.ABSENT,
}
  
export type TCliLoggerConfig = {
  appId: string,
  level: string
};
export type TCliAppConfig = {
  assetsTargetState: ECliAssetsTargetState;
  asyncApiSpecFileName: string;
  domainName?: string;
  // domainId?: string;  - where would we get this from?
  assetImportTargetLifecycleState: TAssetImportTargetLifecycleState;
}
export type TCliConfig = {
  appId: string;
  cliLoggerConfig: TCliLoggerConfig;
  appConfig: TCliAppConfig;
};

export enum EEnvVars {
  CLI_APP_ID = 'CLI_APP_ID',
  CLI_SOLACE_CLOUD_TOKEN = "CLI_SOLACE_CLOUD_TOKEN",
  CLI_LOGGER_LOG_LEVEL= 'CLI_LOGGER_LOG_LEVEL',
  CLI_ASSETS_TARGET_STATE = "CLI_ASSETS_TARGET_STATE",
  CLI_ASSET_IMPORT_TARGET_LIFECYLE_STATE = "CLI_ASSET_IMPORT_TARGET_LIFECYLE_STATE",
  CLI_ASSET_IMPORT_TARGET_VERSION_STRATEGY = "CLI_ASSET_IMPORT_TARGET_VERSION_STRATEGY",
};


export class CliConfig {
  private static Program = new Command();
  private config: TCliConfig;
  private solaceCloudToken: string;
  public static DEFAULT_APP_ID = "@solace-iot-team/sep-async-api-importer";
  public static DEFAULT_LOGGER_LOG_LEVEL = "info";
  private static DEFAULT_ASSETS_TARGET_STATE = ValidEnvAssetsTargetState.PRESENT;
  private static DEFAULT_CLI_ASSET_IMPORT_TARGET_LIFECYLE_STATE = ValidEnvAssetImportTargetLifecycleState.DRAFT;
  private static DEFAULT_CLI_ASSET_IMPORT_TARGET_VERSION_STRATEGY = ValidEnvAssetImportTargetLifecycleState_VersionStrategy.BUMP_PATCH;

  private static DefaultCliLoggerConfig: TCliLoggerConfig = {
    appId: CliConfig.DEFAULT_APP_ID,
    level: CliConfig.DEFAULT_LOGGER_LOG_LEVEL,
  };

  private getOptionalEnvVarValueAsString_From_List_WithDefault = (envVarName: string, list: Array<string>, defaultValue: string): string => {
    const funcName = 'getOptionalEnvVarValueAsString_From_List_WithDefault';
    const logName = `${CliConfig.name}.${funcName}()`;
    const value: string | undefined = process.env[envVarName];
    if(!value) return defaultValue;
    if(!list.includes(value.toLowerCase())) throw new InvalidEnvVarValueFromListError(logName, 'invalid value', envVarName, value, list);    
    return value.toLowerCase();
  };

  // private getMandatoryEnvVarValueAsString_From_List = (envVarName: string, list: Array<string>): string => {
  //   const funcName = 'getMandatoryEnvVarValueAsString_From_List';
  //   const logName = `${CliConfig.name}.${funcName}()`;
  //   const value: string | undefined = process.env[envVarName];
  //   if (!value) throw new ConfigMissingEnvVarServerError(logName, 'mandatory env var missing', envVarName);    
  //   if(!list.includes(value.toLowerCase())) throw new ConfigInvalidEnvVarValueFromListServerError(logName, 'invalid value', envVarName, value, list);    
  //   return value.toLowerCase();
  // };

  private getMandatoryEnvVarValueAsString = (envVarName: string): string => {
    const funcName = 'getMandatoryEnvVarValueAsString';
    const logName = `${CliConfig.name}.${funcName}()`;
    const value: string | undefined = process.env[envVarName];
    if (!value) throw new ConfigMissingEnvVarError(logName, 'mandatory env var missing', envVarName);    
    return value;
  };

  // private getOptionalEnvVarValueAsString = (envVarName: string): string | undefined => {
  //   return process.env[envVarName];
  // }

  private getOptionalEnvVarValueAsStringWithDefault = (envVarName: string, defaultValue: string): string => {
    const value: string | undefined = process.env[envVarName];
    if(value === undefined) return defaultValue;
    return value;    
  }
  
  // private getOptionalEnvVarValueAsBoolean = (envVarName: string, defaultValue: boolean): boolean => {
  //   const value: string | undefined = process.env[envVarName];
  //   if(!value) return defaultValue;
  //   return value.toLowerCase() === 'true';
  // };

  // private getMandatoryEnvVarValueAsNumber = (envVarName: string): number => {
  //   const funcName = 'getMandatoryEnvVarValueAsNumber';
  //   const logName = `${CliConfig.name}.${funcName}()`;
  //   const value: string = this.getMandatoryEnvVarValueAsString(envVarName);
  //   const valueAsNumber: number = parseInt(value);
  //   if (Number.isNaN(valueAsNumber)) throw new ConfigEnvVarNotANumberServerError(logName, 'env var type is not a number', envVarName, value);
  //   return valueAsNumber;
  // };

  // private getOptionalEnvVarValueAsPathWithReadPermissions = (envVarName: string): string | undefined => {
  //   const value = this.getOptionalEnvVarValueAsString(envVarName);
  //   if(!value) return undefined;
  //   return ServerUtils.validateFilePathWithReadPermission(value);
  // }

  // constructor() { }

  private initialize_AssetImportTargetLifecycleState = (): TAssetImportTargetLifecycleState => {
    const funcName = 'initialize_AssetImportTargetLifecycleState';
    const logName = `${CliConfig.name}.${funcName}()`;

    const cliAssetImportTargetLifecycleState: ECliAssetImportTargetLifecycleState = this.getOptionalEnvVarValueAsString_From_List_WithDefault(EEnvVars.CLI_ASSET_IMPORT_TARGET_LIFECYLE_STATE, Object.values(ValidEnvAssetImportTargetLifecycleState), CliConfig.DEFAULT_CLI_ASSET_IMPORT_TARGET_LIFECYLE_STATE) as ECliAssetImportTargetLifecycleState;
    const cliAssetImportTargetLifecycleState_VersionStrategy: ECliAssetImportTargetLifecycleState_VersionStrategy = this.getOptionalEnvVarValueAsString_From_List_WithDefault(EEnvVars.CLI_ASSET_IMPORT_TARGET_VERSION_STRATEGY, Object.values(ValidEnvAssetImportTargetLifecycleState_VersionStrategy), CliConfig.DEFAULT_CLI_ASSET_IMPORT_TARGET_VERSION_STRATEGY) as ECliAssetImportTargetLifecycleState_VersionStrategy;

    switch(cliAssetImportTargetLifecycleState) {
      case ECliAssetImportTargetLifecycleState.DRAFT:
        const assetImportTargetLifecycleState_Draft: TAssetImportTargetLifecycleState_Draft = {
          type: ECliAssetImportTargetLifecycleState.DRAFT,
          versionStrategy: cliAssetImportTargetLifecycleState_VersionStrategy,
        };
        return assetImportTargetLifecycleState_Draft;
      case ECliAssetImportTargetLifecycleState.RELEASED:
        const assetImportTargetLifecycleState_Released: TAssetImportTargetLifecycleState_Released = {
          type: ECliAssetImportTargetLifecycleState.RELEASED,
          versionStrategy: cliAssetImportTargetLifecycleState_VersionStrategy,
        };
        return assetImportTargetLifecycleState_Released;
      default:
        CliUtils.assertNever(logName, cliAssetImportTargetLifecycleState);
    }
    // should never get here
    throw new CliError(logName, "internal error");
  }

  public initialize = (packageJson: any): void => {
    const funcName = 'initialize';
    const logName = `${CliConfig.name}.${funcName}()`;

    // TODO: make the options typesafe
    CliConfig.Program
    .name(`npx ${packageJson.name}`)
    .description(`${packageJson.description}`)
    .version(`${packageJson.version}`, '-v, --version')
    .usage('[OPTIONS]...')
    .requiredOption('-f, --file <value>', 'Required: Path to AsyncAPI spec file')
    .option('-d, --domain  <value>', 'Application Domain Name. If not passed, name extracted from x-domain-name in spec file')
    // where would you get this from?
    // .option('-dID, --domainId <value>', 'Application Domain ID. If not passed, ID extracted from x-domain-id in spec file')
    .parse(process.argv);
  
    const options: OptionValues = CliConfig.Program.opts();    
    // console.log(`${logName}: options=${JSON.stringify(options, null, 2)}`);
  
    try {

      // handle solace cloud token separately
      this.solaceCloudToken = this.getMandatoryEnvVarValueAsString(EEnvVars.CLI_SOLACE_CLOUD_TOKEN);

      const asyncApiSpecFileName: string | undefined = CliUtils.validateFilePathWithReadPermission(options.file);
      if(asyncApiSpecFileName === undefined) {
        throw new InvalidFileConfigError(logName, 'cannot read asyncApiSpecFile', options.file);    
      }

      const appId: string = this.getOptionalEnvVarValueAsStringWithDefault(EEnvVars.CLI_APP_ID, CliConfig.DEFAULT_APP_ID);

      this.config = {
        appId: appId,
        cliLoggerConfig: {
          appId: appId,
          level: this.getOptionalEnvVarValueAsStringWithDefault(EEnvVars.CLI_LOGGER_LOG_LEVEL, CliConfig.DEFAULT_LOGGER_LOG_LEVEL),
        },
        appConfig: {
          assetsTargetState: this.getOptionalEnvVarValueAsString_From_List_WithDefault(EEnvVars.CLI_ASSETS_TARGET_STATE, Object.values(ValidEnvAssetsTargetState), CliConfig.DEFAULT_ASSETS_TARGET_STATE) as ECliAssetsTargetState,
          asyncApiSpecFileName: asyncApiSpecFileName,
          domainName: options.domain ? options.domain : undefined,
          // domainId: options.domainId ? options.domainId : undefined,
          assetImportTargetLifecycleState: this.initialize_AssetImportTargetLifecycleState(),
        }
      };
    } catch(e) {
      if(e instanceof CliError) {
        const se: CliError = e as CliError;
        CliLogger.fatal(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.INITIALIZING, message: 'env', details: se.toObject() }));
      }
      throw e;
    }
  }

  public logConfig = (): void => {
    const funcName = 'logConfig';
    const logName = `${CliConfig.name}.${funcName}()`;
    // CliLogger.info(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.INITIALIZING, message: 'environment', details: process.env }));
    CliLogger.debug(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.INITIALIZING, message: 'config', details: this.config }));
  }

  public getConfig = (): TCliConfig => {
    return this.config;
  };

  public getAppDisplayName = (): string => {
    return this.config.appId;
  }

  public getCliLoggerConfig = (): TCliLoggerConfig => {
    if(this.config && this.config.cliLoggerConfig) return this.config.cliLoggerConfig;
    else return CliConfig.DefaultCliLoggerConfig;
  }

  public getCliAppConfig = (): TCliAppConfig => {
    return this.config.appConfig;
  }

  public getSolaceCloudToken = (): string => {
    return this.solaceCloudToken;
  }
}

export default new CliConfig();