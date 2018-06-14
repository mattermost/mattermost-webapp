// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// see https://github.com/facebook/jest/issues/2157#issuecomment-279171856
export const flushPromises = () => new Promise((resolve) => setImmediate(resolve));
