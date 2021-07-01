// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {FormattedMessage} from 'react-intl';

import SettingItemMin from '../../../setting_item_min';

import Expanded from './expanded';

const UserSettingsTheme: React.FC<Props> = ({selected, updateSection, setRequireConfirm, setEnforceFocus}: Props) => {
    return selected ? (
        <Expanded
            updateSection={updateSection}
            setRequireConfirm={setRequireConfirm}
            setEnforceFocus={setEnforceFocus}
        />
    ) : (
        <SettingItemMin
            title={
                <FormattedMessage
                    id='user.settings.display.theme.title'
                    defaultMessage='Theme'
                />
            }
            describe={
                <FormattedMessage
                    id='user.settings.display.theme.describe'
                    defaultMessage='Open to manage your theme'
                />
            }
            section={'theme'}
            updateSection={updateSection}
        />
    );
};

type Props = {
    selected: boolean;
    updateSection: (section: string) => void;
    setRequireConfirm: (requireConfirm?: boolean) => void;
    setEnforceFocus: (enforceFocus?: boolean) => void;
}

export default UserSettingsTheme;
