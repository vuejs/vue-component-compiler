import {
  parse,
  compileTemplate,
  compileStyle,
  SFCBlock,
  StyleCompileResults,
  TemplateCompileResult
} from '@vue/component-compiler-utils'
import {
  VueTemplateCompiler,
  VueTemplateCompilerOptions
} from '@vue/component-compiler-utils/dist/types'
import { AssetURLOptions } from '@vue/component-compiler-utils/dist/templateCompilerModules/assetUrl'

import postcssModules from 'postcss-modules-sync'
import postcssClean from './postcss-clean'
import hash = require('hash-sum')
import * as fs from 'fs'
import * as path from 'path'

export interface TemplateOptions {
  compiler: VueTemplateCompiler
  compilerOptions: VueTemplateCompilerOptions
  preprocessOptions?: any
  transformAssetUrls?: AssetURLOptions | boolean
  transpileOptions?: any
  isProduction?: boolean
  optimizeSSR?: boolean
}

export interface StyleOptions {
  postcssOptions?: any
  postcssPlugins?: any[]
  postcssModulesOptions?: any
  preprocessOptions?: any
  postcssCleanOptions?: any
  trim?: boolean
}

export interface ScriptOptions {
  preprocessorOptions?: any
}

export interface CompileResult {
  code: string
  map?: any
}
export type StyleCompileResult = StyleCompileResults & {
  scoped?: boolean
  media?: string
  moduleName?: string
  module?: any
}

export interface DescriptorCompileResult {
  customBlocks: SFCBlock[]
  scopeId: string
  script?: CompileResult
  styles: StyleCompileResult[]
  template?: TemplateCompileResult & { functional: boolean }
}

export class SFCCompiler {
  script: ScriptOptions
  style: StyleOptions
  template: TemplateOptions

  constructor(
    script: ScriptOptions,
    style: StyleOptions,
    template: TemplateOptions
  ) {
    this.template = template
    this.style = style
    this.script = script
  }

  compileToDescriptor(
    filename: string,
    source: string
  ): DescriptorCompileResult {
    const descriptor = parse({
      source,
      filename,
      needMap: true
    })

    const scopeId =
      'data-v-' +
      (this.template.isProduction
        ? hash(path.basename(filename) + source)
        : hash(filename + source))

    const template =
      descriptor.template && this.compileTemplate(filename, descriptor.template)

    const styles = descriptor.styles.map(style => this.compileStyle(filename, scopeId, style))

    const { script: rawScript, customBlocks } = descriptor
    const script = rawScript && {
      code: rawScript.src
        ? this.read(rawScript.src, filename)
        : rawScript.content,
      map: rawScript.map
    }

    return {
      scopeId,
      template,
      styles,
      script,
      customBlocks
    }
  }

  private compileTemplate(filename: string, template: SFCBlock) {
    const { preprocessOptions, ...options } = this.template
    const functional = 'functional' in template.attrs

    return {
      functional,
      ...compileTemplate({
        ...options,
        source: template.src
          ? this.read(template.src, filename)
          : template.content,
        filename,
        preprocessLang: template.lang,
        preprocessOptions:
          (template.lang &&
            preprocessOptions &&
            preprocessOptions[template.lang]) ||
          {},
        isFunctional: functional
      })
    }
  }

  private compileStyle(filename: string, scopeId: string, style: SFCBlock) {
    let tokens = undefined
    const needsCSSModules = style.module === true || typeof style.module === 'string'
    const postcssPlugins = [
      needsCSSModules
        ? postcssModules({
          generateScopedName: '[path][local]-[hash:base64:4]',
          ...this.style.postcssModulesOptions,
          getJSON: (t: any) => {
            tokens = t
          }
        })
        : undefined,
      this.template.isProduction
        ? postcssClean(this.style.postcssCleanOptions)
        : undefined
    ]
      .concat(this.style.postcssPlugins)
      .filter(Boolean)
    const result = compileStyle(<any>{
      source: style.src ? this.read(style.src, filename) : style.content,
      filename,
      id: scopeId,
      map: style.map,
      scoped: style.scoped || false,
      postcssPlugins,
      postcssOptions: this.style.postcssOptions,
      preprocessLang: style.lang,
      preprocessOptions:
      (style.lang &&
        this.style.preprocessOptions &&
        this.style.preprocessOptions[style.lang]) ||
      {},
      trim: this.style.trim
    })

    return {
      media: style.attrs.media,
      scoped: style.scoped,
      moduleName: style.module === true ? '$style' : <any>style.module,
      module: tokens,
      ...result,
      code: result.code
    }
  }

  private read(filename: string, context: string): string {
    return fs
      .readFileSync(path.resolve(path.dirname(context), filename))
      .toString()
  }
}
