// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import {FormattedMessage} from 'react-intl';

import SuggestionBox from 'components/suggestion/suggestion_box.jsx';
import SuggestionList from 'components/suggestion/suggestion_list.jsx';
import MenuActionProvider from 'components/suggestion/menu_action_provider';
import GenericUserProvider from 'components/suggestion/generic_user_provider.jsx';
import GenericChannelProvider from 'components/suggestion/generic_channel_provider.jsx';

export default class ActionMenu extends React.PureComponent {
    static propTypes = {
        postId: PropTypes.string.isRequired,
        action: PropTypes.object.isRequired,
        selected: PropTypes.object,
        actions: PropTypes.shape({
            doPostAction: PropTypes.func.isRequired,
            selectAttachmentMenuAction: PropTypes.func.isRequired,
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
            input: '',
        };
    }

    static getDerivedStateFromProps(props, state) {
        if (props.selected && props.selected !== state.selected) {
            return {
                input: props.selected.displayText,
                selected: props.selected,
            };
        }

        return null;
    }

    onChange = (e) => {
        this.setState({input: e.target.value, previousInput: ''});
    };

    handleSelected = (selected) => {
        if (!selected) {
            return;
        }

        const {action} = this.props;

        let value = '';
        let displayText = '';
        if (action.data_source === 'users') {
            displayText = selected.username;
            value = selected.id;
        } else if (action.data_source === 'channels') {
            displayText = selected.display_name;
            value = selected.id;
        } else {
            displayText = selected.text;
            value = selected.value;
        }

        this.props.actions.selectAttachmentMenuAction(this.props.postId, this.props.action.id, this.props.action.data_source, displayText, value);

        requestAnimationFrame(() => {
            if (this.suggestionRef) {
                this.suggestionRef.blur();
            }
        });
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

        let submitted;
        if (this.props.selected) {
            submitted = (
                <div className='alert alert-success'>
                    <i className='fa fa-check margin-right margin-right--half'/>
                    <FormattedMessage
                        id='action_menu.submitted'
                        defaultMessage='Submitted'
                    />
                </div>
            );
        }

        return (
            <div>
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
                {submitted}
            </div>
        );
    }
}