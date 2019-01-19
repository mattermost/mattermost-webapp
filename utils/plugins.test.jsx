// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {hasPostPlugins} from 'utils/plugins.jsx';

test('Should return according to CreatePostDropdown state', () => {
    expect(hasPostPlugins({})).toBeFalsy();
    expect(hasPostPlugins({CreatePostDropdown: []})).toBeFalsy();
    expect(hasPostPlugins({CreatePostDropdown: ['someentry']})).toBeTruthy();
});
