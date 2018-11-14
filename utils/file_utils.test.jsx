// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import assert from 'assert';

import {trimFilename, canUploadFiles, getFileDimentionsForDisplay} from 'utils/file_utils.jsx';
import * as UserAgent from 'utils/user_agent';

describe('FileUtils.trimFilename', () => {
    it('trimFilename', () => {
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

describe('FileUtils.canUploadFiles', () => {
    UserAgent.isMobileApp = jest.fn().mockImplementation(() => false);

    it('is false when file attachments are disabled', () => {
        const config = {
            EnableFileAttachments: 'false',
            EnableMobileFileUpload: 'true',
        };
        assert.equal(canUploadFiles(config), false);
    });

    describe('is true when file attachments are enabled', () => {
        UserAgent.isMobileApp.mockImplementation(() => false);

        it('and not on mobile', () => {
            UserAgent.isMobileApp.mockImplementation(() => false);

            const config = {
                EnableFileAttachments: 'true',
                EnableMobileFileUpload: 'false',
            };
            assert.equal(canUploadFiles(config), true);
        });

        it('and on mobile with mobile file upload enabled', () => {
            UserAgent.isMobileApp.mockImplementation(() => true);

            const config = {
                EnableFileAttachments: 'true',
                EnableMobileFileUpload: 'true',
            };
            assert.equal(canUploadFiles(config), true);
        });

        it('unless on mobile with mobile file upload disabled', () => {
            UserAgent.isMobileApp.mockImplementation(() => true);

            const config = {
                EnableFileAttachments: 'true',
                EnableMobileFileUpload: 'false',
            };
            assert.equal(canUploadFiles(config), false);
        });
    });
});

describe('FileUtils.getFileDimentionsForDisplay', function() {
    it('return image dimensions as they are smaller than max dimensions', () => {
        const expectedDimentions = getFileDimentionsForDisplay({height: 200, width: 200}, {maxHeight: 300, maxWidth: 300});
        expect(expectedDimentions).toEqual({height: 200, width: 200});
    });

    it('return image dimensions based on height dimetions as ratio of height > width', () => {
        const expectedDimentions = getFileDimentionsForDisplay({height: 600, width: 400}, {maxHeight: 300, maxWidth: 300});
        expect(expectedDimentions).toEqual({height: 300, width: 200});
    });

    it('return image dimensions based on width dimetions as ratio of width > height', () => {
        const expectedDimentions = getFileDimentionsForDisplay({height: 400, width: 600}, {maxHeight: 300, maxWidth: 300});
        expect(expectedDimentions).toEqual({height: 200, width: 300});
    });

    it('return image dimensions based on width ratio', () => {
        const expectedDimentions = getFileDimentionsForDisplay({height: 200, width: 600}, {maxHeight: 300, maxWidth: 300});
        expect(expectedDimentions).toEqual({height: 100, width: 300});
    });

    it('return image dimensions based on height ratio', () => {
        const expectedDimentions = getFileDimentionsForDisplay({height: 600, width: 200}, {maxHeight: 300, maxWidth: 300});
        expect(expectedDimentions).toEqual({height: 300, width: 100});
    });
});
