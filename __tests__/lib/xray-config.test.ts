/**
 * AWS X-Ray Configuration Tests
 */

// Mock aws-xray-sdk-core before importing
const mockSubsegment = {
  close: jest.fn(),
  addError: jest.fn(),
};

const mockSegment = {
  addNewSubsegment: jest.fn(() => mockSubsegment),
  addMetadata: jest.fn(),
  addAnnotation: jest.fn(),
};

jest.mock('aws-xray-sdk-core', () => ({
  setContextMissingStrategy: jest.fn(),
  captureAWSv3Client: jest.fn((client) => client),
  getSegment: jest.fn(() => mockSegment),
}));

import AWSXRay from 'aws-xray-sdk-core';
import { traceDynamoDB, traceAsync, addTraceMetadata, addTraceAnnotation } from '@/lib/xray-config';

describe('X-Ray Configuration', () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  describe('traceDynamoDB', () => {
    it('should return client as-is in non-production', () => {
      process.env.NODE_ENV = 'development';
      const mockClient = { send: jest.fn() };

      const result = traceDynamoDB(mockClient);

      expect(result).toBe(mockClient);
    });

    it('should wrap client with X-Ray in production', () => {
      process.env.NODE_ENV = 'production';
      const mockClient = { send: jest.fn() };

      const result = traceDynamoDB(mockClient);

      expect(AWSXRay.captureAWSv3Client).toHaveBeenCalledWith(mockClient);
    });
  });

  describe('traceAsync', () => {
    it('should execute function directly in non-production', async () => {
      process.env.NODE_ENV = 'development';
      const mockFn = jest.fn().mockResolvedValue('result');

      const result = await traceAsync('test-operation', mockFn);

      expect(result).toBe('result');
      expect(mockFn).toHaveBeenCalled();
      expect(mockSegment.addNewSubsegment).not.toHaveBeenCalled();
    });

    it('should create subsegment and trace in production', async () => {
      process.env.NODE_ENV = 'production';
      const mockFn = jest.fn().mockResolvedValue('traced-result');

      const result = await traceAsync('traced-operation', mockFn);

      expect(result).toBe('traced-result');
      expect(AWSXRay.getSegment).toHaveBeenCalled();
      expect(mockSegment.addNewSubsegment).toHaveBeenCalledWith('traced-operation');
      expect(mockSubsegment.close).toHaveBeenCalled();
    });

    it('should handle errors and add to subsegment in production', async () => {
      process.env.NODE_ENV = 'production';
      const testError = new Error('Test error');
      const mockFn = jest.fn().mockRejectedValue(testError);

      await expect(traceAsync('error-operation', mockFn)).rejects.toThrow('Test error');
      expect(mockSubsegment.addError).toHaveBeenCalledWith(testError);
      expect(mockSubsegment.close).toHaveBeenCalled();
    });

    it('should execute function when no segment exists in production', async () => {
      process.env.NODE_ENV = 'production';
      (AWSXRay.getSegment as jest.Mock).mockReturnValueOnce(null);
      const mockFn = jest.fn().mockResolvedValue('no-segment-result');

      const result = await traceAsync('no-segment-op', mockFn);

      expect(result).toBe('no-segment-result');
      expect(mockFn).toHaveBeenCalled();
    });
  });

  describe('addTraceMetadata', () => {
    it('should not add metadata in non-production', () => {
      process.env.NODE_ENV = 'development';

      addTraceMetadata('key', 'value');

      expect(mockSegment.addMetadata).not.toHaveBeenCalled();
    });

    it('should add metadata in production', () => {
      process.env.NODE_ENV = 'production';

      addTraceMetadata('userId', '12345');

      expect(AWSXRay.getSegment).toHaveBeenCalled();
      expect(mockSegment.addMetadata).toHaveBeenCalledWith('userId', '12345');
    });

    it('should handle missing segment gracefully', () => {
      process.env.NODE_ENV = 'production';
      (AWSXRay.getSegment as jest.Mock).mockReturnValueOnce(null);

      expect(() => addTraceMetadata('key', 'value')).not.toThrow();
    });
  });

  describe('addTraceAnnotation', () => {
    it('should not add annotation in non-production', () => {
      process.env.NODE_ENV = 'development';

      addTraceAnnotation('key', 'value');

      expect(mockSegment.addAnnotation).not.toHaveBeenCalled();
    });

    it('should add string annotation in production', () => {
      process.env.NODE_ENV = 'production';

      addTraceAnnotation('status', 'success');

      expect(mockSegment.addAnnotation).toHaveBeenCalledWith('status', 'success');
    });

    it('should add number annotation in production', () => {
      process.env.NODE_ENV = 'production';

      addTraceAnnotation('responseTime', 150);

      expect(mockSegment.addAnnotation).toHaveBeenCalledWith('responseTime', 150);
    });

    it('should add boolean annotation in production', () => {
      process.env.NODE_ENV = 'production';

      addTraceAnnotation('cached', true);

      expect(mockSegment.addAnnotation).toHaveBeenCalledWith('cached', true);
    });
  });
});
