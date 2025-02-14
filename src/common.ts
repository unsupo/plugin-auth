/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { AuthInfo, Logger, SfdcUrl, SfdxProject } from '@salesforce/core';
import { getString, isObject, Optional } from '@salesforce/ts-types';

interface Flags {
  setalias?: string;
  setdefaultdevhubusername?: boolean;
  setdefaultusername?: boolean;
}

export class Common {
  public static async handleSideEffects(authInfo: AuthInfo, flags: Flags): Promise<void> {
    if (flags.setalias) await authInfo.setAlias(flags.setalias);

    if (flags.setdefaultdevhubusername || flags.setdefaultusername) {
      await authInfo.setAsDefault({
        defaultUsername: flags.setdefaultusername,
        defaultDevhubUsername: flags.setdefaultdevhubusername,
      });
    }
  }
  public static async resolveLoginUrl(instanceUrl: Optional<string>): Promise<Optional<string>> {
    if (instanceUrl) {
      return instanceUrl;
    }
    const logger = await Logger.child('Common', { tag: 'resolveLoginUrl' });
    let loginUrl: string;
    try {
      const project = await SfdxProject.resolve();
      const projectJson = await project.resolveProjectConfig();
      loginUrl = getString(projectJson, 'sfdcLoginUrl', SfdcUrl.PRODUCTION);
    } catch (err) {
      const message: string = (isObject(err) ? Reflect.get(err, 'message') ?? err : err) as string;
      logger.debug(`error occurred while trying to determine loginUrl: ${message}`);
      loginUrl = SfdcUrl.PRODUCTION;
    }
    logger.debug(`loginUrl: ${loginUrl}`);
    return loginUrl;
  }
}
