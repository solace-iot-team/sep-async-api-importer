import { CliEPApiError, CliError } from "../CliError";
import { CliLogger, ECliStatusCodes } from "../CliLogger";
import { CliTask, ICliTaskKeys, ICliGetFuncReturn, ICliTaskConfig, ICliCreateFuncReturn, ICliTaskExecuteReturn, ICliUpdateFuncReturn } from "./CliTask";
import { Enum, EnumResponse, EnumsResponse, EnumsService, Event as EPEvent, EventResponse, EventsResponse, EventsService} from "../_generated/@solace-iot-team/sep-openapi-node";
import isEqual from "lodash.isequal";

// applicationDomainId?: string;
// name?: string;
// shared?: boolean;

type TCliEnumTask_Settings = Partial<Pick<Enum, "shared">>;
type TCliEnumTask_CompareObject = TCliEnumTask_Settings;

export interface ICliEnumTask_Config extends ICliTaskConfig {
  enumName: string;
  applicationDomainId: string;
  enumObjectSettings: Required<TCliEnumTask_Settings>;
}
export interface ICliEnumTask_Keys extends ICliTaskKeys {
  enumName: string;
  applicationDomainId: string;
}
export interface ICliEnumTask_GetFuncReturn extends ICliGetFuncReturn {
  enumObject: Enum | undefined;
}
export interface ICliEnumTask_CreateFuncReturn extends ICliCreateFuncReturn {
  enumObject: Enum;
}
export interface ICliEnumTask_UpdateFuncReturn extends ICliUpdateFuncReturn {
  enumObject: Enum;
}
export interface ICliEnumTask_ExecuteReturn extends ICliTaskExecuteReturn {
  enumObject: Enum;
}

export class CliEnumTask extends CliTask {

  private readonly Empty_ICliEnumTask_GetFuncReturn: ICliEnumTask_GetFuncReturn = {
    apiObject: undefined,
    documentExists: false  ,
    enumObject: undefined,
  };
  private readonly Default_TCliEnumTask_Settings: TCliEnumTask_Settings = {
    shared: true,
  }
  private getCliTaskConfig(): ICliEnumTask_Config { return this.cliTaskConfig as ICliEnumTask_Config; }
  private createObjectSettings(): Partial<EPEvent> {
    return {
      ...this.Default_TCliEnumTask_Settings,
      ...this.getCliTaskConfig().enumObjectSettings,
    };
  }

  constructor(taskConfig: ICliEnumTask_Config) {
    super(taskConfig);
  }

  protected getTaskKeys(): ICliEnumTask_Keys {
    return {
      enumName: this.getCliTaskConfig().enumName,
      applicationDomainId: this.getCliTaskConfig().applicationDomainId,
    };
  }

