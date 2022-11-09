// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useCallback, useState} from 'react';
import styled from 'styled-components';
import {FormattedMessage} from 'react-intl';
import {debounce} from 'lodash';

import {CloseIcon, MagnifyIcon} from '@mattermost/compass-icons/components';

import {ModalData} from 'types/actions';
import {UserProfile} from '@mattermost/types/users';
import {Group} from '@mattermost/types/groups';
import {ActionResult} from 'mattermost-redux/types/actions';

import * as Utils from 'utils/utils';
import Constants, {ModalIdentifiers} from 'utils/constants';

import Input from 'components/widgets/inputs/input/input';
import Popover from 'components/widgets/popover';
import ViewUserGroupModal from 'components/view_user_group_modal';
import UserGroupsModal from 'components/user_groups_modal';
import GroupMemberList from 'components/user_group_popover/group_member_list';

import './user_group_popover.scss';

export enum Load {
    DONE,
    LOADING,
    FAILED,
}

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
     * @internal
     */
    searchTerm: string;

    actions: {
        setPopoverSearchTerm: (term: string) => void;
        searchProfiles: (term: string, options: any) => Promise<ActionResult>;
        openModal: <P>(modalData: ModalData<P>) => void;
    };
}

const UserGroupPopover = (props: Props) => {
    const {
        group,
        actions,
        hide,
        searchTerm,
        showUserOverlay,
    } = props;

    const [searchState, setSearchState] = useState(Load.DONE);

    const doSearch = useCallback(debounce(async (term) => {
        const res = await actions.searchProfiles(term, {in_group_id: group.id});
        if (res.data) {
            setSearchState(Load.DONE);
        } else {
            setSearchState(Load.FAILED);
        }
    }, Constants.SEARCH_TIMEOUT_MILLISECONDS), [actions.searchProfiles]);

    useEffect(() => {
        // Unset the popover search term on mount and unmount
        // This is to prevent some odd rendering issues when quickly opening and closing popovers

        actions.setPopoverSearchTerm('');

        return () => {
            actions.setPopoverSearchTerm('');
        };
    }, []);

    useEffect(() => {
        if (searchTerm) {
            setSearchState(Load.LOADING);
            doSearch(searchTerm);
        } else {
            setSearchState(Load.DONE);
            doSearch.cancel();
        }
    }, [searchTerm, doSearch]);

    const openGroupsModal = () => {
        actions.openModal({
            modalId: ModalIdentifiers.USER_GROUPS,
            dialogType: UserGroupsModal,
            dialogProps: {
                backButtonAction: openGroupsModal,
            },
        });
    };

    const openViewGroupModal = () => {
        hide();
        actions.openModal({
            modalId: ModalIdentifiers.VIEW_USER_GROUP,
            dialogType: ViewUserGroupModal,
            dialogProps: {
                groupId: group.id,
                backButtonCallback: openGroupsModal,
                backButtonAction: openViewGroupModal,
            },
        });
    };

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        actions.setPopoverSearchTerm(event.target.value);
    };

    return (
        <Popover
            {...props}
            id='user-group-popover'
        >
            <Body role='dialog'>
                <Header>
                    <Heading>
                        <Title
                            className='overflow--ellipsis text-nowrap'
                        >
                            {group.display_name}
                        </Title>
                        <CloseButton
                            className='btn-icon'
                            aria-label={Utils.localizeMessage('user_group_popover.close', 'Close')}
                            onClick={hide}
                        >
                            <CloseIcon/>
                        </CloseButton>
                    </Heading>
                    <Subtitle>
                        <span className='overflow--ellipsis text-nowrap'>{'@'}{group.name}</span>
                        <Dot>{' • '}</Dot>
                        <FormattedMessage
                            id='user_group_popover.memberCount'
                            defaultMessage='{member_count} {member_count, plural, one {Member} other {Members}}'
                            values={{
                                member_count: group.member_count,
                            }}
                            tagName={NoShrink}
                        />
                    </Subtitle>
                    <HeaderButton
                        aria-label={Utils.localizeMessage('user_group_popover.openGroupModal', 'View full group info')}
                        onClick={openViewGroupModal}
                        className='user-group-popover_header-button'
                    />
                </Header>
                {group.member_count > 10 ? (
                    <SearchContainer>
                        <SearchBar
                            type='text'
                            className='user-group-popover_search-bar'
                            placeholder={Utils.localizeMessage('user_group_popover.searchGroupMembers', 'Search members')}
                            inputPrefix={<MagnifyIcon/>}
                            value={searchTerm}
                            onChange={handleSearch}
                            useLegend={false}
                        />
                    </SearchContainer>
                ) : null}
                <GroupMemberList
                    group={group}
                    hide={hide}
                    searchState={searchState}
                    showUserOverlay={showUserOverlay}
                />
            </Body>
        </Popover>);
};

const Body = styled.div`
    width: 264px;
`;

const Header = styled.div`
    padding: 16px 20px;
    position: relative;

    &:hover {
        background: rgba(var(--center-channel-color-rgb), 0.08);
    }
`;

const HeaderButton = styled.button`
    padding: 0;
    background: none;
    border: none;
    display: block;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
`;

const Title = styled.span`
    flex: 1 1 auto;
`;

const CloseButton = styled.button`
    width: 28px;
    height: 28px;
    flex: 0 0 auto;
    margin-left: 4px;
    display: flex;
    justify-content: center;
    align-items: center;

    /* Place this button above the main header button */
    z-index: 9;

    svg {
        width: 18px;
    }
`;

const Heading = styled.div`
    font-weight: 600;
    font-size: 16px;
    display: flex;
    align-items: center;
    font-family: 'Metropolis', sans-serif;
`;

const Subtitle = styled.div`
    font-size: 12px;
    color: rgba(var(--center-channel-color-rgb), 0.64);
    display: flex;
`;

const NoShrink = styled.span`
    flex: 0 0 auto;
`;

const Dot = styled(NoShrink)`
    padding: 0 6px;
`;

const SearchContainer = styled.div`
    margin: 4px 12px 12px 12px;
`;

const SearchBar = styled(Input)`
    height: 32px;

    .Input_wrapper {
        padding-left: 0;
        align-items: center;


        input {
            height: unset;
            font-size: 12px;
        }
    }

    svg {
        width: 18px;
        height: 18px;
        margin: 0 11px;
    }
`;

export default React.memo(UserGroupPopover);
