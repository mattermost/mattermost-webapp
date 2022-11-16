// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
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

import {GlobalState} from '../../../../../types/store';

const RenderedMention = (props: NodeViewProps) => {
    const {id} = props.node.attrs;
    const teammateNameDisplay = useSelector(getTeammateNameDisplaySetting);
    const user = useSelector((state: GlobalState) => getUser(state, id));
    const name = displayUsername(user, teammateNameDisplay, true);
    return (
        <NodeViewWrapper as={'span'}>
            {'@'}{name}
        </NodeViewWrapper>
    );
};

const AtMention = Mention.extend({
    name: WysiwygPluginNames.AT_MENTION_SUGGESTION,

    addNodeView() {
        return renderReactNodeView(RenderedMention);
    },
});

export * from './suggestion';

export default AtMention;
