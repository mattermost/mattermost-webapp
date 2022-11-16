// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getGroup} from 'mattermost-redux/selectors/entities/groups';

// See LICENSE.txt for license information.
import React from 'react';
import {useSelector} from 'react-redux';

import {NodeViewProps} from '@tiptap/core/src/types';
import {Mention} from '@tiptap/extension-mention';
import {NodeViewWrapper, ReactNodeViewRenderer as renderReactNodeView} from '@tiptap/react';
import {getTeammateNameDisplaySetting} from 'mattermost-redux/selectors/entities/preferences';
import {getUser} from 'mattermost-redux/selectors/entities/users';
import {displayUsername} from 'mattermost-redux/utils/user_utils';

import {WysiwygPluginNames} from 'utils/constants';

import {Group} from '@mattermost/types/groups';

import {UserProfile} from '@mattermost/types/users';

import {GlobalState} from '../../../../../types/store';

const RenderedUserMention = ({userId}: { userId: UserProfile['id'] }) => {
    const teammateNameDisplay = useSelector(getTeammateNameDisplaySetting);
    const user = useSelector((state: GlobalState) => getUser(state, userId));
    const name = displayUsername(user, teammateNameDisplay, true);
    return (
        <NodeViewWrapper
            as={'span'}
            data-mention-id={userId}
            data-mention-type={'user'}
        >
            {'@'}{name}
        </NodeViewWrapper>
    );
};

const RenderedGroupMention = ({groupId}: { groupId: Group['id'] }) => {
    const {display_name: name} = useSelector((state: GlobalState) => getGroup(state, groupId));
    return (
        <NodeViewWrapper
            as={'span'}
            data-mention-id={groupId}
            data-mention-type={'groups'}
        >
            {'@'}{name}
        </NodeViewWrapper>
    );
};

const RenderedMention = (props: NodeViewProps) => {
    const {id, type} = props.node.attrs;

    if (type === 'user') {
        return <RenderedUserMention userId={id}/>;
    }

    if (type === 'groups') {
        return <RenderedGroupMention groupId={id}/>;
    }

    return (
        <NodeViewWrapper
            as={'span'}
            data-mention-id={id}
            data-mention-type={'special'}
        >
            {'@'}{id}
        </NodeViewWrapper>
    );
};

const AtMention = Mention.extend({
    name: WysiwygPluginNames.AT_MENTION_SUGGESTION,

    addNodeView() {
        return renderReactNodeView(RenderedMention);
    },

    addAttributes() {
        return {
            id: {
                default: null,
                parseHTML: (element) => element.getAttribute('data-mention-id'),
            },
            type: {
                default: null,
                parseHTML: (element) => element.getAttribute('data-mention-type'),
            },
        };
    },
});

export * from './suggestion';

export default AtMention;
