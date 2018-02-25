// Copyright (c) 2018-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import assert from 'assert';

import {trimFilename, canUploadFiles} from 'utils/file_utils.jsx';
import * as UserAgent from 'utils/user_agent';

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

describe('FileUtils.canUploadFiles', function() {
    UserAgent.isMobileApp = jest.fn().mockImplementation(() => false);

    it('is false when file attachments are disabled', function() {
        const state = {
            entities: {
                general: {
                    license: {
                        IsLicensed: 'true',
                        Compliance: 'true',
                    },
                    config: {
                        EnableFileAttachments: 'false',
                        EnableMobileFileUpload: 'true',
                    },
                },
            },
        };
        assert.equal(canUploadFiles(state), false);
    });

    describe('is true when file attachments are enabled', () => {
        UserAgent.isMobileApp.mockImplementation(() => false);

        it('and not on mobile', () => {
            UserAgent.isMobileApp.mockImplementation(() => false);

            const state = {
                entities: {
                    general: {
                        license: {
                            IsLicensed: 'true',
                            Compliance: 'true',
                        },
                        config: {
                            EnableFileAttachments: 'true',
                            EnableMobileFileUpload: 'false',
                        },
                    },
                },
            };
            assert.equal(canUploadFiles(state), true);
        });

        it('and on mobile but no compliance license enabled', function() {
            UserAgent.isMobileApp.mockImplementation(() => true);

            const state = {
                entities: {
                    general: {
                        license: {
                            IsLicensed: 'false',
                            Compliance: 'false',
                        },
                        config: {
                            EnableFileAttachments: 'true',
                            EnableMobileFileUpload: 'false',
                        },
                    },
                },
            };
            assert.equal(canUploadFiles(state), true);
        });

        it('and on mobile with compliance license enabled but mobile file upload enabled', () => {
            UserAgent.isMobileApp.mockImplementation(() => true);

            const state = {
                entities: {
                    general: {
                        license: {
                            IsLicensed: 'true',
                            Compliance: 'true',
                        },
                        config: {
                            EnableFileAttachments: 'true',
                            EnableMobileFileUpload: 'true',
                        },
                    },
                },
            };
            assert.equal(canUploadFiles(state), true);
        });

        it('unless on mobile with compliance license enabled and mobile file upload disabled', () => {
            UserAgent.isMobileApp.mockImplementation(() => true);

            const state = {
                entities: {
                    general: {
                        license: {
                            IsLicensed: 'true',
                            Compliance: 'true',
                        },
                        config: {
                            EnableFileAttachments: 'true',
                            EnableMobileFileUpload: 'false',
                        },
                    },
                },
            };
            assert.equal(canUploadFiles(state), false);
        });
    });
});
