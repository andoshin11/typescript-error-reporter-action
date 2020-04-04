# TypeScript Error Reporter
Ensuring type-safetiness is one of the most critical responsibility for modern software developers.

This GitHub Action will provide you the easiest way to run type checks and see the result for each Pull Requests.

## Usage
This Action uses [TypeScript Compiler API](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API) to satically run diagnostics over your app and shows you the result of the checks.

```yaml
name: main

on: [push]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Setting up Node.js v12.13.0
        uses: actions/setup-node@v1
        with:
          node-version: ${{ matrix.node-version }}
      - name: Install dependencies
        run: |
          yarn install
      - uses: andoshin11/tsc-reporter@v1.0.0
```

whereas your `tsconfig.json` should look like this.

```json
{
  "compilerOptions": {
    "target": "es5",
    "module": "commonjs",
    "strict": true,
    "skipLibCheck": true,
    "moduleResolution": "node",
    "types": ["node"],
    "lib": ["ES2017"]
  },
  "include": ["src/**/*.ts"]
}
```
