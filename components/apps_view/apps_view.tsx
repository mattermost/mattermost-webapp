// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useIntl} from 'react-intl';

import {AppCallResponseTypes} from 'mattermost-redux/constants/apps';
import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/common';

import {DoAppCallResult} from 'types/apps';

import {handleBindingClick, openAppsModal} from 'actions/apps';
import {createCallContext} from 'utils/apps';

import {AppBinding} from '@mattermost/types/apps';

import {AppsViewBlockFactory} from './apps_view_block';
import {lookForBindingLocation, treeReplace} from './partial_refresh';

import './apps_view_styles.scss';

export type AppsViewProps = {
    location: string;
    tree: AppBinding;
    setTree: (binding: AppBinding) => void;
}

export function AppsView(props: AppsViewProps) {
    const {tree, setTree} = props;
    const intl = useIntl();

    const dispatch = useDispatch();
    const channelID = useSelector(getCurrentChannelId);
    const context = createCallContext(tree.app_id!, props.location, channelID);

    const handleBindingClickBound = useCallback(async (binding: AppBinding) => {
        const res = await dispatch(handleBindingClick(binding, context, intl)) as DoAppCallResult;

        const err = (s: string) => {
            // eslint-disable-next-line no-console
            console.error(s);
        };

        if (res.error) {
            err(res.error.text!);
            return res.error;
        }

        const callResp = res.data!;

        switch (callResp.type) {
        case AppCallResponseTypes.FORM:
            dispatch(openAppsModal(callResp.form!, context));
            break;
        case AppCallResponseTypes.OK:
            err(callResp.text!);
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
                setTree(newTree);
            } else {
                err('No binding found in tree for location ' + newBlock.location);
            }
            break;
        }
        }

        return res.data;
    }, [setTree, context, dispatch, intl, tree]);

    const childProps = {
        app_id: tree.app_id!,
        tree,
        context,
        viewComponent: AppsViewBlockFactory,
        handleBindingClick: handleBindingClickBound,
    };

    return (
        <AppsViewBlockFactory
            {...childProps}
            binding={tree}
        />
    );
}
