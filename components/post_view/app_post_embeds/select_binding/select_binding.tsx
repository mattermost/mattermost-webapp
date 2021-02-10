// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {ActionResult} from 'mattermost-redux/types/actions';

import {Post} from 'mattermost-redux/types/posts';

import {AppBinding, AppCall} from 'mattermost-redux/types/apps';

import {AppBindingLocations, AppExpandLevels} from 'mattermost-redux/constants/apps';

import MenuActionProvider from 'components/suggestion/menu_action_provider';
import AutocompleteSelector from 'components/autocomplete_selector';
import PostContext from 'components/post_view/post_context';

type Option = {
    text: string;
    value: string;
};

type Props = {
    post: Post;
    binding: AppBinding;
    userId: string;
    actions: {
        doAppCall: (call: AppCall) => Promise<ActionResult>;
    };
};

type State = {
    selected?: Option;
};

export default class SelectBinding extends React.PureComponent<Props, State> {
    private providers: MenuActionProvider[];

    constructor(props: Props) {
        super(props);

        const binding = props.binding;
        this.providers = [];
        if (binding.bindings) {
            const options = binding.bindings.map((b) => {
                return {text: b.label, value: b.location};
            });
            this.providers = [new MenuActionProvider(options)];
        }

        this.state = {};
    }

    handleSelected = (selected: Option) => {
        if (!selected) {
            return;
        }

        this.setState({selected});
        const binding = this.props.binding.bindings?.find((b) => b.location === selected.value);
        if (!binding) {
            // TODO Error?
            return;
        }

        const {userId, post} = this.props;

        const call: AppCall = {
            url: binding.call?.url || '',
            expand: {
                post: AppExpandLevels.EXPAND_ALL,
            },
            context: {
                ...binding.call?.context,
                acting_user_id: userId,
                app_id: binding.app_id,
                channel_id: post.channel_id,
                location: AppBindingLocations.IN_POST + '/' + binding.location,
                post_id: post.id,
                user_id: userId,
            },
        };
        this.props.actions.doAppCall(call);
    }

    render() {
        const {binding} = this.props;

        return (
            <PostContext.Consumer>
                {({handlePopupOpened}) => (
                    <AutocompleteSelector
                        providers={this.providers}
                        onSelected={this.handleSelected}
                        placeholder={binding.label}
                        inputClassName='post-attachment-dropdown'
                        value={this.state.selected?.text}
                        toggleFocus={handlePopupOpened}
                    />
                )}
            </PostContext.Consumer>
        );
    }
}
