import {
  SFCCompiler,
  StyleOptions,
  TemplateOptions,
  ScriptOptions
} from './compiler'

export const createCompiler = ({
  script,
  style,
  template
}: {
  script: ScriptOptions
  style: StyleOptions
  template: TemplateOptions
}) => new SFCCompiler(script, style, template)

export const createDefaultCompiler = () =>
  createCompiler({
    script: {},
    style: { trim: true },
    template: {
      compiler: require('vue-template-compiler'),
      compilerOptions: {},
      isProduction: process.env.NODE_ENV === 'production',
      optimizeSSR: process.env.VUE_ENV === 'server'
    }
  })

export * from './compiler'
export * from './assembler'
