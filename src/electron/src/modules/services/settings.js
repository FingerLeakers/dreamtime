// DreamTime.
// Copyright (C) DreamNet. All rights reserved.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License 3.0 as published by
// the Free Software Foundation. See <https://www.gnu.org/licenses/gpl-3.0.html>
//
// Written by Ivan Bravo Bravo <ivan@dreamnet.tech>, 2019.

import fs from 'fs-extra'
import {
  round, cloneDeep,
} from 'lodash'
import uuid from 'uuid'
import { BaseService } from './base'
import { paths, system } from '../tools'

const logger = require('logplease').create('electron:scripts:services:settings')

/**
 * User settings.
 */
class SettingsService extends BaseService {
  _default = {}

  /**
   * file where to save the payload.
   *
   * @type {string}
   */
  get path() {
    return paths.getPath('userData', 'settings.json')
  }

  /**
   * Setup service
   */
  async setup() {
    await this._create()
    await this._upgrade()
  }

  /**
   *
   */
  async initialSetup() {
    this._loadInitital()
    await this.load()
  }

  _loadInitital() {
    const hasGPU = system.graphics.length > 0
    const cores = round(system.cores / 2) || 4

    this.payload = {
      version: 4,
      welcome: true,
      user: uuid(),

      app: {
        disableHardwareAcceleration: false,
        uploadMode: 'add-queue',
      },

      processing: {
        device: hasGPU ? 'GPU' : 'CPU',
        gpus: [0],
        cores,
        disablePersistentGan: false,
        usePython: process.env.NODE_ENV === 'development',
      },

      preferences: {
        body: {
          executions: 1,
          randomize: false,

          progressive: {
            enabled: false,
            rate: 0.1,
          },

          boobs: {
            size: '1',
            randomize: true,
            progressive: true,
          },
          areola: {
            size: '1',
            randomize: false,
            progressive: true,
          },
          nipple: {
            size: '1',
            randomize: false,
            progressive: true,
          },
          vagina: {
            size: '0.75',
            randomize: true,
            progressive: true,
          },
          pubicHair: {
            size: '1',
            randomize: true,
            progressive: true,
          },
        },

        advanced: {
          scaleMode: 'auto-rescale',
          useColorTransfer: false,
          useWaifu: false,
        },
      },

      notifications: {
        run: false,
        allRuns: true,
        update: true,
      },

      folders: {
        cropped: paths.getPath('temp'),
        models: paths.getPath('userData', 'models'),
        masks: paths.getPath('userData', 'masks'),
        cli: paths.getPath('userData', 'dreampower'),
      },

      telemetry: {
        enabled: true,
      },
    }

    this._default = cloneDeep(this.payload)
  }

  /**
   * Create the settings file if it does not exist
   */
  async _create() {
    if (fs.existsSync(this.path)) {
      return
    }

    try {
      fs.outputFileSync(this.path, JSON.stringify(this._default, null, 2))
    } catch (error) {
      throw new Error(`Settings creation fail. Please make sure the program has the necessary permissions to write to:\n${this.path}\n\n${error}`)
    }
  }

  /**
   * Check if it is necessary to update the settings file.
   * legacy code :WutFaceW:
   */
  async _upgrade() {
    const currentVersion = this.payload.version || 1
    const newVersion = this._default.version

    if (newVersion === currentVersion) {
      return
    }

    logger.debug(`Upgrading settings file to v${newVersion}`)

    const currentSettings = this.payload
    const newSettings = cloneDeep(currentSettings)

    // Upgrade 1 -> 2
    if (currentVersion === 1 && newVersion === 2) {
      newSettings.version = 2
      newSettings.preferences = this._default.preferences
      newSettings.notifications = this._default.notifications

      const {
        boobsSize,
        areolaSize,
        nippleSize,
        vaginaSize,
        pubicHairSize,
      } = this.payload.preferences

      newSettings.preferences.boobs.size = boobsSize
      newSettings.preferences.areola.size = areolaSize
      newSettings.preferences.nipple.size = nippleSize
      newSettings.preferences.vagina.size = vaginaSize
      newSettings.preferences.pubicHair.size = pubicHairSize
    }

    // Upgrade 2 -> 3
    if (currentVersion === 2 && newVersion === 3) {
      const { processing, preferences } = currentSettings

      newSettings.version = 3

      newSettings.processing = {
        ...processing,
        cores: 4,
        disablePersistentGan: false,
      }

      newSettings.preferences = {
        body: {
          executions: preferences.executions,
          randomize: preferences.randomizePreferences,

          progressive: {
            enabled: preferences.progressivePreferences,
            rate: 0.1,
          },

          boobs: preferences.boobs,
          areola: preferences.areola,
          nipple: preferences.nipple,
          vagina: preferences.vagina,
          pubicHair: preferences.pubicHair,
        },

        advanced: {
          scaleMode: 'auto-rescale',
          useColorTransfer: false,
          useWaifu: false,
        },
      }
    }

    // Upgrade 3 -> 4
    if (currentVersion === 3 && newVersion === 4) {
      newSettings.version = 4
      newSettings.app = {
        disableHardwareAcceleration: false,
        uploadMode: 'add-queue',
      }
    }

    this.set(newSettings)
  }
}

export const settings = SettingsService.make()
