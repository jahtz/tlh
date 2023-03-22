import type {CodegenConfig} from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: 'http://localhost:8066/graphql.php',
  documents: 'src/**/*.graphql',
  generates: {
    'schema.graphql': {
      plugins: [
        'schema-ast'
      ]
    },
    'src/graphql.ts': {
      // preset: 'client',
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-react-apollo',
      ],
      config: {
        constEnums: true
      }
    }
  }
};

export default config;
