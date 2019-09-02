// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import MenuActionProvider from 'components/suggestion/menu_action_provider';
import GenericUserProvider from 'components/suggestion/generic_user_provider.jsx';
import GenericChannelProvider from 'components/suggestion/generic_channel_provider.jsx';
import AutocompleteSelector from 'components/autocomplete_selector';

export default class ActionMenu extends React.PureComponent {
    static propTypes = {
        postId: PropTypes.string.isRequired,
        action: PropTypes.object.isRequired,
        selected: PropTypes.object,
        actions: PropTypes.shape({
            selectAttachmentMenuAction: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        const action = props.action;
        this.providers = [];
        if (action) {
            if (action.data_source === 'users') {
                this.providers = [new GenericUserProvider()];
            } else if (action.data_source === 'channels') {
                this.providers = [new GenericChannelProvider()];
            } else if (action.options) {
                this.providers = [new MenuActionProvider(action.options)];
            }
        }

        let selected;
        let value = '';

        if (action.default_option && action.options) {
            selected = action.options.find((option) => option.value === action.default_option);
            value = selected ? selected.text : '';
        }

        this.state = {
            selected,
            value,
        };
    }

    static getDerivedStateFromProps(props, state) {
        if (props.selected && props.selected !== state.selected) {
            return {
                value: props.selected.text,
                selected: props.selected,
            };
        }

        return null;
    }

    handleSelected = (selected) => {
        if (!selected) {
            return;
        }

        const {action} = this.props;

        let value = '';
        let text = '';
        if (action.data_source === 'users') {
            text = selected.username;
            value = selected.id;
        } else if (action.data_source === 'channels') {
            text = selected.display_name;
            value = selected.id;
        } else {
            text = selected.text;
            value = selected.value;
        }

        this.props.actions.selectAttachmentMenuAction(this.props.postId, this.props.action.id, this.props.action.cookie, this.props.action.data_source, text, value);

        this.setState({value: text});
    }

    render() {
        const {action} = this.props;

        return (
            <AutocompleteSelector
                providers={this.providers}
                onSelected={this.handleSelected}
                placeholder={action.name}
                inputClassName='post-attachment-dropdown'
                value={this.state.value}
            />
        );
    }
}
