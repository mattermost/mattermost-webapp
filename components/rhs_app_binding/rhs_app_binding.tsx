// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useIntl} from 'react-intl';

import {AppCallResponseTypes} from 'mattermost-redux/constants/apps';
import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/common';

import {DoAppCallResult} from 'types/apps';

import {showRHSAppBinding} from 'actions/views/rhs';
import {handleBindingClick, openAppsModal} from 'actions/apps';
import {getRhsAppBinding} from 'selectors/rhs';
import {createCallContext} from 'utils/apps';

import SearchResultsHeader from 'components/search_results_header';

import {AppBinding} from '@mattermost/types/apps';

import {AppBindingView} from './view';
import {lookForBindingLocation, treeReplace} from './partial_refresh';

import './rhs_app_binding_styles.scss';

export default function RhsAppBinding() {
    const binding = useSelector(getRhsAppBinding);
    const dispatch = useDispatch();

    const setRhsBinding = useCallback((binding: AppBinding) => {
        dispatch(showRHSAppBinding(binding));
    }, [dispatch]);

    let view = <h3>{'Loading'}</h3>;
    if (binding) {
        view = (
            <RhsAppBindingInner
                tree={binding}
                setRhsBinding={setRhsBinding}
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

type RhsAppBindingInnerProps = {
    tree: AppBinding;
    setRhsBinding: (binding: AppBinding) => void;
}

export function RhsAppBindingInner(props: RhsAppBindingInnerProps) {
    const {tree, setRhsBinding} = props;
    const intl = useIntl();

    const dispatch = useDispatch();
    const channelID = useSelector(getCurrentChannelId);
    const context = createCallContext(tree.app_id!, 'RHSView', channelID);

    const handleBindingClickBound = useCallback(async (binding: AppBinding) => {
        const res = await dispatch(handleBindingClick(binding, context, intl)) as DoAppCallResult;

        const err = alert;

        if (res.error) {
            err(res.error.text);
            return res.error;
        }

        const callResp = res.data!;

        switch (callResp.type) {
        case AppCallResponseTypes.FORM:
            dispatch(openAppsModal(callResp.form!, context));
            break;
        case AppCallResponseTypes.OK:
            err(callResp.text);
            break;
        case AppCallResponseTypes.VIEW: {
            const newBlock = callResp.data as AppBinding | undefined;
            if (!newBlock) {
                err('No new block provided for call response type view');
                break;
            }

            if (!newBlock.location) {
                err('No location provided on new block for call response type view');
                break;
            }

            const existingBindingPath = lookForBindingLocation(tree, newBlock.location, []);
            if (existingBindingPath) {
                const newTree = treeReplace(tree, newBlock, existingBindingPath);
                setRhsBinding(newTree);
            } else {
                err('No binding found in tree for location ' + newBlock.location);
            }
            break;
        }
        }

        return res.data;
    }, [setRhsBinding]);

    const childProps = {
        app_id: tree.app_id!,
        tree,
        context,
        viewComponent: AppBindingView,
        handleBindingClick: handleBindingClickBound,
    };

    return (
        <AppBindingView
            {...childProps}
            binding={tree}
        />
    );
}
