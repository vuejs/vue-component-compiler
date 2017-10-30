declare module VueComponentCompiler {
  /**
   * Parse SFC file into block descriptors.
   *
   * @param content Contents of the SFC.
   * @param file Filepath (used for cache key & in generated source maps)
   */
  export function parse(content: string, file: string, config: ParserConfig): SFCDescriptor

  /**
   * Compile styles for SFC
   *
   * @param styles List of styles to process.
   * @param file SFC file path
   */
  export function compileStyle(style: StyleCompilerSource, file: string, config: StyleCompilerConfig): Promise<Array<StyleCompilerOutput>>

  /**
   * Compile template to render functions
   *
   * @param template Template to compile
   * @param file SFC file path
   */
  export function compileTemplate(template: TemplateCompilerSource, file: string, config: TemplateCompilerConfig): Promise<TemplateCompilerOutput>

  /**
   * Assemble processed parts of SFC.
   *
   * @param source Processed sources with resolvable identifiers (`id`)
   * @param file SFC file path
   */
  export function assemble(source: AssemblerSource, file: string, config: AssemblerConfig): string

  /**
   * Generate scope id for SFC, used in scoped styles.
   *
   * @param file SFC file path
   * @param context file is required in context
   * @param key
   */
  export function generateScopeId(file: string, context: string, key?: string): string

  type ParserConfig = {
    needMap: boolean
  }

  type SFCDescriptor = {
    script: ScriptDescriptor
    styles: Array<StyleDescriptor>
    template: TemplateDescriptor
    customBlocks: Array<BlockDescriptor>
  }

  type BlockDescriptor = {
    type: string // tag
    content: string
    start: number
    end: number
    attrs: Array<{ name: string, value: string | boolean}>
  }

  type StyleDescriptor = BlockDescriptor & {
    scoped?: boolean
    module?: string | boolean
    lang?: string
    src?: string
  }

  type ScriptDescriptor = BlockDescriptor & {
    lang?: string
    src?: string
  }

  type TemplateDescriptor = BlockDescriptor & {
    lang?: string
    src?: string
  }

  type CompilerSource = {
    code: string
    map?: object // prev source map
  }

  type StyleCompilerSource = CompilerSource & {
    descriptor: StyleDescriptor
  }

  type StyleCompilerConfig = {
    scopeId: string // used for scoped styles.
    needMap?: boolean
    plugins?: Array<object> // postcss plugins
    options?: object // postcss options
    onWarn?: MessageHandler
  }

  type MessageHandler = (message: Message) => void

  type Message = {
    type: string
    text?: string
  }

  type CompilerOutput = {
    code: string,
    map?: object
  }

  type StyleCompilerOutput = CompilerOutput & {}

  type TemplateCompilerSource = CompilerSource & {
    descriptor: TemplateDescriptor
  }

  type TemplateCompilerConfig = {
    scopeId: string
    isHot?: boolean // false
    isServer?: boolean // false
    isProduction?: boolean // true
    esModule?: boolean // true
    optimizeSSR?: boolean // true
    buble: object // see https://github.com/vuejs/vue-template-es2015-compiler/blob/master/index.js#L6
    options?: {
      preserveWhitspace?: boolean // true
    }
    transformToRequire?: object
    plugins?: Array<Function>
  }

  type TemplateCompilerOutput = CompilerOutput & {
    errors: Array<object>
    tips: Array<object>
  }

  type AssemblerSource = {
    script: {
      id: string,
      descriptor: ScriptDescriptor
    }
    styles: Array<{
      id: string
      hotPath: string
      descriptor: StyleDescriptor
    }>
    render: {
      id: string
      descriptor: TemplateDescriptor
    }
    customBlocks: Array<{
      id: string
      descriptor: BlockDescriptor
    }>
  }

  type AssemblerConfig = {
    hashKey?: string
    esModule?: boolean // true
    shortFilePath?: string // = filename
    require?: {
      vueHotReloadAPI?: string // vue-hot-reload-api
      normalizeComponent?: string // vue-component-compiler/src/normalize-component.js
    }
    scopeId: string // same as scopeId of style compiler.
    moduleIdentifier?: string // ~ used in SSR
    isHot?: boolean // false
    isServer?: boolean // false
    isProduction?: boolean // true
    isInjectable?: boolean // false
    hasStyleInjectFn?: boolean // false
    onWarn?: MessageHandler // console.warn
  }
}
