// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import os from 'os';

import {expect, test, Locator, ViewportSize} from '@playwright/test';

export function isSmallScreen(viewport?: ViewportSize | {width: number; height: number} | null) {
    return viewport?.width ? Boolean(viewport?.width <= 390) : true;
}

export function shouldSkipInSmallScreen() {
    test.skip(({viewport}) => isSmallScreen(viewport), 'Not applicable to mobile device');
}

export async function shouldRunInLinux() {
    const platform = os.platform();
    await expect(platform, 'Run in Linux or Playwright docker image only').toBe('linux');
}

export async function waitForAnimationEnd(locator: Locator) {
    return locator.evaluate((element) =>
        Promise.all(element.getAnimations({subtree: true}).map((animation) => animation.finished))
    );
}
