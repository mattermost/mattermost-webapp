// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {showRHSAppBinding} from 'actions/views/rhs';
import {getRhsAppBinding} from 'selectors/rhs';

import SearchResultsHeader from 'components/search_results_header';
import {AppsView} from 'components/apps_view/apps_view';

import {AppBinding} from '@mattermost/types/apps';

export default function RhsAppBinding() {
    const binding = useSelector(getRhsAppBinding);
    const dispatch = useDispatch();

    const setRhsBinding = useCallback((binding: AppBinding) => {
        dispatch(showRHSAppBinding(binding));
    }, [dispatch]);

    let view = <h3>{'Loading'}</h3>;
    if (binding) {
        view = (
            <AppsView
                tree={binding}
                setTree={setRhsBinding}
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
