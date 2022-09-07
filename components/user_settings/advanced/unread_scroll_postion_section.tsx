// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {FormattedMessage} from 'react-intl';
import React from 'react';
import {useSelector} from 'react-redux';

import {getUnreadScrollPositionPreference} from 'mattermost-redux/selectors/entities/preferences';
import {t} from 'utils/i18n';
import SectionCreator from '../generic/section_creator';
import {Preferences} from 'utils/constants';

const unreadScrollPositionTitle = {
    id: t('user.settings.advance.unreadScrollPositionTitle'),
    defaultMessage: 'Scroll position when viewing an unread channel',

};

const unreadScrollPositionDesc = {
    id: t('user.settings.advance.unreadScrollPositionDesc'),
    defaultMessage: 'Choose your scroll position when you view an unread channel. Channels will always be marked as read when viewed.',
};

type Props = {
    updateSetting: (setting: string, value: string) => void;
}

function UnreadScrollPositionSection({updateSetting}: Props): JSX.Element {
    const unreadScrollPosition = useSelector(getUnreadScrollPositionPreference);

    const content = (<>
        <fieldset key='unreadScrollPositionSetting'>
            <legend className='form-legend hidden-label'>
                <FormattedMessage
                    id='user.settings.advance.unreadScrollPositionTitle'
                    defaultMessage='Scroll position when viewing an unread channel'
                />
            </legend>
            <div className='radio'>
                <label>
                    <input
                        id='unreadPositionStartFromLeftOff'
                        type='radio'
                        name='unreadScrollPosition'
                        checked={unreadScrollPosition === Preferences.UNREAD_SCROLL_POSITION_START_FROM_LEFT}
                        onChange={() => updateSetting(Preferences.UNREAD_SCROLL_POSITION, Preferences.UNREAD_SCROLL_POSITION_START_FROM_LEFT)}
                    />
                    <FormattedMessage
                        id='user.settings.advance.startFromLeftOff'
                        defaultMessage='Start me where I left off'
                    />
                </label>
                <br/>
            </div>
            <div className='radio'>
                <label>
                    <input
                        id='unreadPositionStartFromNewest'
                        type='radio'
                        name='unreadScrollPosition'
                        checked={unreadScrollPosition === Preferences.UNREAD_SCROLL_POSITION_START_FROM_NEWEST}
                        onChange={() => updateSetting(Preferences.UNREAD_SCROLL_POSITION, Preferences.UNREAD_SCROLL_POSITION_START_FROM_NEWEST)}
                    />
                    <FormattedMessage
                        id='user.settings.advance.startFromNewest'
                        defaultMessage='Start me at the newest message'
                    />
                </label>
                <br/>
            </div>
        </fieldset>
    </>
    );

    return (
        <SectionCreator
            title={unreadScrollPositionTitle}
            description={unreadScrollPositionDesc}
            content={content}
        />
    );
}

export default UnreadScrollPositionSection;
