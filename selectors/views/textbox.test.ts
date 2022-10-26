// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {GlobalState} from 'types/store';

import {isVoiceMessagesEnabled} from 'selectors/views/textbox';

describe('selectors/views/textbox', () => {
    it('isVoiceMessagesEnabled', () => {
        expect(isVoiceMessagesEnabled({
            entities: {
                general: {
                    config: {
                        EnableFileAttachments: 'true',
                        FeatureFlagVoiceMessages: 'true',
                        EnableVoiceMessages: 'true',
                    },
                },
            },
        } as GlobalState)).toEqual(true);

        [
            ['false', 'false', 'false'],
            ['false', 'false', 'true'],
            ['false', 'true', 'false'],
            ['false', 'true', 'true'],
            ['true', 'false', 'false'],
            ['true', 'false', 'true'],
            ['true', 'true', 'false'],
        ].forEach((config) => {
            expect(isVoiceMessagesEnabled({
                entities: {
                    general: {
                        config: {
                            EnableFileAttachments: config[0],
                            FeatureFlagVoiceMessages: config[1],
                            EnableVoiceMessages: config[2],
                        },
                    },
                },
            } as GlobalState)).toEqual(false);
        });
    });
});
