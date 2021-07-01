// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {OsColorSchemeName} from 'mattermost-redux/types/general';

const SyncWithOsCheckbox: React.FC<Props> = ({checked, onChange, osColorScheme}: Props) => {
    return (
        <>
            <div className='checkbox'>
                <label>
                    <input
                        type='checkbox'
                        checked={checked}
                        onChange={(e) => {
                            const newValue = e.target.checked;
                            onChange(newValue);
                        }}
                    />
                    <FormattedMessage
                        id='user.settings.display.theme.syncWithOs'
                        defaultMessage='Sync with OS appearance'
                    />
                </label>
            </div>
            <div className='theme-sync-with-os-explanation'>
                <FormattedMessage
                    id='user.settings.display.theme.syncWithOs.explanation'
                    defaultMessage='Automatically switch between light and dark themes when your system does.'
                />
                <br/>
                {osColorScheme === 'light' ? (
                    <FormattedMessage
                        id='user.settings.display.theme.syncWithOs.osIsLight'
                        defaultMessage='Your OS is currently set to light.'
                    />
                ) : (
                    <FormattedMessage
                        id='user.settings.display.theme.syncWithOs.osIsDark'
                        defaultMessage='Your OS is currently set to dark.'
                    />
                )}
            </div>
        </>
    );
};

type Props = {
    checked: boolean;
    onChange: (checked: boolean) => void;
    osColorScheme: OsColorSchemeName;
}

export default SyncWithOsCheckbox;
