// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import assert from 'assert';

import {
    trimFilename,
    canUploadFiles,
    getFileTypeFromMime,
} from 'utils/file_utils.jsx';
import * as UserAgent from 'utils/user_agent';

describe('FileUtils.trimFilename', () => {
    it('trimFilename', () => {
        assert.equal(
            trimFilename('abcdefghijklmnopqrstuvwxyz'),
            'abcdefghijklmnopqrstuvwxyz',
            'should return same filename',
        );

        assert.equal(
            trimFilename('abcdefghijklmnopqrstuvwxyz0123456789'),
            'abcdefghijklmnopqrstuvwxyz012345678...',
            'should return trimmed filename',
        );
    });
});

describe('FileUtils.canUploadFiles', () => {
    UserAgent.isMobileApp = jest.fn().mockImplementation(() => false); // eslint-disable-line no-import-assign

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

    describe('get filetypes based on mime interpreted from browsers', () => {
        it('mime type for videos', () => {
            assert.equal(getFileTypeFromMime('video/mp4'), 'video');
        });

        it('mime type for audio', () => {
            assert.equal(getFileTypeFromMime('audio/mp3'), 'audio');
        });

        it('mime type for image', () => {
            assert.equal(getFileTypeFromMime('image/JPEG'), 'image');
        });

        it('mime type for pdf', () => {
            assert.equal(getFileTypeFromMime('application/pdf'), 'pdf');
        });

        it('mime type for spreadsheet', () => {
            assert.equal(getFileTypeFromMime('application/vnd.ms-excel'), 'spreadsheet');
        });

        it('mime type for presentation', () => {
            assert.equal(getFileTypeFromMime('application/vnd.ms-powerpoint'), 'presentation');
        });

        it('mime type for word', () => {
            assert.equal(getFileTypeFromMime('application/vnd.ms-word'), 'word');
        });

        it('mime type for unknown file format', () => {
            assert.equal(getFileTypeFromMime('application/unknownFormat'), 'other');
        });

        it('mime type for no suffix', () => {
            assert.equal(getFileTypeFromMime('asdasd'), 'other');
        });
    });
});
