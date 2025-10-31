import { RouteParams, RouteResponse } from 'modelence/server';
import { ValidationError } from 'modelence';
import { getDatabase } from '../mongoClient';
import { ErrorResponse, withErrorHandling } from '../utils';

interface RunCommandRequest {
  dataSource: string;
  database: string;
  command: Record<string, any>;
}

interface RunCommandResponse {
  result: Record<string, any>;
}

export async function runCommand(params: RouteParams): Promise<RouteResponse<RunCommandResponse | ErrorResponse>> {
  return withErrorHandling(async () => {
    const { dataSource, database, command } = params.body as RunCommandRequest;

    // Validate required fields
    if (!dataSource) {
      throw new ValidationError("dataSource is required");
    }

    if (!database) {
      throw new ValidationError("database is required");
    }

    if (!command) {
      throw new ValidationError("command is required");
    }

    // Validate command is an object
    if (typeof command !== 'object' || Array.isArray(command)) {
      throw new ValidationError("command must be an object");
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
  });
}