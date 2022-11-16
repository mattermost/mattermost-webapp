// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {Mention} from '@tiptap/extension-mention';
import {ReactNodeViewRenderer as renderReactNodeView} from '@tiptap/react';

import {WysiwygPluginNames} from 'utils/constants';

import {RenderedMention} from './components';

const AtMention = Mention.extend({
    name: WysiwygPluginNames.AT_MENTION_SUGGESTION,

    addNodeView() {
        return renderReactNodeView(RenderedMention);
    },
});

export * from './suggestion';

export default AtMention;
