// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useEffect, useState, useRef} from 'react';
import styled, {css} from 'styled-components';
import AutoSizer from 'react-virtualized-auto-sizer';
import {VariableSizeList, ListChildComponentProps} from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import {useIntl} from 'react-intl';

import {SendIcon} from '@mattermost/compass-icons/components';

import {UserProfile} from '@mattermost/types/users';
import {Group} from '@mattermost/types/groups';
import {ServerError} from '@mattermost/types/errors';

import {browserHistory} from 'utils/browser_history';
import * as Utils from 'utils/utils';
import {displayUsername} from 'mattermost-redux/utils/user_utils';

import Avatar from 'components/widgets/users/avatar';
import LoadingSpinner from 'components/widgets/loading/loading_spinner';
import SimpleTooltip from 'components/widgets/simple_tooltip';
import NoResultsIndicator from 'components/no_results_indicator';
import {NoResultsVariant} from 'components/no_results_indicator/types';

const USERS_PER_PAGE = 60;

// These constants must be changed if user list style is modified
export const VIEWPORT_SCALE_FACTOR = 0.4;
const ITEM_HEIGHT = 40;
const MARGIN = 8;
const getItemHeight = (isCap: boolean) => (isCap ? ITEM_HEIGHT + MARGIN : ITEM_HEIGHT);
export const getListHeight = (num: number) => (num * ITEM_HEIGHT) + (2 * MARGIN);

// Reasonable extrema for the user list
const MIN_LIST_HEIGHT = 120;
export const MAX_LIST_HEIGHT = 800;

export type Props = {

    /**
     * The group corresponding to the parent popover
     */
    group: Group;

    /**
     * Function to call if parent popover should be hidden
     */
    hide: () => void;

    /**
     * Function to call to show a profile popover and hide parent popover
     */
    showUserOverlay: (user: UserProfile) => void;

    /**
     * State of current search
     */
    isSearchLoading: boolean;

    /**
     * @internal
     */
    users: UserProfile[];
    nameDisplaySetting: string;
    teamUrl: string;
    searchTerm: string;

    actions: {
        getUsersInGroup: (groupId: string, page: number, perPage: number) => Promise<{ data: UserProfile[] }>;
        openDirectChannelToUserId: (userId?: string) => Promise<{ error: ServerError }>;
        closeRightHandSide: () => void;
    };
}

