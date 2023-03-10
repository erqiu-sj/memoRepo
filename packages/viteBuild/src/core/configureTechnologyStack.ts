/*
 * @Author: 邱狮杰
 * @Date: 2023-01-27 11:17:08
 * @LastEditTime: 2023-01-29 09:16:36
 * @Description: 配置场景
 * @FilePath: /memo/packages/viteBuild/src/core/configureTechnologyStack.ts
 */

import { getObjValues } from '@memo28/types'
import legacy from '@vitejs/plugin-legacy'
import reactSwcPlugin from '@vitejs/plugin-react-swc'
import vuePlugin from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { transformShortVmodel } from '@vue-macros/short-vmodel'
import vueMacros from 'unplugin-vue-macros/vite'
import { PluginOption } from 'vite'
import printURL from 'vite-plugin-print-urls'
import injection from './injection'

export interface configureTechnologyStackTypes<T extends string = string> {
  configureTechnologyStack: string | T //  配置技术栈
  defaultPlugIn: PluginOption // 默认插件
}

export type ConfigureTechnologyStack = 'vue' | 'react' | ''

/**
 * @description 配置vue
 */
export class ConfigureVueTechnologyStack implements configureTechnologyStackTypes<'vue'> {
  configureTechnologyStack = 'vue'
  defaultPlugIn: PluginOption = [
    legacy(),
    vueMacros({
      plugins: {
        vue: vuePlugin({
          include: [/\.vue$/, /setup\.[cm]?[jt]sx?$/],
          template: {
            compilerOptions: {
              nodeTransforms: [
                transformShortVmodel({
                  prefix: '$',
                }),
              ],
            },
          },
        }),
        vueJsx: vueJsx(),
      },
    }),
    printURL(),
  ]
}

/**
 * @description 配置react场景
 */
export class ConfigureReactTechnologyStack implements configureTechnologyStackTypes<'react'> {
  configureTechnologyStack = 'react'
  defaultPlugIn: PluginOption = [legacy(), reactSwcPlugin(), printURL()]
}

export interface injectDefaultTechnologyStackConfigurationOpt {
  defaultModule: configureTechnologyStackTypes[]
}

const injectDefaultTechnologyStackConfigurationMapper = {
  defaultModule: 'defaultModule',
} as const

/**
 * @description defaultModule 注入类型
 */
export type technologyStackTypes = Map<string, PluginOption>

export type injectDefaultTechnologyStackConfigurationMapperTypes = getObjValues<typeof injectDefaultTechnologyStackConfigurationMapper>

/**
 * @description 注入默认技术栈配置
 */
export function injectDefaultTechnologyStackConfiguration(ops: injectDefaultTechnologyStackConfigurationOpt) {
  return (target: object) => {
    const technologyStack: technologyStackTypes = new Map<string, PluginOption>()
    ops.defaultModule.forEach(modules => {
      technologyStack.set(modules.configureTechnologyStack, modules.defaultPlugIn)
    })
    injection.setValue(target, 'defaultModule', technologyStack)
  }
}
