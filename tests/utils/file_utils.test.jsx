// Copyright (c) 2018-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import assert from 'assert';

import {trimFilename} from 'utils/file_utils.jsx';

describe('FileUtils.trimFilename', function() {
    it('trimFilename', function() {
        assert.equal(
            trimFilename('abcdefghijklmnopqrstuvwxyz'),
            'abcdefghijklmnopqrstuvwxyz',
            'should return same filename'
        );

        assert.equal(
            trimFilename('abcdefghijklmnopqrstuvwxyz0123456789'),
            'abcdefghijklmnopqrstuvwxyz012345678...',
            'should return trimmed filename'
        );
    });
});
