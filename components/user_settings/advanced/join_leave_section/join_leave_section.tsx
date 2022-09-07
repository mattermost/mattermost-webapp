// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import {FormattedMessage} from 'react-intl';

import {Preferences} from 'mattermost-redux/constants';
import {AdvancedSections} from 'utils/constants';
import SectionCreator from '../../generic/section_creator';
import {t} from 'utils/i18n';

const joinLeaveTitle = {
    id: t('user.settings.advance.joinLeaveTitle'),
    defaultMessage: 'Enable Join/Leave Messages',

};

const joinLeaveDesc = {
    id: t('user.settings.advance.joinLeaveDesc'),
    defaultMessage: 'When "On", System Messages saying a user has joined or left a channel will be visible. When "Off", the System Messages about joining or leaving a channel will be hidden. A message will still show up when you are added to a channel, so you can receive a notification.',

};

type Props = {
    currentUserId: string;
    joinLeave?: string;
    onUpdateSection: (section?: string) => void;
}

function JoinLeaveSection({joinLeave, onUpdateSection, currentUserId}: Props) {
    const [joinLeaveState, setJoinLeaveState] = useState(joinLeave);

    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const value = e.currentTarget.value;

        setJoinLeaveState(value);
    };

    const handleUpdateSection = (section?: string): void => {
        if (!section) {
            setJoinLeaveState(joinLeave);
        }
        onUpdateSection(section);
    };

    const handleSubmit = (): void => {
        const joinLeavePreference = {category: Preferences.CATEGORY_ADVANCED_SETTINGS, user_id: currentUserId, name: Preferences.ADVANCED_FILTER_JOIN_LEAVE, value: joinLeaveState};

        // savePreferences(currentUserId, [joinLeavePreference]);
        onUpdateSection();
    };

    const content = (<fieldset key='joinLeaveSetting'>
        <legend className='form-legend hidden-label'>
            <FormattedMessage
                id='user.settings.advance.joinLeaveTitle'
                defaultMessage='Enable Join/Leave Messages'
            />
        </legend>
        <div className='radio'>
            <label>
                <input
                    id='joinLeaveOn'
                    type='radio'
                    value={'true'}
                    name={AdvancedSections.JOIN_LEAVE}
                    checked={joinLeaveState === 'true'}
                    onChange={handleOnChange}
                />
                <FormattedMessage
                    id='user.settings.advance.on'
                    defaultMessage='On'
                />
            </label>
            <br/>
        </div>
        <div className='radio'>
            <label>
                <input
                    id='joinLeaveOff'
                    type='radio'
                    value={'false'}
                    name={AdvancedSections.JOIN_LEAVE}
                    checked={joinLeaveState === 'false'}
                    onChange={handleOnChange}
                />
                <FormattedMessage
                    id='user.settings.advance.off'
                    defaultMessage='Off'
                />
            </label>
            <br/>
        </div>
    </fieldset>
    );

    return (
        <SectionCreator
            title={joinLeaveTitle}
            description={joinLeaveDesc}
            content={content}
        />
    );
}

export default JoinLeaveSection;
