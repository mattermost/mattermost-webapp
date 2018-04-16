// Copyright (c) 2018-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import SettingItemMin from 'components/setting_item_min.jsx';

import Describe from './describe.jsx';
import SectionTitle from './section_title.jsx';

export default function CollapseView({onExpandSection, globalNotifyLevel, memberNotifyLevel, section}) {
    return (
        <SettingItemMin
            title={<SectionTitle section={section}/>}
            describe={
                <Describe
                    section={section}
                    memberNotifyLevel={memberNotifyLevel}
                    globalNotifyLevel={globalNotifyLevel}
                />
            }
            updateSection={onExpandSection}
            section={section}
        />
    );
}

CollapseView.propTypes = {
    onExpandSection: PropTypes.func.isRequired,
    globalNotifyLevel: PropTypes.string,
    memberNotifyLevel: PropTypes.string.isRequired,
    section: PropTypes.string.isRequired,
};
