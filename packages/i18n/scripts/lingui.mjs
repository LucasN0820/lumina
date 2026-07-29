import { getConfig } from '@lingui/conf';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const cliDirectory = dirname(dirname(require.resolve('@lingui/cli')));
const { command: compile } = await import(
  pathToFileURL(join(cliDirectory, 'dist/lingui-compile.js')).href
);
const { default: extract } = await import(
  pathToFileURL(join(cliDirectory, 'dist/lingui-extract.js')).href
);

const action = process.argv[2];
const config = getConfig({
  configPath: new URL('../lingui.config.ts', import.meta.url).pathname,
});

const options = {
  workersOptions: { poolSize: 0 },
};

const succeeded =
  action === 'extract'
    ? await extract(config, {
        ...options,
        clean: false,
        files: undefined,
        locale: undefined,
        overwrite: false,
        verbose: false,
        watch: false,
      })
    : action === 'compile'
      ? await compile(config, {
          ...options,
          allowEmpty: false,
          failOnCompileError: true,
          namespace: undefined,
          outputPrefix: '/* oxlint-disable */',
          typescript: true,
          verbose: false,
        })
      : false;

if (!succeeded) {
  process.exitCode = 1;
}
