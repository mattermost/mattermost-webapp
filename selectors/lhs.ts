// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createSelector} from 'reselect';
import {GlobalState} from 'types/store';
import {StaticPage} from 'types/store/lhs';
import {makeGetDraftsCount} from 'selectors/drafts';
import {
    insightsAreEnabled,
    isCollapsedThreadsEnabled,
    localDraftsAreEnabled,
} from 'mattermost-redux/selectors/entities/preferences';

export function getIsLhsOpen(state: GlobalState): boolean {
    return state.views.lhs.isOpen;
}

export function getCurrentStaticPageId(state: GlobalState): string {
    return state.views.lhs.currentStaticPageId;
}

export const getDraftsCount = makeGetDraftsCount();

export const getVisibleStaticPages = createSelector(
    'getVisibleSidebarStaticPages',
    (state: GlobalState) => {
        const pages: StaticPage[] = [];

        if (insightsAreEnabled(state)) {
            pages.push({
                id: 'activity-and-insights',
                isVisible: true,
            });
        }

        if (isCollapsedThreadsEnabled(state)) {
            pages.push({
                id: 'threads',
                isVisible: true,
            });
        }

        if (localDraftsAreEnabled(state)) {
            pages.push({
                id: 'drafts',
                isVisible: false,
            });
        }

        return pages;
    },
    (state: GlobalState) => getDraftsCount(state),
    (staticPages, draftsCount) => {
        return staticPages.map((page) => {
            if (page.id === 'drafts') {
                return {
                    ...page,
                    isVisible: draftsCount > 0,
                };
            }
            return page;
        }).filter((item) => item.isVisible);
    },
);
