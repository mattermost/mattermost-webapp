// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {ReactRenderer} from '@tiptap/react';
import {SuggestionOptions} from '@tiptap/suggestion';

import SuggestionList, {SuggestionItem, SuggestionListProps, SuggestionListRef} from './suggestion-list';

export const render: Omit<SuggestionOptions<SuggestionItem>, 'editor'>['render'] = () => {
    let reactRenderer: ReactRenderer<SuggestionListRef>;
    let savedProps: SuggestionListProps;

    return {
        onStart: (props) => {
            savedProps = {
                ...props,
                visible: true,
                renderSeparators: true,
            };
            reactRenderer = new ReactRenderer(SuggestionList, {
                props: savedProps,
                editor: props.editor,
            });
        },

        onUpdate(props) {
            savedProps = {...savedProps, ...props};
            reactRenderer?.updateProps(savedProps);
        },

        onKeyDown(props) {
            if (props.event.key === 'Escape') {
                savedProps = {...savedProps, visible: false};
                reactRenderer?.updateProps(savedProps);
                return true;
            }
            return reactRenderer?.ref?.onKeyDown(props) || false;
        },

        onExit() {
            reactRenderer?.destroy();
        },
    };
};
