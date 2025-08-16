// mock the global variable with just the part of OpenAI data
global.DOMAIN_DEPENDENCIES = [
  [
    { format: 'domain', value: 'openai.com' },
    { format: 'domain', value: 'oaistatic.com' },
    {
      format: 'full domain',
      value: 'chat.openai.com.cdn.cloudflare.net',
    },
    { format: 'full domain', value: 'openaiapi-site.azureedge.net' },
    {
      format: 'full domain',
      value: 'openaicom-api-bdcpf8c6d2e9atf6.z01.azurefd.net',
    },
    {
      format: 'full domain',
      value: 'openaicomproductionae4b.blob.core.windows.net',
    },
    {
      format: 'full domain',
      value: 'production-openaicom-storage.azureedge.net',
    },
    { format: 'full domain', value: 'openaicom.imgix.net' },
  ],
];

global.self = {
  _: {
    browser: { runtime: { sendMessage: jest.fn() } },
    uniqBy: (array, fn) => {
      const seen = new Set();
      return array.filter((item) => {
        const value = fn(item);
        if (seen.has(value)) {
          return false;
        } else {
          seen.add(value);
          return true;
        }
      });
    },
    uniq: (array) => {
      return [...new Set(array)];
    },
  },
};
