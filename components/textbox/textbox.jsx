// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import AutosizeTextarea from 'components/autosize_textarea.jsx';
import PostMarkdown from 'components/post_markdown';
import AtMentionProvider from 'components/suggestion/at_mention_provider';
import ChannelMentionProvider from 'components/suggestion/channel_mention_provider.jsx';
import CommandProvider from 'components/suggestion/command_provider.jsx';
import EmoticonProvider from 'components/suggestion/emoticon_provider.jsx';
import SuggestionBox from 'components/suggestion/suggestion_box.jsx';
import SuggestionList from 'components/suggestion/suggestion_list.jsx';
import * as Utils from 'utils/utils.jsx';

export default class Textbox extends React.Component {
    static propTypes = {
        id: PropTypes.string.isRequired,
        channelId: PropTypes.string,
        value: PropTypes.string.isRequired,
        onChange: PropTypes.func.isRequired,
        onKeyPress: PropTypes.func.isRequired,
        onComposition: PropTypes.func,
        onHeightChange: PropTypes.func,
        createMessage: PropTypes.string.isRequired,
        onKeyDown: PropTypes.func,
        onBlur: PropTypes.func,
        supportsCommands: PropTypes.bool.isRequired,
        handlePostError: PropTypes.func,
        suggestionListStyle: PropTypes.string,
        emojiEnabled: PropTypes.bool,
        isRHS: PropTypes.bool,
        characterLimit: PropTypes.number.isRequired,
        disabled: PropTypes.bool,
        badConnection: PropTypes.bool,
        listenForMentionKeyClick: PropTypes.bool,
        currentUserId: PropTypes.string.isRequired,
        preview: PropTypes.bool,
        profilesInChannel: PropTypes.arrayOf(PropTypes.object).isRequired,
        profilesNotInChannel: PropTypes.arrayOf(PropTypes.object).isRequired,
        actions: PropTypes.shape({
            autocompleteUsersInChannel: PropTypes.func.isRequired,
            scrollPostList: PropTypes.func.isRequired,
        }),
    };

    static defaultProps = {
        supportsCommands: true,
        isRHS: false,
        listenForMentionKeyClick: false,
    };

    constructor(props) {
        super(props);

        this.suggestionProviders = [
            new AtMentionProvider({
                currentUserId: this.props.currentUserId,
                profilesInChannel: this.props.profilesInChannel,
                profilesNotInChannel: this.props.profilesNotInChannel,
                autocompleteUsersInChannel: (prefix) => this.props.actions.autocompleteUsersInChannel(prefix, props.channelId),
            }),
            new ChannelMentionProvider(),
            new EmoticonProvider(),
        ];

        if (props.supportsCommands) {
            this.suggestionProviders.push(new CommandProvider());
        }

        this.checkMessageLength(props.value);
    }

    handleChange = (e) => {
        this.props.onChange(e);
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.preview && this.props.preview) {
            this.refs.preview.focus();
        }
    }

    checkMessageLength = (message) => {
        if (this.props.handlePostError) {
            if (message.length > this.props.characterLimit) {
                const errorMessage = (
                    <FormattedMessage
                        id='create_post.error_message'
                        defaultMessage='Your message is too long. Character count: {length}/{limit}'
                        values={{
                            length: message.length,
                            limit: this.props.characterLimit,
                        }}
                    />);
                this.props.handlePostError(errorMessage);
            } else {
                this.props.handlePostError(null);
            }
        }
    }

    handleKeyDown = (e) => {
        if (this.props.onKeyDown) {
            this.props.onKeyDown(e);
        }
    }

    handleBlur = (e) => {
        if (this.props.onBlur) {
            this.props.onBlur(e);
        }
    }

    handleHeightChange = (height, maxHeight) => {
        if (this.props.onHeightChange) {
            this.props.onHeightChange(height, maxHeight);
        }
        if (Utils.disableVirtList()) {
            this.props.actions.scrollPostList();
        }
    }

    focus = () => {
        const textbox = this.refs.message.getTextbox();

        textbox.focus();
        Utils.placeCaretAtEnd(textbox);

        // reset character count warning
        this.checkMessageLength(textbox.value);
    }

    blur = () => {
        const textbox = this.refs.message.getTextbox();
        textbox.blur();
    };

    recalculateSize = () => {
        this.refs.message.recalculateSize();
    }

    UNSAFE_componentWillReceiveProps(nextProps) { // eslint-disable-line camelcase
        if (nextProps.channelId !== this.props.channelId ||
            nextProps.currentUserId !== this.props.currentUserId ||
            nextProps.profilesInChannel !== this.props.profilesInChannel ||
            nextProps.profilesNotInChannel !== this.props.profilesNotInChannel) {
            // Update channel id for AtMentionProvider.
            const providers = this.suggestionProviders;
            for (let i = 0; i < providers.length; i++) {
                if (providers[i] instanceof AtMentionProvider) {
                    providers[i].setProps({
                        currentUserId: nextProps.currentUserId,
                        profilesInChannel: nextProps.profilesInChannel,
                        profilesNotInChannel: nextProps.profilesNotInChannel,
                        autocompleteUsersInChannel: (prefix) => nextProps.actions.autocompleteUsersInChannel(prefix, nextProps.channelId),
                    });
                }
            }
        }
        if (this.props.value !== nextProps.value) {
            this.checkMessageLength(nextProps.value);
        }
    }

    render() {
        let preview = null;

        let textboxClassName = 'form-control custom-textarea';
        let textWrapperClass = 'textarea-wrapper';
        if (this.props.emojiEnabled) {
            textboxClassName += ' custom-textarea--emoji-picker';
        }
        if (this.props.badConnection) {
            textboxClassName += ' bad-connection';
        }
        if (this.props.preview) {
            textboxClassName += ' custom-textarea--preview';
            textWrapperClass += ' textarea-wrapper--preview';

            preview = (
                <div
                    tabIndex='0'
                    ref='preview'
                    className='form-control custom-textarea textbox-preview-area'
                    onKeyPress={this.props.onKeyPress}
                    onKeyDown={this.handleKeyDown}
                    onBlur={this.handleBlur}
                >
                    <PostMarkdown
                        isRHS={this.props.isRHS}
                        message={this.props.value}
                    />
                </div>
            );
        }

        return (
            <div
                ref='wrapper'
                className={textWrapperClass}
            >
                <SuggestionBox
                    id={this.props.id}
                    ref='message'
                    className={textboxClassName}
                    spellCheck='true'
                    placeholder={this.props.createMessage}
                    onChange={this.handleChange}
                    onKeyPress={this.props.onKeyPress}
                    onKeyDown={this.handleKeyDown}
                    onComposition={this.props.onComposition}
                    onBlur={this.handleBlur}
                    onHeightChange={this.handleHeightChange}
                    style={{visibility: this.props.preview ? 'hidden' : 'visible'}}
                    inputComponent={AutosizeTextarea}
                    listComponent={SuggestionList}
                    listStyle={this.props.suggestionListStyle}
                    providers={this.suggestionProviders}
                    channelId={this.props.channelId}
                    value={this.props.value}
                    renderDividers={true}
                    isRHS={this.props.isRHS}
                    disabled={this.props.disabled}
                    contextId={this.props.channelId}
                    listenForMentionKeyClick={this.props.listenForMentionKeyClick}
                />
                {preview}
            </div>
        );
    }
}
