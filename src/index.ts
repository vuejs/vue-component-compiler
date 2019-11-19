import {
  SFCCompiler,
  StyleOptions,
  TemplateOptions,
  ScriptOptions,
  CustomBlockOptions
} from './compiler'

export const createCompiler = ({
  script,
  style,
  template,
  customBlock
}: {
  script: ScriptOptions
  style: StyleOptions
  template: TemplateOptions
  customBlock: CustomBlockOptions
}) => new SFCCompiler(script, style, template, customBlock)

export const createDefaultCompiler = (options: {
  script?: ScriptOptions
  style?: StyleOptions
  template?: TemplateOptions
  customBlock?: CustomBlockOptions
} = {}) =>
  createCompiler({
    script: { ...options.script },
    style: { trim: true, ...options.style },
    template: {
      compiler: require('vue-template-compiler'),
      compilerOptions: {},
      isProduction: process.env.NODE_ENV === 'production',
      optimizeSSR: process.env.VUE_ENV === 'server',
      ...options.template
    },
    customBlock: { ...options.customBlock }
  })

export * from './compiler'
export * from './assembler'
