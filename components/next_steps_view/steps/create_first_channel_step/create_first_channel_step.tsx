// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useState} from 'react';

import {FormattedMessage} from 'react-intl';
import {useSelector, useDispatch} from 'react-redux';

import {createChannel} from 'mattermost-redux/actions/channels';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {Channel, ChannelType} from 'mattermost-redux/types/channels';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {ActionResult} from 'mattermost-redux/types/actions';

import {pageVisited, trackEvent} from 'actions/telemetry_actions';
import {switchToChannel} from 'actions/views/channel';
import {
    setFirstChannelName,
} from 'actions/views/channel_sidebar';

import LocalizedInput from 'components/localized_input/localized_input';
import {StepComponentProps} from '../../steps';

import {t} from 'utils/i18n';

import Constants from 'utils/constants';
import {isKeyPressed} from 'utils/utils.jsx';

import {GlobalState} from 'types/store';

const CreateFirstChannelStep = (props: StepComponentProps) => {
    const [channelCreateError, setChannelCreateError] = useState(false);
    const [buttonDisabled, setButtonDisabled] = useState(true);
    const [channelNameValue, setChannelNameValue] = useState('');
    const currentTeam = useSelector((state: GlobalState) => getCurrentTeam(state));
    const userId = useSelector((state: GlobalState) => getCurrentUserId(state));

    const dispatch = useDispatch();

    useEffect(() => {
        if (props.expanded) {
            pageVisited('cloud_first_user_onboarding', 'pageview_create_first_channel');
        }
    }, [props.expanded]);

    useEffect(() => {
        if (channelNameValue !== '' && channelNameValue.length > Constants.MIN_CHANNELNAME_LENGTH) {
            setButtonDisabled(false);
        } else {
            setButtonDisabled(true);
        }
    }, [(channelNameValue.length > Constants.MIN_CHANNELNAME_LENGTH)]);

    const channelCreationError = () => {
        if (channelCreateError) {
            return (
                <p className='input__help error'>
                    <FormattedMessage
                        id='first_channel.createChannelError'
                        defaultMessage='There was a problem during the channel creation.'
                    />
                </p>
            );
        }
        return null;
    };

    const onSubmitChannel = (displayName: string) => {
        const channel: Channel = {
            team_id: currentTeam.id,
            name: displayName.split(' ').join('-').toLowerCase(),
            display_name: displayName,
            purpose: '',
            header: '',
            type: Constants.OPEN_CHANNEL as ChannelType,
            create_at: 0,
            creator_id: '',
            delete_at: 0,
            group_constrained: false,
            id: '',
            last_post_at: 0,
            last_root_post_at: 0,
            scheme_id: '',
            update_at: 0,
        };

        const result = dispatch(createChannel(channel, userId)) as unknown as Promise<ActionResult>;

        result.then(({data, error}) => {
            if (error) {
                setChannelCreateError(true);
                setTimeout(() => {
                    setChannelCreateError(false);
                }, 5000);
            } else if (data) {
                // dispatch the first channel name value
                dispatch(setFirstChannelName(data.name));
                dispatch(switchToChannel(data));
            }
        });
    };

    const onEnterKeyDown = (e: React.KeyboardEvent) => {
        const enterPressed = isKeyPressed(e, Constants.KeyCodes.ENTER);

        // Enter pressed alone without required cmd or ctrl key
        if (enterPressed) {
            handleSubmit();
        }
    };

    const handleSubmit = () => {
        trackEvent('cloud_first_user_onboarding', 'click_create_first_channel');
        if (channelNameValue) {
            if (channelNameValue.length < Constants.MIN_CHANNELNAME_LENGTH) {
                return;
            }

            onSubmitChannel(channelNameValue);
        }
    };

    return (
        <div className='NextStepsView__createFirstChannel`'>
            <div
                className='channelNameLegend'
            >
                <FormattedMessage
                    id='first_channel.nameYourChannel'
                    defaultMessage='What project are you working on right now?'
                />
            </div>
            <div className='col-10'>
                <LocalizedInput
                    id='newChannelName'
                    type='text'
                    onChange={(e) => setChannelNameValue(e.target.value)}
                    className='form-control'
                    placeholder={{id: t('first_channel.nameEx'), defaultMessage: 'E.g.: "Bugs", "Marketing", "客户支持"'}}
                    maxLength={Constants.MAX_CHANNELNAME_LENGTH}
                    autoFocus={true}
                    onKeyDown={onEnterKeyDown}
                    value={channelNameValue}
                />
                {channelCreationError()}
                <div className='NextStepsView__wizardButtons'>
                    <button
                        id='submitNewChannel'
                        onClick={handleSubmit}
                        type='submit'
                        disabled={buttonDisabled}
                        className='btn btn-primary'
                    >
                        <FormattedMessage
                            id={props.completeStepButtonText.id}
                            defaultMessage={props.completeStepButtonText.defaultMessage}
                        />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateFirstChannelStep;
