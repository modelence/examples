import { RouteParams, RouteResponse } from 'modelence/server';
import { getDatabase } from '../db';
import { ErrorResponse } from '../utils';

interface RunCommandRequest {
  dataSource: string;
  database: string;
  command: Record<string, any>;
}

interface RunCommandResponse {
  result: Record<string, any>;
}

export async function runCommand(params: RouteParams): Promise<RouteResponse<RunCommandResponse | ErrorResponse>> {
  try {
    const { dataSource, database, command } = params.body as RunCommandRequest;

    // Validate required fields
    if (!dataSource || !database || !command) {
      return {
        status: 400,
        data: {
          error: "Missing required fields: dataSource, database, command",
          error_code: "InvalidParameter"
        }
      };
    }

    // Validate command is an object
    if (typeof command !== 'object' || Array.isArray(command)) {
      return {
        status: 400,
        data: {
          error: "command must be an object",
          error_code: "InvalidParameter"
        }
      };
    }

    // Security: Restrict certain dangerous commands
    const restrictedCommands = ['shutdown', 'dropDatabase', 'eval', 'mapReduce', 'fsync'];
    const commandName = Object.keys(command)[0]?.toLowerCase();
    
    if (restrictedCommands.includes(commandName)) {
      return {
        status: 403,
        data: {
          error: `Command '${commandName}' is not allowed through the Data API`,
          error_code: "Forbidden"
        }
      };
    }

    // Connect to MongoDB and get database
    const db = await getDatabase(database);

    // Execute the database command
    const result = await db.command(command);

    return {
      data: {
        result
      }
    };
  } catch (error) {
    return {
      status: 500,
      data: {
        error: error instanceof Error ? error.message : "Internal server error",
        error_code: "InternalServerError"
      }
    };
  }
}