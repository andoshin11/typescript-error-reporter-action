# TypeScript Error Reporter Action

Ensuring type-safetiness is one of the most critical responsibility for modern software developers.

This Action will provide you the easiest way to run type checks and see the result for each Pull Requests.

![TypeScript Error Reporter Action](https://user-images.githubusercontent.com/8381075/78413929-a40f0680-7654-11ea-8365-0ef72fb4d6b3.png)

## Usage

This Action uses [TypeScript Compiler API](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API) to satically run diagnostics over your app and shows you the result of the checks.

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [13.x]
    steps:
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v1
        with:
          node-version: ${{ matrix.node-version }}
      - name: Install dependencies
        run: yarn --frozen-lockfile
      - name: Typecheck
        uses: andoshin11/typescript-error-reporter-action@v1.0.0
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
