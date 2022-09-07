// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable react/no-string-refs */
import React from 'react';

import ThemeSetting from 'components/user_settings/display/user_settings_theme';

type Props = {
    updateSection?: (section: string) => void;
    activeSection?: string;
    setRequireConfirm?: () => void;
    setEnforceFocus?: () => void;
    allowCustomThemes: boolean;
}

export default function UserSettingsThemes(props: Props) {
    const updateSection = (section: string) => {
        updateState();

        // props.updateSection(section);
    };

    const updateState = () => {
        // const newState = getDisplayStateFromProps(this.props);
        // if (!deepEqual(newState, this.state)) {
        //     setState(newState);
        // }
        //
        // this.setState({isSaving: false});
    };

    return (
        <div>
            <ThemeSetting
                selected={true}
                updateSection={updateSection}
                setRequireConfirm={props.setRequireConfirm}
                setEnforceFocus={props.setEnforceFocus}
                allowCustomThemes={props.allowCustomThemes}
            />
            <div className='divider-dark'/>
        </div>
    );
}
/* eslint-enable react/no-string-refs */
