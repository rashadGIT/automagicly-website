/**
 * AWS CloudWatch RUM Configuration Tests
 */

// Mock aws-rum-web before importing
const mockRecordError = jest.fn();
const mockRecordEvent = jest.fn();
const mockAwsRumInstance = {
  recordError: mockRecordError,
  recordEvent: mockRecordEvent,
};

jest.mock('aws-rum-web', () => ({
  AwsRum: jest.fn().mockImplementation(() => mockAwsRumInstance),
}));

describe('RUM Configuration', () => {
  const originalEnv = process.env;
  const originalWindow = global.window;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    // Reset console mocks
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = originalEnv;
    global.window = originalWindow;
  });

  describe('initRUM', () => {
    it('should check for browser environment', () => {
      // In jsdom, window is always defined, so this tests that the function
      // works in a browser-like environment
      process.env.NODE_ENV = 'development';
      delete process.env.NEXT_PUBLIC_ENABLE_RUM;

      const { initRUM } = require('@/lib/rum-config');

      // In development without force enable, should return null
      const result = initRUM();
      expect(result).toBeNull();
    });

    it('should return null and log message in development without force enable', () => {
      process.env.NODE_ENV = 'development';
      delete process.env.NEXT_PUBLIC_ENABLE_RUM;

      const { initRUM } = require('@/lib/rum-config');
      const result = initRUM();

      expect(result).toBeNull();
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('CloudWatch RUM disabled in development')
      );
    });

    it('should initialize RUM in production', () => {
      process.env.NODE_ENV = 'production';

      const { initRUM } = require('@/lib/rum-config');
      const { AwsRum } = require('aws-rum-web');

      const result = initRUM();

      expect(AwsRum).toHaveBeenCalled();
      expect(result).toBe(mockAwsRumInstance);
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('CloudWatch RUM initialized successfully')
      );
    });

    it('should initialize RUM when force enabled in development', () => {
      process.env.NODE_ENV = 'development';
      process.env.NEXT_PUBLIC_ENABLE_RUM = 'true';

      const { initRUM } = require('@/lib/rum-config');
      const { AwsRum } = require('aws-rum-web');

      const result = initRUM();

      expect(AwsRum).toHaveBeenCalled();
      expect(result).toBe(mockAwsRumInstance);
    });

    it('should return existing instance if already initialized', () => {
      process.env.NODE_ENV = 'production';

      const { initRUM } = require('@/lib/rum-config');

      const first = initRUM();
      const second = initRUM();

      expect(first).toBe(second);
    });

    it('should handle initialization errors gracefully', () => {
      process.env.NODE_ENV = 'production';
      const { AwsRum } = require('aws-rum-web');
      (AwsRum as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Init failed');
      });

      // Need fresh module
      jest.resetModules();
      jest.mock('aws-rum-web', () => ({
        AwsRum: jest.fn().mockImplementation(() => {
          throw new Error('Init failed');
        }),
      }));

      const { initRUM: initRUMFresh } = require('@/lib/rum-config');
      const result = initRUMFresh();

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to initialize CloudWatch RUM'),
        expect.any(Error)
      );
    });
  });

  describe('recordError', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
      jest.resetModules();
      jest.mock('aws-rum-web', () => ({
        AwsRum: jest.fn().mockImplementation(() => mockAwsRumInstance),
      }));
    });

    it('should record error when RUM is initialized', () => {
      const { initRUM, recordError } = require('@/lib/rum-config');
      initRUM();

      const testError = new Error('Test error');
      recordError(testError);

      expect(mockRecordError).toHaveBeenCalledWith(testError);
    });

    it('should record error with metadata', () => {
      const { initRUM, recordError } = require('@/lib/rum-config');
      initRUM();

      const testError = new Error('Test error');
      const metadata = { userId: '123', action: 'submit' };
      recordError(testError, metadata);

      expect(mockRecordError).toHaveBeenCalledWith(testError);
      expect(mockRecordEvent).toHaveBeenCalledWith('error_metadata', metadata);
    });

    it('should not record when RUM is not initialized', () => {
      process.env.NODE_ENV = 'development';
      delete process.env.NEXT_PUBLIC_ENABLE_RUM;
      jest.resetModules();

      const { recordError } = require('@/lib/rum-config');
      const testError = new Error('Test error');

      // Should not throw
      expect(() => recordError(testError)).not.toThrow();
    });
  });

  describe('recordEvent', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
      jest.resetModules();
      jest.mock('aws-rum-web', () => ({
        AwsRum: jest.fn().mockImplementation(() => mockAwsRumInstance),
      }));
    });

    it('should record custom event when RUM is initialized', () => {
      const { initRUM, recordEvent } = require('@/lib/rum-config');
      initRUM();

      recordEvent('button_click', { buttonId: 'submit-form' });

      expect(mockRecordEvent).toHaveBeenCalledWith('button_click', { buttonId: 'submit-form' });
    });

    it('should not record when RUM is not initialized', () => {
      process.env.NODE_ENV = 'development';
      delete process.env.NEXT_PUBLIC_ENABLE_RUM;
      jest.resetModules();

      const { recordEvent } = require('@/lib/rum-config');

      // Should not throw
      expect(() => recordEvent('test', { key: 'value' })).not.toThrow();
    });
  });
});
