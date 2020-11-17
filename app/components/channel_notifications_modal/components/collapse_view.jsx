// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import SettingItemMin from 'components/setting_item_min';

import Describe from './describe.jsx';
import SectionTitle from './section_title.jsx';

export default function CollapseView({onExpandSection, globalNotifyLevel, memberNotifyLevel, section, ignoreChannelMentions}) {
    return (
        <SettingItemMin
            title={<SectionTitle section={section}/>}
            describe={
                <Describe
                    section={section}
                    ignoreChannelMentions={ignoreChannelMentions}
                    memberNotifyLevel={memberNotifyLevel}
                    globalNotifyLevel={globalNotifyLevel}
                    isCollapsed={true}
                />
            }
            updateSection={onExpandSection}
            section={section}
        />
    );
}

CollapseView.propTypes = {
    ignoreChannelMentions: PropTypes.string,
    onExpandSection: PropTypes.func.isRequired,
    globalNotifyLevel: PropTypes.string,
    memberNotifyLevel: PropTypes.string.isRequired,
    section: PropTypes.string.isRequired,
};
