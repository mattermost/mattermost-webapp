// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {TrueOrFalseInString} from './config';

export interface License extends Record<string, string> {
    IsLicensed: TrueOrFalseInString;
    Cloud: TrueOrFalseInString;
}