const GroupMemberList = (props: Props) => {
    const {
        group,
        actions,
        users,
        nameDisplaySetting,
        hide,
        teamUrl,
        searchTerm,
        isSearchLoading,
        showUserOverlay,
    } = props;

    const {formatMessage} = useIntl();

    const [nextPage, setNextPage] = useState(Math.floor(users.length / USERS_PER_PAGE));
    const [isNextPageLoading, setIsNextPageLoading] = useState(false);
    const [isDMLoading, setIsDMLoading] = useState<string | undefined>(undefined);

    const infiniteLoaderRef = useRef<InfiniteLoader | null>(null);
    const variableSizeListRef = useRef<VariableSizeList | null>(null);
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        if (hasMounted) {
            if (infiniteLoaderRef.current) {
                infiniteLoaderRef.current.resetloadMoreItemsCache();
            }
            if (variableSizeListRef.current) {
                variableSizeListRef.current.resetAfterIndex(0);
            }
        }
        setHasMounted(true);
    }, [users.length, hasMounted]);

    const loadNextPage = async () => {
        setIsNextPageLoading(true);
        const res = await actions.getUsersInGroup(group.id, nextPage, USERS_PER_PAGE);
        if (res.data) {
            setNextPage(nextPage + 1);
        }
        setIsNextPageLoading(false);
    };

    const showDirectChannel = (user: UserProfile) => {
        if (isDMLoading !== undefined) {
            return;
        }
        setIsDMLoading(user.id);
        actions.openDirectChannelToUserId(user.id).then((result: { error: ServerError }) => {
            if (!result.error) {
                actions.closeRightHandSide();
                setIsDMLoading(undefined);
                hide?.();
                browserHistory.push(`${teamUrl}/messages/@${user.username}`);
            }
        });
    };

    const isSearching = searchTerm !== '';
    const hasNextPage = !isSearching && users.length < group.member_count;
    const itemCount = !isSearching && hasNextPage ? users.length + 1 : users.length;

    const loadMoreItems = isSearching || isNextPageLoading ? () => {} : loadNextPage;

    const maxListHeight = Math.min(MAX_LIST_HEIGHT, Math.max(MIN_LIST_HEIGHT, Utils.getViewportSize().h * VIEWPORT_SCALE_FACTOR));

    const isUserLoaded = (index: number) => {
        return isSearching || !hasNextPage || index < users.length;
    };

    const Item = ({index, style}: ListChildComponentProps) => {
        // Remove explicit height provided by VariableSizeList
        style.height = undefined;

        if (isUserLoaded(index)) {
            const user = users[index];
            const name = displayUsername(user, nameDisplaySetting);
            return (
                <UserListItem
                    first={index === 0}
                    last={index === group.member_count - 1}
                    style={style}
                    key={user.id}
                    role='listitem'
                >
                    <User
                        tabIndex={0}
                        role='button'
                        onClick={() => showUserOverlay(user)}
                    >
                        <Avatar
                            username={user.username}
                            size={'sm'}
                            url={Utils.imageURLForUser(user?.id ?? '')}
                            className={'avatar-post-preview'}
                            tabIndex={-1}
                        />
                        <Username className='overflow--ellipsis text-nowrap'>{name}</Username>
                        <SimpleTooltip
                            id={`name-${user.id}`}
                            content={formatMessage({id: 'group_member_list.sendMessageTooltip', defaultMessage: 'Send message'})}
                        >
                            <DMButton
                                className='btn-icon'
                                aria-label={formatMessage(
                                    {id: 'group_member_list.sendMessageButton', defaultMessage: 'Send message to {user}'},
                                    {user: name})}
                                onClick={() => showDirectChannel(user)}
                            >
                                <SendIcon/>
                            </DMButton>
                        </SimpleTooltip>
                    </User>
                </UserListItem>
            );
        }

        return (
            <LoadingItem style={style}>
                <LoadingSpinner/>
            </LoadingItem>
        );
    };

    const renderContent = () => {
        if (isSearchLoading) {
            return (
                <LargeLoadingItem>
                    <LoadingSpinner/>
                </LargeLoadingItem>
            );
        } else if (isSearching && users.length === 0) {
            return (
                <NoResultsItem>
                    <NoResultsIndicator
                        variant={NoResultsVariant.ChannelSearch}
                        titleValues={{channelName: `"${searchTerm}"`}}
                    />
                </NoResultsItem>
            );
        }
        return (<AutoSizer>
            {({height, width}) => (
                <InfiniteLoader
                    ref={infiniteLoaderRef}
                    isItemLoaded={isUserLoaded}
                    itemCount={itemCount}
                    loadMoreItems={loadMoreItems}
                    threshold={5}
                >
                    {({onItemsRendered, ref}) => (
                        <VariableSizeList
                            itemCount={itemCount}
                            onItemsRendered={onItemsRendered}
                            ref={ref}
                            itemSize={(index) => getItemHeight(index === 0 || index === group.member_count - 1)}
                            height={height}
                            width={width}
                        >
                            {Item}
                        </VariableSizeList>)}
                </InfiniteLoader>
            )}
        </AutoSizer>);
    };

    return (
        <UserList
            style={{height: Math.min(maxListHeight, getListHeight(group.member_count))}}
            role='list'
        >
            {renderContent()}
        </UserList>
    );
};

const UserList = styled.div`
    display: flex;
    padding: 0;
    margin: 0;
    border-top: 1px solid rgba(var(--center-channel-color-rgb), 0.16);
    box-sizing: content-box;
`;

const UserListItem = styled.div<{first?: boolean; last?: boolean}>`
    ${(props) => props.first && css `
        margin-top: ${MARGIN}px;
    `}

    ${(props) => props.last && css `
        margin-bottom: ${MARGIN}px;
    `}
`;

const LoadingItem = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: ${ITEM_HEIGHT}px;
    padding-bottom: 8px;
`;

const LargeLoadingItem = styled.div`
    display: flex;
    align-self: stretch;
    justify-content: center;
    align-items: center;
    width: 100%;
`;

const NoResultsItem = styled.div`
    align-self: stretch;
    overflow-y: scroll;
    overflow-y: overlay;
`;

const User = styled.div`
    display: flex;
    padding: 8px 20px;

    &:hover {
        background: rgba(var(--center-channel-color-rgb), 0.08);
    }

    button {
        display: none;
    }

    &:hover button {
        display: initial;
    }

    &:focus-within button {
        display: initial;
    }
`;

const Username = styled.span`
    padding-left: 12px;
    flex: 1 1 auto;
`;

const DMButton = styled.button`
    width: 24px;
    height: 24px;
    flex: 0 0 auto;
    margin-left: 4px;

    svg {
        width: 16px;
    }
`;

export default React.memo(GroupMemberList);
