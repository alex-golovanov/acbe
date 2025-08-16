import { jest } from '@jest/globals';

global.chrome = {
  runtime: {
    getManifest: jest.fn().mockReturnValue({
      manifest_version: 3,
      permissions: [],
    }),
    sendMessage: jest.fn().mockResolvedValue(true),
  },
};
