// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {AppCallResponseTypes} from 'mattermost-redux/constants/apps';
import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/common';

import {DoAppCallResult} from 'types/apps';

import {handleBindingClick, openAppsModal, postEphemeralCallResponseForChannel} from 'actions/apps';
import {getRhsAppBinding} from 'selectors/rhs';
import {createCallContext} from 'utils/apps';

import SearchResultsHeader from 'components/search_results_header';

import {AppBinding} from '@mattermost/types/apps';

import {AppBindingView} from './view';

import './rhs_app_binding_styles.scss';

export default function RhsAppBinding() {
    const binding = useSelector(getRhsAppBinding);

    let view = <h3>{'Loading'}</h3>;
    if (binding) {
        view = (
            <RhsAppBindingInner
                binding={binding}
            />
        );
    }

    return (
        <div
            id='rhsContainer'
            className='sidebar-right__body mm-app-bar-rhs-binding'
        >
            <SearchResultsHeader>
                {binding?.label || ''}
            </SearchResultsHeader>
            <div
                style={{
                    overflowY: 'scroll',
                    height: '100%',
                }}
            >
                {view}
            </div>
        </div>
    );
}

export function RhsAppBindingInner(props: {binding: AppBinding}) {
    const {binding} = props;

    const dispatch = useDispatch();
    const channelID = useSelector(getCurrentChannelId);
    const context = createCallContext(binding.app_id!, 'RHSView', channelID);

    const handleBindingClickBound = async (binding: AppBinding) => {
        const res = await dispatch(handleBindingClick(binding, context, null)) as DoAppCallResult;

        if (res.error) {
            return res.error;
        }

        const callResp = res.data!;

        switch (callResp.type) {
        case AppCallResponseTypes.FORM:
            dispatch(openAppsModal(callResp.form!, context));
            break;
        case AppCallResponseTypes.OK:
            dispatch(postEphemeralCallResponseForChannel(callResp, callResp.text!, channelID));
            break;
        }

        return res.data;
    };

    const childProps = {
        app_id: binding.app_id!,
        binding,
        context,
        viewComponent: AppBindingView,
        handleBindingClick: handleBindingClickBound,
    };

    return (
        <AppBindingView
            {...childProps}
        />
    );
}
