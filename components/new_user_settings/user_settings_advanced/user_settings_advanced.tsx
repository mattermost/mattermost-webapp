// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {FC} from 'react';

import GenricSectionCreator1 from '../generic_section_creator';

interface Props {
    somethingChanged: boolean;
    setSomethingChanged: React.Dispatch<React.SetStateAction<boolean>>;
}

const UserSettingsAdvanced: FC<Props> = (props: Props) => {
    return (
        <div className='section'>
            {GenricSectionCreator1({
                title: {
                    id: 'user.settings.advanced.sendMessages',
                    message: 'Send messages with ⌘ ENTER',
                },
                description: {
                    id: 'user.settings.advanced.whenEnabled',
                    message:
                        'When enabled, pressing ⌘ ENTER sends the message, and pressing ENTER inserts a new line.',
                },
                subSection: {
                    radio: [
                        [
                            {
                                id: 'user.settings.advanced.on',
                                message: 'On for all messages',
                            },
                            {
                                id: 'user.settings.advanced.codeBlocks',
                                message:
                                    'On only for code blocks starting with ```',
                            },
                            {
                                id: 'user.settings.advanced.off',
                                message: 'Off',
                            },
                        ],
                    ],
                },
            })}
            {GenricSectionCreator1({
                title: {
                    id: 'user.settings.advanced.join',
                    message: 'Join/leave messages',
                },
                description: {
                    id: 'user.settings.advanced.enable',
                    message:
                        'When enabled, system messages display when users join or leave Mattermost channels. ',
                },
                subSection: {
                    checkbox: [
                        {
                            id: 'user.settings.advanced.enableJoinOrLeave',
                            message: 'Enable join & leave messages',
                        },
                    ],
                },
            })}
            {GenricSectionCreator1({
                title: {
                    id: 'user.settings.advanced.preview',
                    message: 'Preview pre-release features',
                },
                subSection: {
                    checkbox: [
                        {
                            id: 'user.settings.advanced.markdown',
                            message:
                                'Show markdown preview option in message input box',
                        },
                    ],
                },
            })}
        </div>
    );
};

export default UserSettingsAdvanced;
