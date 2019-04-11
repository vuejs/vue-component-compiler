import {
  parse,
  compileTemplate,
  compileStyle,
  compileStyleAsync,
  SFCBlock,
  StyleCompileResults,
  TemplateCompileResult,
  StyleCompileOptions
} from '@vue/component-compiler-utils'
import {
  VueTemplateCompiler,
  VueTemplateCompilerOptions
} from '@vue/component-compiler-utils/dist/types'
import { AssetURLOptions } from '@vue/component-compiler-utils/dist/templateCompilerModules/assetUrl'

import postcssModules from 'postcss-modules-sync'
import postcssClean from './postcss-clean'
import * as fs from 'fs'
import * as path from 'path'

const hash = require('hash-sum')
const templateCompiler = require('vue-template-compiler')

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
  resolve: RequireResolve

  constructor(
    script: ScriptOptions,
    style: StyleOptions,
    template: TemplateOptions,
    resolve: RequireResolve = require.resolve
  ) {
    this.template = template
    this.style = style
    this.script = script
    this.resolve = resolve
  }

  compileToDescriptor(
    filename: string,
    source: string
  ): DescriptorCompileResult {
    const descriptor = parse({
      source,
      filename,
      needMap: true,
      compiler: templateCompiler
    })

    const scopeId =
      'data-v-' +
      (this.template.isProduction
        ? hash(path.basename(filename) + source)
        : hash(filename + source))

    const template = descriptor.template
      ? this.compileTemplate(filename, descriptor.template)
      : undefined

    const styles = descriptor.styles.map(style =>
      this.compileStyle(filename, scopeId, style)
    )

    const { script: rawScript, customBlocks } = descriptor
    const script = rawScript
      ? {
          code: rawScript.src
            ? this.read(rawScript.src, filename)
            : rawScript.content,
          map: rawScript.map
        }
      : undefined

    return {
      scopeId,
      template,
      styles,
      script,
      customBlocks
    }
  }

  async compileToDescriptorAsync(
    filename: string,
    source: string
  ): Promise<DescriptorCompileResult> {
    const descriptor = parse({
      source,
      filename,
      needMap: true,
      compiler: templateCompiler
    })

    const scopeId =
      'data-v-' +
      (this.template.isProduction
        ? hash(path.basename(filename) + source)
        : hash(filename + source))

    const template = descriptor.template
      ? this.compileTemplate(filename, descriptor.template)
      : undefined

    const styles = await Promise.all(
      descriptor.styles.map(style =>
        this.compileStyleAsync(filename, scopeId, style)
      )
    )

    const { script: rawScript, customBlocks } = descriptor
    const script = rawScript
      ? {
          code: rawScript.src
            ? this.read(rawScript.src, filename)
            : rawScript.content,
          map: rawScript.map
        }
      : undefined

    return {
      scopeId,
      template,
      styles,
      script,
      customBlocks
    }
  }

  compileTemplate(
    filename: string,
    template: SFCBlock
  ): TemplateCompileResult & { functional: boolean } {
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

  compileStyle(
    filename: string,
    scopeId: string,
    style: SFCBlock
  ): StyleCompileResult {
    const { options, prepare } = this.doCompileStyle(filename, scopeId, style)

    return prepare(compileStyle(options))
  }

  async compileStyleAsync(
    filename: string,
    scopeId: string,
    style: SFCBlock
  ): Promise<StyleCompileResult> {
    const { options, prepare } = this.doCompileStyle(filename, scopeId, style)

    return prepare(await compileStyleAsync(options))
  }

  private doCompileStyle(
    filename: string,
    scopeId: string,
    style: SFCBlock
  ): { options: StyleCompileOptions, prepare: (result: StyleCompileResults) => StyleCompileResult } {
    let tokens: any = undefined

    const needsCSSModules =
      style.module === true || typeof style.module === 'string'
    const needsCleanCSS =
      this.template.isProduction && !(this.style.postcssCleanOptions && this.style.postcssCleanOptions.disabled)
    const postcssPlugins = (this.style.postcssPlugins || [])
      .slice()
      .concat([
        needsCleanCSS
          ? postcssClean(this.style.postcssCleanOptions)
          : undefined,
        needsCSSModules
          ? postcssModules({
              generateScopedName: '[path][local]-[hash:base64:4]',
              ...this.style.postcssModulesOptions,
              getJSON: (t: any) => {
                tokens = t
              }
            })
          : undefined,
      ])
      .filter(Boolean)
    
    const preprocessOptions =
      (style.lang &&
        this.style.preprocessOptions &&
        this.style.preprocessOptions[style.lang]) ||
      {}
    const source = style.src ? this.read(style.src, filename) : style.content
    return {
      options: {
        source: preprocessOptions.data ? `${preprocessOptions.data}\n${source}` : source,
        filename,
        id: scopeId,
        map: style.map,
        scoped: style.scoped || false,
        postcssPlugins,
        postcssOptions: this.style.postcssOptions,
        preprocessLang: style.lang,
        preprocessOptions,
        trim: this.style.trim
      },

      prepare: result => ({
        media: typeof style.attrs.media === 'string' ? style.attrs.media : undefined,
        scoped: style.scoped,
        moduleName: style.module === true ? '$style' : <any>style.module,
        module: tokens,
        ...result,
        code: result.code
      })
    }
  }

  private read(filename: string, context: string): string {
    try {
      return fs
        .readFileSync(
          filename.startsWith('.')
            ? path.resolve(path.dirname(context), filename)
            : this.resolve(filename, { paths: [path.dirname(context)] })
        )
        .toString()
    } catch (e) {
      if (/cannot find module/i.test(e.message)) {
        throw Error(`Cannot find '${filename}' in '${context}'`)
      }

      throw e
    }
  }
}
