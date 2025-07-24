module.exports = {
  'bluby-api': {
    input: {
      target: './openapi.json',
    },
    output: {
      mode: 'tags-split',
      target: '../src/api',
      schemas: '../src/api/model',
      client: 'react-query',
      prettier: true,
      override: {
        mutator: {
          path: '../src/api/mutator/custom-instance.ts',
          name: 'customInstance',
        },
      },
    },
  },
};