  protected async getFunc(cliTaskKeys: ICliEnumTask_Keys): Promise<ICliEnumTask_GetFuncReturn> {
    const funcName = 'getFunc';
    const logName = `${CliEnumTask.name}.${funcName}()`;

    CliLogger.trace(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.EXECUTING_TASK_GET, details: {
      cliTaskKeys: cliTaskKeys
    }}));

    const enumsResponse: EnumsResponse = await EnumsService.listEnum({
      applicationDomainIds: [cliTaskKeys.applicationDomainId],
      names: [cliTaskKeys.enumName]
    });

    CliLogger.trace(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.EXECUTING_TASK_GET, details: {
      enumsResponse: enumsResponse
    }}));

    if(enumsResponse.data === undefined || enumsResponse.data.length === 0) return this.Empty_ICliEnumTask_GetFuncReturn;
    if(enumsResponse.data.length > 1) throw new CliError(logName, 'enumsResponse.data.length > 1');

    const cliEnumTask_GetFuncReturn: ICliEnumTask_GetFuncReturn = {
      apiObject: enumsResponse.data[0],
      enumObject: enumsResponse.data[0],
      documentExists: true,
    }
    return cliEnumTask_GetFuncReturn;
  };

  protected isUpdateRequired({ cliGetFuncReturn}: { 
    cliGetFuncReturn: ICliEnumTask_GetFuncReturn; 
  }): boolean {
    const funcName = 'isUpdateRequired';
    const logName = `${CliEnumTask.name}.${funcName}()`;
    if(cliGetFuncReturn.enumObject === undefined) throw new CliError(logName, 'cliGetFuncReturn.enumObject === undefined');
    let isUpdateRequired: boolean = false;

    const existingObject: EPEvent = cliGetFuncReturn.enumObject;
    const existingCompareObject: TCliEnumTask_CompareObject = {
      shared: existingObject.shared,
    }
    const requestedCompareObject: TCliEnumTask_CompareObject = this.createObjectSettings();
    isUpdateRequired = !isEqual(existingCompareObject, requestedCompareObject);
    CliLogger.trace(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.EXECUTING_TASK_IS_UPDATE_REQUIRED, details: {
      existingCompareObject: existingCompareObject,
      requestedCompareObject: requestedCompareObject,
      isUpdateRequired: isUpdateRequired
    }}));
    return isUpdateRequired;
  }

  protected async createFunc(): Promise<ICliEnumTask_CreateFuncReturn> {
    const funcName = 'createFunc';
    const logName = `${CliEnumTask.name}.${funcName}()`;

    const create: Enum = {
      ...this.createObjectSettings(),
      applicationDomainId: this.getCliTaskConfig().applicationDomainId,
      name: this.getCliTaskConfig().enumName,
    };

    CliLogger.trace(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.EXECUTING_TASK_CREATE, details: {
      document: create
    }}));

    const enumResponse: EnumResponse = await EnumsService.postEnum({
      requestBody: create
    });

    CliLogger.trace(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.EXECUTING_TASK_CREATE, details: {
      enumResponse: enumResponse
    }}));

    if(enumResponse.data === undefined) throw new CliEPApiError(logName, 'enumResponse.data === undefined', {
      enumResponse: enumResponse
    });

    const created: Enum = enumResponse.data;
    CliLogger.trace(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.EXECUTING_TASK_CREATE, details: {
      created: created
    }}));
    return {
       enumObject: created,
       apiObject: created,
    };
  }

  protected async updateFunc(cliGetFuncReturn: ICliEnumTask_GetFuncReturn): Promise<ICliEnumTask_UpdateFuncReturn> {
    const funcName = 'updateFunc';
    const logName = `${CliEnumTask.name}.${funcName}()`;
    if(cliGetFuncReturn.enumObject === undefined) throw new CliError(logName, 'cliGetFuncReturn.enumObject === undefined');

    const update: Enum = {
      ...this.createObjectSettings(),
      applicationDomainId: this.getCliTaskConfig().applicationDomainId,
      name: this.getCliTaskConfig().enumName,
    };
    CliLogger.trace(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.EXECUTING_TASK_UPDATE, details: {
      document: update
    }}));
    if(cliGetFuncReturn.enumObject.id === undefined) throw new CliEPApiError(logName, 'cliGetFuncReturn.enumObject.id === undefined', {
      enumObject: cliGetFuncReturn.enumObject
    });
    const enumResponse: EnumResponse = await EnumsService.updateEnum({
      id: cliGetFuncReturn.enumObject.id,
      requestBody: update
    });
    CliLogger.trace(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.EXECUTING_TASK_UPDATE, details: {
      enumResponse: enumResponse
    }}));
    if(enumResponse.data === undefined) throw new CliEPApiError(logName, 'enumResponse.data === undefined', {
      enumResponse: enumResponse
    });
    const cliEnumTask_UpdateFuncReturn: ICliEnumTask_UpdateFuncReturn = {
      apiObject: enumResponse.data,
      enumObject: enumResponse.data,
    };
    return cliEnumTask_UpdateFuncReturn;
  }

  public async execute(): Promise<ICliEnumTask_ExecuteReturn> { 
    const funcName = 'execute';
    const logName = `${CliEnumTask.name}.${funcName}()`;

    const cliTaskExecuteReturn: ICliTaskExecuteReturn = await super.execute();
    if(cliTaskExecuteReturn.apiObject === undefined) throw new CliError(logName, 'cliTaskExecuteReturn.apiObject === undefined');

    const cliEnumTask_ExecuteReturn: ICliEnumTask_ExecuteReturn = {
      cliTaskState: cliTaskExecuteReturn.cliTaskState,
      apiObject: undefined,
      enumObject: cliTaskExecuteReturn.apiObject
    };
    return cliEnumTask_ExecuteReturn;
  }

}
