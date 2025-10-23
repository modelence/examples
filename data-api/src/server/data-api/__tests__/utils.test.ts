import { ObjectId } from 'mongodb';
import { processFilter, processUpdate, validateApiKey } from '../utils';
import { ValidationError, AuthError } from 'modelence';

// Mock modelence/server
jest.mock('modelence/server', () => ({
  getConfig: jest.fn(),
}));

import { getConfig } from 'modelence/server';

describe('utils', () => {
  describe('processFilter', () => {
    it('should convert string _id to ObjectId', () => {
      const objectIdString = '507f1f77bcf86cd799439011';
      const filter = { _id: objectIdString };
      const result = processFilter(filter);

      expect(result._id).toBeInstanceOf(ObjectId);
      expect(result._id.toString()).toBe(objectIdString);
    });

    it('should not convert invalid _id string', () => {
      const filter = { _id: 'invalid-id' };
      const result = processFilter(filter);

      expect(result._id).toBe('invalid-id');
    });

    it('should recursively process nested objects', () => {
      const objectIdString = '507f1f77bcf86cd799439011';
      const filter = {
        name: 'test',
        nested: {
          _id: objectIdString,
          value: 123,
        },
      };
      const result = processFilter(filter);

      expect(result.name).toBe('test');
      expect(result.nested._id).toBeInstanceOf(ObjectId);
      expect(result.nested.value).toBe(123);
    });

    it('should preserve arrays', () => {
      const filter = { tags: ['tag1', 'tag2'] };
      const result = processFilter(filter);

      expect(result.tags).toEqual(['tag1', 'tag2']);
    });

    it('should handle empty object', () => {
      const filter = {};
      const result = processFilter(filter);

      expect(result).toEqual({});
    });
  });

  describe('processUpdate', () => {
    it('should convert string _id in update operators', () => {
      const objectIdString = '507f1f77bcf86cd799439011';
      const update = {
        $set: {
          _id: objectIdString,
          name: 'test',
        },
      };
      const result = processUpdate(update);

      expect(result.$set._id).toBeInstanceOf(ObjectId);
      expect(result.$set._id.toString()).toBe(objectIdString);
      expect(result.$set.name).toBe('test');
    });

    it('should handle multiple update operators', () => {
      const update = {
        $set: { name: 'test' },
        $inc: { count: 1 },
      };
      const result = processUpdate(update);

      expect(result.$set.name).toBe('test');
      expect(result.$inc.count).toBe(1);
    });

    it('should not convert invalid _id string', () => {
      const update = {
        $set: { _id: 'invalid-id' },
      };
      const result = processUpdate(update);

      expect(result.$set._id).toBe('invalid-id');
    });

    it('should handle non-object operator values', () => {
      const update = {
        $set: { name: 'test' },
        $currentDate: true,
      };
      const result = processUpdate(update);

      expect(result.$set.name).toBe('test');
      expect(result.$currentDate).toBe(true);
    });
  });

  describe('validateApiKey', () => {
    const mockGetConfig = getConfig as jest.MockedFunction<typeof getConfig>;

    beforeEach(() => {
      jest.clearAllMocks();
      delete process.env.DATA_API_KEY;
    });

    it('should throw ValidationError if API key is not configured', () => {
      mockGetConfig.mockReturnValue(undefined);

      expect(() => validateApiKey('test-key')).toThrow(ValidationError);
      expect(() => validateApiKey('test-key')).toThrow('API key authentication not configured');
    });

    it('should throw AuthError if API key does not match (config)', () => {
      mockGetConfig.mockReturnValue('correct-key');

      expect(() => validateApiKey('wrong-key')).toThrow(AuthError);
      expect(() => validateApiKey('wrong-key')).toThrow('Invalid API key');
    });

    it('should not throw if API key matches (config)', () => {
      mockGetConfig.mockReturnValue('correct-key');

      expect(() => validateApiKey('correct-key')).not.toThrow();
    });

    it('should throw AuthError if API key does not match (env)', () => {
      mockGetConfig.mockReturnValue(undefined);
      process.env.DATA_API_KEY = 'correct-key';

      expect(() => validateApiKey('wrong-key')).toThrow(AuthError);
      expect(() => validateApiKey('wrong-key')).toThrow('Invalid API key');
    });

    it('should not throw if API key matches (env)', () => {
      mockGetConfig.mockReturnValue(undefined);
      process.env.DATA_API_KEY = 'correct-key';

      expect(() => validateApiKey('correct-key')).not.toThrow();
    });

    it('should throw AuthError if key lengths differ', () => {
      mockGetConfig.mockReturnValue('correct-key');

      expect(() => validateApiKey('short')).toThrow(AuthError);
    });
  });
});
