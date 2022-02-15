// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import {Group} from 'mattermost-redux/types/groups';
import {UserProfile} from 'mattermost-redux/types/users';

import Avatar from 'components/widgets/users/avatar';
import * as Utils from 'utils/utils.jsx';
import LocalizedIcon from 'components/localized_icon';
import {t} from 'utils/i18n';
import {ActionResult} from 'mattermost-redux/types/actions';

export type Props = {
    groupId: string;
    user: UserProfile;
    group: Group;
    decrementMemberCount: () => void;
    permissionToLeaveGroup: boolean;
    actions: {
        removeUsersFromGroup: (groupId: string, userIds: string[]) => Promise<ActionResult>;
    };
}

const ViewUserGroupListItem = (props: Props) => {
    const {
        user,
        group,
    } = props;

    const removeUserFromGroup = async (userId: string) => {
        const {groupId, actions, decrementMemberCount} = props;

        await actions.removeUsersFromGroup(groupId, [userId]).then((data) => {
            if (!data.error) {
                decrementMemberCount();
            }
        });
    };

    return (
        <div
            key={user.id}
            className='group-member-row'
        >
            <>
                <Avatar
                    username={user.username}
                    size={'sm'}
                    url={Utils.imageURLForUser(user?.id ?? '')}
                    className={'avatar-post-preview'}
                />
            </>
            <div className='group-member-name'>
                {Utils.getFullName(user)}
            </div>
            <div className='group-member-username'>
                {`@${user.username}`}
            </div>
            {
                (group.source.toLowerCase() !== 'ldap' && props.permissionToLeaveGroup) &&
                <button
                    type='button'
                    className='remove-group-member btn-icon'
                    aria-label='Close'
                    onClick={() => {
                        removeUserFromGroup(user.id);
                    }}
                >
                    <LocalizedIcon
                        className='icon icon-trash-can-outline'
                        ariaLabel={{id: t('user_groups_modal.goBackLabel'), defaultMessage: 'Back'}}
                    />
                </button>
            }
        </div>
    );
};

export default ViewUserGroupListItem;
