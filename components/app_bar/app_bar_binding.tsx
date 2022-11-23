// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useIntl} from 'react-intl';
import {Tooltip} from 'react-bootstrap';

import classNames from 'classnames';

import {AppCallResponseTypes} from 'mattermost-redux/constants/apps';
import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/common';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {AppBinding, AppCallResponse} from '@mattermost/types/apps';

import {handleBindingClick, openAppsModal, postEphemeralCallResponseForContext} from 'actions/apps';

import {createCallContext} from 'utils/apps';
import Constants from 'utils/constants';
import {DoAppCallResult} from 'types/apps';

import OverlayTrigger from 'components/overlay_trigger';
import {getRhsAppBinding} from 'selectors/rhs';
import {hideRHSAppBinding, showRHSAppBinding} from 'actions/views/rhs';

export const isAppBinding = (x: Record<string, any> | undefined): x is AppBinding => {
    return Boolean(x?.app_id);
};

type BindingComponentProps = {
    binding: AppBinding;
}

const AppBarBinding = (props: BindingComponentProps) => {
    const {binding} = props;

    const dispatch = useDispatch();
    const intl = useIntl();

    const channelId = useSelector(getCurrentChannelId);
    const teamId = useSelector(getCurrentTeamId);
    const rhsBinding = useSelector(getRhsAppBinding);

    const handleRhsBinding = (callResponse: AppCallResponse) => {
        const binding = callResponse.data as AppBinding;
        dispatch(showRHSAppBinding(binding));
    };

    const submitAppCall = async () => {
        if (rhsBinding?.app_id === props.binding.app_id) {
            dispatch(hideRHSAppBinding());
            return;
        }

        const context = createCallContext(
            binding.app_id,
            binding.location,
            channelId,
            teamId,
        );

        const result = await dispatch(handleBindingClick(binding, context, intl)) as DoAppCallResult;

        if (result.error) {
            const errMsg = result.error.text || 'An error occurred';
            dispatch(postEphemeralCallResponseForContext(result.error, errMsg, context));
            return;
        }

        const callResp = result.data as AppCallResponse;

        switch (callResp.type) {
        case AppCallResponseTypes.OK:
            if (callResp.text) {
                dispatch(postEphemeralCallResponseForContext(callResp, callResp.text, context));
            }

            handleRhsBinding(callResp);

            return;
        case AppCallResponseTypes.FORM:
            if (callResp.form) {
                dispatch(openAppsModal(callResp.form, context));
            }
            return;
        case AppCallResponseTypes.NAVIGATE:
            return;
        default: {
            const errorMessage = intl.formatMessage({
                id: 'apps.error.responses.unknown_type',
                defaultMessage: 'App response type not supported. Response type: {type}.',
            }, {
                type: callResp.type,
            });
            dispatch(postEphemeralCallResponseForContext(callResp, errorMessage, context));
        }
        }
    };

    const id = `app-bar-icon-${binding.app_id}`;
    const label = binding.label || binding.app_id;

    const tooltip = (
        <Tooltip id={'tooltip-' + id}>
            <span>{label}</span>
        </Tooltip>
    );

    const isButtonActive = rhsBinding?.app_id === props.binding.app_id;

    return (
        <OverlayTrigger
            trigger={['hover', 'focus']}
            delayShow={Constants.OVERLAY_TIME_DELAY}
            placement='left'
            overlay={tooltip}
        >
            <div
                id={id}
                aria-label={label}
                className={classNames('app-bar__icon', {'app-bar__icon--active': isButtonActive})}
                onClick={submitAppCall}
            >
                <div className={'app-bar__icon-inner'}>
                    {/* need to handle icon image errors */}
                    <img src={binding.icon}/>
                </div>
            </div>
        </OverlayTrigger>
    );
};

export default AppBarBinding;
