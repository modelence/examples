import { RouteParams, RouteResponse } from 'modelence/server';

interface RunCommandRequest {
  dataSource: string;
  database: string;
  command: Record<string, any>;
}

interface RunCommandResponse {
  result: Record<string, any>;
}

export async function runCommand(params: RouteParams): Promise<RouteResponse<RunCommandResponse | { error: string; error_code: string }>> {
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

    // TODO: Connect to MongoDB using dataSource configuration
    // TODO: Get database reference
    // TODO: Execute the database command
    // TODO: Return command result

    // Mock response for now
    return {
      data: {
        result: {
          ok: 1,
          stats: {
            executionTimeMillis: 15,
            totalDocsExamined: 100,
            totalDocsReturned: 25
          }
        }
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