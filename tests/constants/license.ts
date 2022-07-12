// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ClientLicense} from "@mattermost/types/config";

export const emptyLicense: () => ClientLicense = () => ({});
export const cloudLicense: () => ClientLicense = () => ({
    ...emptyLicense(),
    Cloud: 'true',
});
