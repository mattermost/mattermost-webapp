// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useIntl} from 'react-intl';

import {AppCallTypes} from 'mattermost-redux/constants/apps';
import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/common';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {AppBinding} from 'mattermost-redux/types/apps';

import {doAppCall, openAppsModal} from 'actions/apps';

import {createCallContext, createCallRequest} from 'utils/apps';

type BindingComponentProps = {
    binding: AppBinding;
}

const AppBarBinding = (props: BindingComponentProps) => {
    const {binding} = props;

    const dispatch = useDispatch();
    const intl = useIntl();

    const channelId = useSelector(getCurrentChannelId);
    const teamId = useSelector(getCurrentTeamId);

    const submitAppCall = React.useCallback(async () => {
        const call = binding.form?.call || binding.call;

        if (!call) {
            return;
        }
        const context = createCallContext(
            binding.app_id,
            binding.location,
            channelId,
            teamId,
            '',
            '',
        );
        const callRequest = createCallRequest(
            call,
            context,
        );

        if (binding.form) {
            dispatch(openAppsModal(binding.form, callRequest));
            return;
        }

        dispatch(doAppCall(callRequest, AppCallTypes.SUBMIT, intl));
    }, [binding, teamId, channelId]);

    const id = `app-bar-icon-${binding.app_id}`;

    return (
        <div
            id={id}
            aria-label={binding.label || binding.app_id}
            className={'app-bar-binding'}
            onClick={submitAppCall}
        >
            <img src={binding.icon}/>
        </div>
    );
};

export default AppBarBinding;
