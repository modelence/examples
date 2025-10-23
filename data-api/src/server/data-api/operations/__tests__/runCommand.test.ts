import { runCommand } from '../runCommand';
import { getDatabase } from '../../mongoClient';
import { createMockDatabase, mockRouteParams } from '../../__tests__/testUtils';

jest.mock('../../mongoClient');

describe('runCommand', () => {
  const mockGetDatabase = getDatabase as jest.MockedFunction<typeof getDatabase>;
  let mockDb: ReturnType<typeof createMockDatabase>;

  beforeEach(() => {
    mockDb = createMockDatabase();
    mockGetDatabase.mockResolvedValue(mockDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should run a database command successfully', async () => {
    mockDb.command.mockResolvedValue({ ok: 1, result: 'success' });

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      command: { ping: 1 },
    });

    const result = await runCommand(params);

    expect(mockGetDatabase).toHaveBeenCalledWith('test-db');
    expect(mockDb.command).toHaveBeenCalledWith({ ping: 1 });
    expect(result).toEqual({
      data: {
        result: { ok: 1, result: 'success' },
      },
    });
  });

  it('should execute dbStats command', async () => {
    mockDb.command.mockResolvedValue({
      db: 'test-db',
      collections: 5,
      objects: 1000,
      avgObjSize: 256,
      dataSize: 256000,
      ok: 1,
    });

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      command: { dbStats: 1 },
    });

    const result = await runCommand(params);

    expect(mockDb.command).toHaveBeenCalledWith({ dbStats: 1 });
    expect(result.data?.result).toHaveProperty('ok', 1);
  });

  it('should return 403 for restricted commands', async () => {
    const restrictedCommands = ['shutdown', 'eval', 'fsync'];

    for (const cmd of restrictedCommands) {
      // Reset mocks for each iteration
      jest.clearAllMocks();
      mockGetDatabase.mockResolvedValue(mockDb);

      const params = mockRouteParams({
        dataSource: 'test-source',
        database: 'test-db',
        command: { [cmd]: 1 },
      });

      const result = await runCommand(params);

      expect(result).toEqual({
        status: 403,
        data: {
          error: `Command '${cmd}' is not allowed through the Data API`,
          error_code: 'Forbidden',
        },
      });
      expect(mockDb.command).not.toHaveBeenCalled();
    }
  });

  it('should be case-insensitive for restricted commands', async () => {
    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      command: { ShUtDoWn: 1 },
    });

    const result = await runCommand(params);

    expect(result).toEqual({
      status: 403,
      data: {
        error: "Command 'shutdown' is not allowed through the Data API",
        error_code: 'Forbidden',
      },
    });
  });

  it('should return 400 if command is not an object', async () => {
    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      command: 'ping',
    });

    const result = await runCommand(params);

    expect(result).toEqual({
      status: 400,
      data: {
        error: 'command must be an object',
        error_code: 'InvalidParameter',
      },
    });
    expect(mockGetDatabase).not.toHaveBeenCalled();
  });

  it('should return 400 if command is an array', async () => {
    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      command: ['ping'],
    });

    const result = await runCommand(params);

    expect(result).toEqual({
      status: 400,
      data: {
        error: 'command must be an object',
        error_code: 'InvalidParameter',
      },
    });
  });

  it('should return 400 if required fields are missing', async () => {
    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
    });

    const result = await runCommand(params);

    expect(result).toEqual({
      status: 400,
      data: {
        error: 'Missing required fields: dataSource, database, command',
        error_code: 'InvalidParameter',
      },
    });
  });

  it('should return 500 on database error', async () => {
    mockDb.command.mockRejectedValue(new Error('Command failed'));

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      command: { ping: 1 },
    });

    const result = await runCommand(params);

    expect(result).toEqual({
      status: 500,
      data: {
        error: 'Command failed',
        error_code: 'InternalServerError',
      },
    });
  });
});
