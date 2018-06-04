// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getRelativeChannelURL} from 'utils/url.jsx';

describe('Utils.URL', function() {
    test('getRelativeChannelURL', function() {
        expect(getRelativeChannelURL('teamName', 'channelName')).toEqual('/teamName/channels/channelName');
    });
});
