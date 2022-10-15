// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {GlobalState} from 'types/store';

import {isVoiceMessageEnabled} from 'selectors/views/textbox';

describe('selectors/views/textbox', () => {
    it('isVoiceMessageEnabled', () => {
        expect(isVoiceMessageEnabled({
            entities: {
                general: {
                    config: {
                        EnableFileAttachments: 'true',
                        FeatureFlagVoiceMessages: 'true',
                        ExperimentalEnableVoiceMessages: 'true',
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
            expect(isVoiceMessageEnabled({
                entities: {
                    general: {
                        config: {
                            EnableFileAttachments: config[0],
                            FeatureFlagVoiceMessages: config[1],
                            ExperimentalEnableVoiceMessages: config[2],
                        },
                    },
                },
            } as GlobalState)).toEqual(false);
        });
    });
});
