// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable no-process-env */

export default async function() {
    // Configure environment variables here since they're set before anything in Jest will use them
    process.env.TZ = 'Etc/UTC';
}
