# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="4.2.3"></a>
## [4.2.3](https://github.com/vuejs/vue-component-compiler/compare/v4.2.2...v4.2.3) (2020-05-22)


### Bug Fixes

* set correct clean-css import ([#103](https://github.com/vuejs/vue-component-compiler/issues/103)) ([b1aff3f](https://github.com/vuejs/vue-component-compiler/commit/b1aff3f))



<a name="4.2.2"></a>
## [4.2.2](https://github.com/vuejs/vue-component-compiler/compare/v4.2.1...v4.2.2) (2020-05-22)


### Bug Fixes

* produce deterministic css class names for css modules ([#101](https://github.com/vuejs/vue-component-compiler/issues/101)) ([b8bfc58](https://github.com/vuejs/vue-component-compiler/commit/b8bfc58))



<a name="4.2.1"></a>
## [4.2.1](https://github.com/vuejs/vue-component-compiler/compare/v4.2.0...v4.2.1) (2020-05-11)


### Bug Fixes

* add pure annotation for tree shaking support ([#96](https://github.com/vuejs/vue-component-compiler/issues/96)) ([7b4dceb](https://github.com/vuejs/vue-component-compiler/commit/7b4dceb))



<a name="4.2.0"></a>
# [4.2.0](https://github.com/vuejs/vue-component-compiler/compare/v4.1.0...v4.2.0) (2019-11-21)


### Features

* use __vue_component__ identifier for normalized component and default export ([#91](https://github.com/vuejs/vue-component-compiler/issues/91)) ([fb1ab41](https://github.com/vuejs/vue-component-compiler/commit/fb1ab41))



<a name="4.1.0"></a>
# [4.1.0](https://github.com/vuejs/vue-component-compiler/compare/v4.0.0...v4.1.0) (2019-10-26)


### Features

* inject styles to shadow DOM ([#89](https://github.com/vuejs/vue-component-compiler/issues/89)) ([714f08d](https://github.com/vuejs/vue-component-compiler/commit/714f08d))



<a name="4.0.0"></a>
# [4.0.0](https://github.com/vuejs/vue-component-compiler/compare/v3.4.5...v4.0.0) (2019-04-11)


### Bug Fixes

* **#84:** Move postcss-modules plugins to last ([#86](https://github.com/vuejs/vue-component-compiler/issues/86)) ([d4ae5be](https://github.com/vuejs/vue-component-compiler/commit/d4ae5be)), closes [#84](https://github.com/vuejs/vue-component-compiler/issues/84)
* normalize source map file path on windows ([#83](https://github.com/vuejs/vue-component-compiler/issues/83)) ([c4bcd40](https://github.com/vuejs/vue-component-compiler/commit/c4bcd40)), closes [vuejs/component-compiler-utils#51](https://github.com/vuejs/component-compiler-utils/issues/51)


### Chores

* Upgrade [@vue](https://github.com/vue)/component-compiler-utils ([12f4878](https://github.com/vuejs/vue-component-compiler/commit/12f4878))


### Features

* Add compileToDescriptorAsync and compileStyleAsync methods ([ccf7d84](https://github.com/vuejs/vue-component-compiler/commit/ccf7d84))
* Allow disabling clean CSS ([9d43b80](https://github.com/vuejs/vue-component-compiler/commit/9d43b80))


### BREAKING CHANGES

* Update to @vue/component-compiler-utils@3.0.0 which
uses `sass` instead of `node-sass`



<a name="3.6.0"></a>
# [3.6.0](https://github.com/vuejs/vue-component-compiler/compare/v3.5.0...v3.6.0) (2018-08-28)


### Features

* Add compileToDescriptorAsync and compileStyleAsync methods ([ccf7d84](https://github.com/vuejs/vue-component-compiler/commit/ccf7d84))



<a name="3.5.0"></a>
# [3.5.0](https://github.com/vuejs/vue-component-compiler/compare/v3.4.5...v3.5.0) (2018-08-28)


### Features

* Allow disabling clean CSS ([9d43b80](https://github.com/vuejs/vue-component-compiler/commit/9d43b80))



<a name="3.4.5"></a>
## [3.4.5](https://github.com/vuejs/vue-component-compiler/compare/v3.4.4...v3.4.5) (2018-08-28)


### Bug Fixes

* Do not generate style injector code if component has no style ([78a2da3](https://github.com/vuejs/vue-component-compiler/commit/78a2da3))



<a name="3.4.4"></a>
## [3.4.4](https://github.com/vuejs/vue-component-compiler/compare/v3.4.3...v3.4.4) (2018-07-31)



<a name="3.4.3"></a>
## [3.4.3](https://github.com/vuejs/vue-component-compiler/compare/v3.4.2...v3.4.3) (2018-07-31)


### Bug Fixes

* Use basename for __file in production mode ([541a824](https://github.com/vuejs/vue-component-compiler/commit/541a824))



<a name="3.4.2"></a>
## [3.4.2](https://github.com/vuejs/vue-component-compiler/compare/v3.4.1...v3.4.2) (2018-07-13)



<a name="3.4.1"></a>
## [3.4.1](https://github.com/vuejs/vue-component-compiler/compare/v3.4.0...v3.4.1) (2018-06-27)


### Bug Fixes

* Add scope ID only if scoped style is present ([1a42be3](https://github.com/vuejs/vue-component-compiler/commit/1a42be3)), closes [#75](https://github.com/vuejs/vue-component-compiler/issues/75)



<a name="3.4.0"></a>
# [3.4.0](https://github.com/vuejs/vue-component-compiler/compare/v3.3.3...v3.4.0) (2018-06-24)


### Features

* preprocessor `data` option to prepend shared styles ([#73](https://github.com/vuejs/vue-component-compiler/issues/73)) ([5a81749](https://github.com/vuejs/vue-component-compiler/commit/5a81749))
* Script source map support in assemble ([#74](https://github.com/vuejs/vue-component-compiler/issues/74)) ([13cd119](https://github.com/vuejs/vue-component-compiler/commit/13cd119))



<a name="3.3.3"></a>
## [3.3.3](https://github.com/vuejs/vue-component-compiler/compare/v3.3.2...v3.3.3) (2018-05-25)


### Bug Fixes

* Resolve src values on style blocks with require.resolve ([#70](https://github.com/vuejs/vue-component-compiler/issues/70)) ([0e8e005](https://github.com/vuejs/vue-component-compiler/commit/0e8e005))
* Use options from `Vue.extend` constructor export from script block ([#69](https://github.com/vuejs/vue-component-compiler/issues/69)) ([4280da0](https://github.com/vuejs/vue-component-compiler/commit/4280da0))



<a name="3.3.2"></a>
## [3.3.2](https://github.com/vuejs/vue-component-compiler/compare/v3.3.1...v3.3.2) (2018-05-13)


### Bug Fixes

* Prevent duplicate style injection ([#68](https://github.com/vuejs/vue-component-compiler/issues/68)) ([58247ce](https://github.com/vuejs/vue-component-compiler/commit/58247ce))



<a name="3.3.1"></a>
## [3.3.1](https://github.com/vuejs/vue-component-compiler/compare/v3.3.0...v3.3.1) (2018-05-09)


### Bug Fixes

* Inject CSS module tokens even when css is not present ([#67](https://github.com/vuejs/vue-component-compiler/issues/67)) ([05c5210](https://github.com/vuejs/vue-component-compiler/commit/05c5210))



<a name="3.3.0"></a>
# [3.3.0](https://github.com/vuejs/vue-component-compiler/compare/v3.2.0...v3.3.0) (2018-05-07)


### Features

* Change visibilty of compileStyle and compileTemplate methods to public ([#66](https://github.com/vuejs/vue-component-compiler/issues/66)) ([c505f94](https://github.com/vuejs/vue-component-compiler/commit/c505f94))



<a name="3.3.0"></a>
# [3.3.0](https://github.com/vuejs/vue-component-compiler/compare/v3.2.0...v3.3.0) (2018-05-07)


### Features

* Change visibilty of compileStyle and compileTemplate methods to public ([#66](https://github.com/vuejs/vue-component-compiler/issues/66)) ([c505f94](https://github.com/vuejs/vue-component-compiler/commit/c505f94))



<a name="3.2.0"></a>
# [3.2.0](https://github.com/vuejs/vue-component-compiler/compare/v3.1.1...v3.2.0) (2018-05-06)


### Features

* Skip style injection when style soure is empty ([#65](https://github.com/vuejs/vue-component-compiler/issues/65)) ([5726a24](https://github.com/vuejs/vue-component-compiler/commit/5726a24))



<a name="3.2.0"></a>
# [3.2.0](https://github.com/vuejs/vue-component-compiler/compare/v3.1.1...v3.2.0) (2018-05-06)


### Features

* Skip style injection when style soure is empty ([#65](https://github.com/vuejs/vue-component-compiler/issues/65)) ([5726a24](https://github.com/vuejs/vue-component-compiler/commit/5726a24))



<a name="3.1.1"></a>
## [3.1.1](https://github.com/vuejs/vue-component-compiler/compare/v3.1.0...v3.1.1) (2018-05-02)


### Features

* Use global variables as style source ([#64](https://github.com/vuejs/vue-component-compiler/issues/64)) ([14c6a3d](https://github.com/vuejs/vue-component-compiler/commit/14c6a3d))



<a name="3.1.1"></a>
## [3.1.1](https://github.com/vuejs/vue-component-compiler/compare/v3.1.0...v3.1.1) (2018-05-02)


### Features

* Use global variables as style source ([#64](https://github.com/vuejs/vue-component-compiler/issues/64)) ([14c6a3d](https://github.com/vuejs/vue-component-compiler/commit/14c6a3d))



<a name="3.1.0"></a>
# [3.1.0](https://github.com/vuejs/vue-component-compiler/compare/076d414...v3.1.0) (2018-05-01)


### Bug Fixes

* add main and typings in package.json ([5d5790a](https://github.com/vuejs/vue-component-compiler/commit/5d5790a))
* circleci build yarn installation script ([8d54b92](https://github.com/vuejs/vue-component-compiler/commit/8d54b92))
* ensure split for files generated on windows ([dfc0ec2](https://github.com/vuejs/vue-component-compiler/commit/dfc0ec2))
* expect moduleIdentifier in assemble step ([0ba6e8b](https://github.com/vuejs/vue-component-compiler/commit/0ba6e8b))
* generate sourcemaps even if previous maps are provided ([0bee641](https://github.com/vuejs/vue-component-compiler/commit/0bee641))
* inject style for non-modules too ([9a30f9e](https://github.com/vuejs/vue-component-compiler/commit/9a30f9e))
* remove postcss config loader ([f4ccc7c](https://github.com/vuejs/vue-component-compiler/commit/f4ccc7c))
* remove unnecessary extension ([043f54b](https://github.com/vuejs/vue-component-compiler/commit/043f54b))
* style-compiler source maps & use vue-component-compiler instead of vue-loader in logs ([fef6fdd](https://github.com/vuejs/vue-component-compiler/commit/fef6fdd))
* update gen-id implementation ([#43](https://github.com/vuejs/vue-component-compiler/issues/43)) ([72ff0bb](https://github.com/vuejs/vue-component-compiler/commit/72ff0bb)), closes [#42](https://github.com/vuejs/vue-component-compiler/issues/42)
* use configure vueHotReloadAPI when available ([19be9bf](https://github.com/vuejs/vue-component-compiler/commit/19be9bf))
* use import statements for style when assembling in esModule mode ([513fe46](https://github.com/vuejs/vue-component-compiler/commit/513fe46))


### Features

* add css modules capability to style-compiler ([d413d22](https://github.com/vuejs/vue-component-compiler/commit/d413d22))
* add runtime component helpers ([5f7d136](https://github.com/vuejs/vue-component-compiler/commit/5f7d136))
* add synchronous compilers ([f136528](https://github.com/vuejs/vue-component-compiler/commit/f136528))
* add ts typings ([8cc4f5f](https://github.com/vuejs/vue-component-compiler/commit/8cc4f5f))
* allow additional properties in options ([#56](https://github.com/vuejs/vue-component-compiler/issues/56)) ([a23740f](https://github.com/vuejs/vue-component-compiler/commit/a23740f))
* assemble inline when content is provided ([#35](https://github.com/vuejs/vue-component-compiler/issues/35)) ([da252a7](https://github.com/vuejs/vue-component-compiler/commit/da252a7)), closes [#31](https://github.com/vuejs/vue-component-compiler/issues/31) [#38](https://github.com/vuejs/vue-component-compiler/issues/38) [#39](https://github.com/vuejs/vue-component-compiler/issues/39)
* component parts assembler ([5deae78](https://github.com/vuejs/vue-component-compiler/commit/5deae78))
* export component compilers ([cf11514](https://github.com/vuejs/vue-component-compiler/commit/cf11514))
* SFC to descriptors parser ([076d414](https://github.com/vuejs/vue-component-compiler/commit/076d414))
* source map cache busting option ([#48](https://github.com/vuejs/vue-component-compiler/issues/48)) ([93b6847](https://github.com/vuejs/vue-component-compiler/commit/93b6847)), closes [#46](https://github.com/vuejs/vue-component-compiler/issues/46)
* style compiler to add scope-id ([6b9dc62](https://github.com/vuejs/vue-component-compiler/commit/6b9dc62))
* style-compiler should process one style block at a time ([e6fa1ba](https://github.com/vuejs/vue-component-compiler/commit/e6fa1ba))
* support for functional template compilation ([#45](https://github.com/vuejs/vue-component-compiler/issues/45)) ([63b91f7](https://github.com/vuejs/vue-component-compiler/commit/63b91f7)), closes [#44](https://github.com/vuejs/vue-component-compiler/issues/44) [#37](https://github.com/vuejs/vue-component-compiler/issues/37)
* support wildcard tag in transformToRequire ([#41](https://github.com/vuejs/vue-component-compiler/issues/41)) ([f8a36c7](https://github.com/vuejs/vue-component-compiler/commit/f8a36c7)), closes [#40](https://github.com/vuejs/vue-component-compiler/issues/40)
* template to render function compiler ([c4fc825](https://github.com/vuejs/vue-component-compiler/commit/c4fc825))
* transform require to import statements in esModule ([#54](https://github.com/vuejs/vue-component-compiler/issues/54)) ([833605d](https://github.com/vuejs/vue-component-compiler/commit/833605d))
* use [@vue](https://github.com/vue)/component-compiler-utils to provide high level component compilation API ([#59](https://github.com/vuejs/vue-component-compiler/issues/59)) ([976d4f1](https://github.com/vuejs/vue-component-compiler/commit/976d4f1))
* Use custom implementation of normalizer if provided ([#61](https://github.com/vuejs/vue-component-compiler/issues/61)) ([18cb7c1](https://github.com/vuejs/vue-component-compiler/commit/18cb7c1))



<a name="3.1.0"></a>
# 3.1.0 (2018-05-01)

### Features

* Use custom implementation of normalizer if provided ([37f6cd8](https://github.com/vuejs/vue-component-compiler/commit/37f6cd8))
