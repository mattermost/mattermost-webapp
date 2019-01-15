// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import {IgnoreChannelMentions, NotificationLevels, NotificationSections} from 'utils/constants.jsx';

import SettingItemMax from 'components/setting_item_max.jsx';

import Describe from './describe.jsx';
import ExtraInfo from './extra_info.jsx';
import SectionTitle from './section_title.jsx';

export default function ExpandView({
    section,
    memberNotifyLevel,
    globalNotifyLevel,
    onChange,
    onSubmit,
    serverError,
    onCollapseSection,
    ignoreChannelMentions,
}) {
    const inputs = [(
        <div key='channel-notification-level-radio'>
            {(section === NotificationSections.DESKTOP || section === NotificationSections.PUSH) &&
            <div>
                <div className='radio'>
                    <label className=''>
                        <input
                            id='channelNotificationGlobalDefault'
                            type='radio'
                            value={NotificationLevels.DEFAULT}
                            checked={memberNotifyLevel === NotificationLevels.DEFAULT}
                            onChange={onChange}
                        />
                        <Describe
                            section={section}
                            memberNotifyLevel={NotificationLevels.DEFAULT}
                            globalNotifyLevel={globalNotifyLevel}
                        />
                    </label>
                </div>
                <div className='radio'>
                    <label className=''>
                        <input
                            id='channelNotificationAllActivity'
                            type='radio'
                            value={NotificationLevels.ALL}
                            checked={memberNotifyLevel === NotificationLevels.ALL}
                            onChange={onChange}
                        />
                        <Describe
                            section={section}
                            memberNotifyLevel={NotificationLevels.ALL}
                        />
                    </label>
                </div>
                <div className='radio'>
                    <label className=''>
                        <input
                            id='channelNotificationMentions'
                            type='radio'
                            value={NotificationLevels.MENTION}
                            checked={memberNotifyLevel === NotificationLevels.MENTION}
                            onChange={onChange}
                        />
                        <Describe
                            section={section}
                            memberNotifyLevel={NotificationLevels.MENTION}
                        />
                    </label>
                </div>
                <div className='radio'>
                    <label>
                        <input
                            id='channelNotificationNever'
                            type='radio'
                            value={NotificationLevels.NONE}
                            checked={memberNotifyLevel === NotificationLevels.NONE}
                            onChange={onChange}
                        />
                        <Describe
                            section={section}
                            memberNotifyLevel={NotificationLevels.NONE}
                        />
                    </label>
                </div>
            </div>
            }
            {section === NotificationSections.IGNORE_CHANNEL_MENTIONS &&
                <div>
                    <div className='radio'>
                        <label>
                            <input
                                id='ignoreChannelMentionsOn'
                                type='radio'
                                value={IgnoreChannelMentions.ON}
                                checked={ignoreChannelMentions === IgnoreChannelMentions.ON}
                                onChange={onChange}
                            />
                            <Describe
                                section={section}
                                ignoreChannelMentions={IgnoreChannelMentions.ON}
                                memberNotifyLevel={memberNotifyLevel}
                                globalNotifyLevel={globalNotifyLevel}
                            />
                        </label>
                    </div>
                    <div className='radio'>
                        <label>
                            <input
                                id='ignoreChannelMentionsOff'
                                type='radio'
                                value={IgnoreChannelMentions.OFF}
                                checked={ignoreChannelMentions === IgnoreChannelMentions.OFF}
                                onChange={onChange}
                            />
                            <Describe
                                section={section}
                                ignoreChannelMentions={IgnoreChannelMentions.OFF}
                                memberNotifyLevel={memberNotifyLevel}
                                globalNotifyLevel={globalNotifyLevel}
                            />
                        </label>
                    </div>
                </div>
            }
            {section === NotificationSections.MARK_UNREAD &&
            <div>
                <div className='radio'>
                    <label className=''>
                        <input
                            id='channelNotificationUnmute'
                            type='radio'
                            value={NotificationLevels.MENTION}
                            checked={memberNotifyLevel === NotificationLevels.MENTION}
                            onChange={onChange}
                        />
                        <Describe
                            section={section}
                            memberNotifyLevel={NotificationLevels.MENTION}
                        />
                    </label>
                </div>
                <div className='radio'>
                    <label className=''>
                        <input
                            id='channelNotificationMute'
                            type='radio'
                            value={NotificationLevels.ALL}
                            checked={memberNotifyLevel === NotificationLevels.ALL}
                            onChange={onChange}
                        />
                        <Describe
                            section={section}
                            memberNotifyLevel={NotificationLevels.ALL}
                        />
                    </label>
                </div>
            </div>
            }
        </div>
    )];

    return (
        <SettingItemMax
            title={<SectionTitle section={section}/>}
            inputs={inputs}
            submit={onSubmit}
            server_error={serverError}
            updateSection={onCollapseSection}
            extraInfo={<ExtraInfo section={section}/>}
        />
    );
}

ExpandView.propTypes = {
    ignoreChannelMentions: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    onCollapseSection: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    globalNotifyLevel: PropTypes.string,
    memberNotifyLevel: PropTypes.string.isRequired,
    section: PropTypes.string.isRequired,
    serverError: PropTypes.string,
};
