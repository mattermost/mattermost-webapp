// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import SuggestionBox from 'components/suggestion/suggestion_box.jsx';
import SuggestionList from 'components/suggestion/suggestion_list.jsx';
import MenuActionProvider from 'components/suggestion/menu_action_provider';
import GenericUserProvider from 'components/suggestion/generic_user_provider.jsx';
import GenericChannelProvider from 'components/suggestion/generic_channel_provider.jsx';

export default class ActionMenu extends React.PureComponent {
    static propTypes = {
        postId: PropTypes.string.isRequired,
        action: PropTypes.object.isRequired,
        actions: PropTypes.shape({
            doPostAction: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        const action = props.action;
        if (action) {
            if (action.data_source === 'users') {
                this.providers = [new GenericUserProvider()];
            } else if (action.data_source === 'channels') {
                this.providers = [new GenericChannelProvider()];
            } else if (action.options) {
                this.providers = [new MenuActionProvider(action.options)];
            } else {
                this.providers = [];
            }
        } else {
            this.providers = [];
        }

        this.state = {
            selected: null,
            input: '',
        };
    }

    onChange = (e) => {
        this.setState({input: e.target.value, previousInput: ''});
    };

    handleSelected = (selected) => {
        if (!selected) {
            return;
        }

        let value = '';
        if (this.props.action.data_source === 'users' || this.props.action.data_source === 'channels') {
            value = selected.id;
        } else {
            value = selected.value;
        }

        this.props.actions.doPostAction(this.props.postId, this.props.action.id, value);

        if (this.suggestionRef) {
            requestAnimationFrame(() => this.suggestionRef.blur());
        }
    }

    setSuggestionRef = (ref) => {
        this.suggestionRef = ref;
    }

    onFocus = () => {
        this.setState({input: '', previousInput: this.state.input});
    }

    onBlur = () => {
        if (this.state.previousInput) {
            this.setState({input: this.state.previousInput, previousInput: ''});
        }
    }

    render() {
        const {action} = this.props;
        return (
            <SuggestionBox
                placeholder={action.name}
                ref={this.setSuggestionRef}
                listComponent={SuggestionList}
                className='form-control'
                containerClass={'post-attachment-dropdown'}
                value={this.state.input}
                onChange={this.onChange}
                onItemSelected={this.handleSelected}
                onFocus={this.onFocus}
                onBlur={this.onBlur}
                providers={this.providers}
                completeOnTab={true}
                renderDividers={false}
                renderNoResults={true}
                openOnFocus={true}
                openWhenEmpty={true}
                replaceAllInputOnSelect={true}
            />
        );
    }
}