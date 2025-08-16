import config from 'config';

export const isProd = config.type === 'production';
export const isDev = config.type === 'development';
