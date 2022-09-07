// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {FC} from 'react';
import {FormattedMessage} from 'react-intl';

import GenericSectionCreator from '../generic_section_creator';

import './user_settings_messages&media.scss';

const UserSettingsMessagesAndMedia: FC = () => {
    return (
        <div className='section'>
            {GenericSectionCreator({
                title: {
                    id: 'user.settings.message&media.messageDisplay',
                    message: 'Message display',
                },
                description: {
                    id: 'user.settings.message&media.messageLook',
                    message: 'Here’s how your messages will look',
                },
                subSection: {
                    radio: [
                        [
                            {
                                title: {
                                    id: 'user.settings.message&media.messageDensity',
                                    message: 'Message density',
                                },
                                id: 'user.settings.message&media.clean',
                                message: 'Clean: Easy to scan and read',
                            },
                            {
                                id: 'user.settings.message&media.compact',
                                message:
                                    'Compact: Fit as many messages on-screen as possible',
                            },
                        ],
                        [
                            {
                                title: {
                                    id: 'user.settings.message&media.messageWidth',
                                    message: 'Message width',
                                },
                                id: 'user.settings.message&media.fullWidth',
                                message: 'Full-width',
                            },
                            {
                                id: 'user.settings.message&media.fixedWidth',
                                message: 'Fixed-width, centered',
                            },
                        ],
                        [
                            {
                                title: {
                                    id: 'user.settings.message&media.teammateNameDisplay',
                                    message: 'Teammate name display',
                                },
                                id: 'user.settings.message&media.showUserName',
                                message: 'Show username',
                            },
                            {
                                id: 'user.settings.message&media.first&lastName',
                                message: 'Show first and last name',
                            },
                            {
                                id: 'user.settings.message&media.first&showNickname',
                                message:
                                    'Show nickname, otherwise show first and last name',
                            },
                        ],
                    ],
                    checkbox: [
                        {
                            title: {
                                id: 'user.settings.message&media.profileImages',
                                message: 'Online status on profile images',
                            },
                            id: 'user.settings.message&media.onlineStatus',
                            message: 'Show online status on profile images',
                        },
                    ],
                },
            })}
            {GenericSectionCreator({
                title: {
                    id: 'user.settings.message&media.threads',
                    message: 'Threads',
                },
                subSection: {
                    checkbox: [
                        {
                            description: {
                                id: 'user.settings.message&media.enabled',
                                message:
                                    "When enabled, replies aren't shown in the channel. You'll be notified about threads you're following in the Threads view. Please review our documentation for known issues and help provide feedback in our community channel.",
                            },
                            id: 'user.settings.message&media.enableCollapsedReplies',
                            message: 'Enabled collapsed replies (Beta)',
                        },
                        {
                            description: {
                                id: 'user.settings.message&media.whenEnabledPart',
                                message:
                                    'When enabled, select any part of a message to open the reply thread.',
                            },
                            id: 'user.settings.message&media.clickToOpen',
                            message: 'Click to open threads',
                        },
                    ],
                },
            })}
            {GenericSectionCreator({
                title: {
                    id: 'user.settings.message&media.imaheLinkPreview',
                    message: 'Image and link previews',
                },
                subSection: {
                    checkbox: [
                        {
                            id: 'user.settings.message&media.shoeExpanded',
                            message: 'Show expanded image previews',
                        },
                        {
                            id: 'user.settings.message&media.showWebsite',
                            message: 'Show website link previews',
                        },
                    ],
                },
            })}
            {GenericSectionCreator({
                title: {
                    id: 'user.settings.message&media.quickReactions',
                    message: 'Quick reactions',
                },
                description: {
                    id: 'user.settings.message&media.reactQuickly',
                    message:
                        'React quickly with recent or frequent reactions when hovering over a message.',
                },
                subSection: {
                    radio: [
                        [
                            {
                                title: {
                                    id: 'user.settings.message&media.preferredReaction',
                                    message:
                                        'Which reactions would you prefer to show?',
                                },
                                id: 'user.settings.message&media.mostFrequent',
                                message:
                                    'Show my most frequently used reactions',
                            },
                            {
                                id: 'user.settings.message&media.myPreferredReactions',
                                message: 'Show my preferred reactions',
                            },
                        ],
                    ],
                },
                xtraInfo: (
                    <div>
                        <FormattedMessage
                            id='user.settings.message&media.reactionPreview'
                            defaultMessage='Here’s how your reactions will look'
                        />
                    </div>
                ),
            })}
        </div>
    );
};

export default UserSettingsMessagesAndMedia;
