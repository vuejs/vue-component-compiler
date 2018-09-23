# @vue/component-compiler [![Build Status](https://circleci.com/gh/vuejs/vue-component-compiler/tree/master.svg?style=shield)](https://circleci.com/gh/vuejs/vue-component-compiler)

> High level utilities for compiling Vue single file components

This package contains high level utilities that you can use if you are writing a plugin / transform for a bundler or module system that compiles Vue single file components into JavaScript. It is used in [rollup-plugin-vue](https://github.com/vuejs/rollup-plugin-vue) version 3 and above.

The API surface is intentionally minimal - the goal is to reuse as much as possible while being as flexible as possible.

## API

### createDefaultCompiler(Options): SFCCompiler

Creates a compiler instance.

```typescript
interface Options {
  script?: ScriptOptions
  style?: StyleOptions
  template?: TemplateOptions
}

interface ScriptOptions {
  preprocessorOptions?: any
}

interface StyleOptions {
  postcssOptions?: any
  postcssPlugins?: any[]
  postcssModulesOptions?: any
  preprocessOptions?: any
  postcssCleanOptions?: any
  trim?: boolean
}

interface TemplateOptions {
  compiler: VueTemplateCompiler
  compilerOptions: VueTemplateCompilerOptions
  preprocessOptions?: any
  transformAssetUrls?: AssetURLOptions | boolean
  transpileOptions?: any
  isProduction?: boolean
  optimizeSSR?: boolean
}
```

### SFCCompiler.compileToDescriptor(filename: string, source: string): DescriptorCompileResult

Takes raw source and compiles each block separately. Internally, it uses [compileTemplate](https://github.com/vuejs/component-compiler-utils/blob/master/README.md#compiletemplatetemplatecompileoptions-templatecompileresults) and [compileStyle](https://github.com/vuejs/component-compiler-utils/blob/master/README.md#compilestylestylecompileoptions) from [@vue/component-compiler-utils](https://github.com/vuejs/component-compiler-utils).

```typescript
interface DescriptorCompileResult {
  customBlocks: SFCBlock[]
  scopeId: string
  script?: CompileResult
  styles: StyleCompileResult[]
  template?: TemplateCompileResult & { functional: boolean }
}

interface CompileResult {
  code: string
  map?: any
}

interface StyleCompileResult {
  code: string
  map?: any
  scoped?: boolean
  media?: string
  moduleName?: string
  module?: any
}

interface TemplateCompileResult {
  code: string;
  source: string;
  tips: string[];
  errors: string[];
  functional: boolean;
}
```

#### Handling the Output

The blocks from the resulting descriptor should be assembled into JavaScript code:

##### assemble(compiler: SFCCompiler, filename: string, result: DescriptorCompileResult, options: AssembleOptions): AssembleResults

```typescript
interface AssembleResults {
  code: string
  map?: any
}
```

```typescript
interface AssembleOptions {
  normalizer?: string
  styleInjector?: string
  styleInjectorSSR?: string
}
```


The `assemble` method is an example implementation for how to combine various parts from the descriptor. You can provide custom implementations for `normalizer`, `styleInjector` and `styleInjectorSSR`:

* Directly in-lined (default)
* Using a global function (normalizer: 'myComponentNormalizer')
* Using an import ({ normalizer: '~my-component-normalizer' })

The `assemble` method also accepts global variable name in `source`, `map` and `module` of styles. 
