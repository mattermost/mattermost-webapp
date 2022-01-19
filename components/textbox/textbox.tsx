// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ChangeEvent, ElementType, FocusEvent, KeyboardEvent, MouseEvent} from 'react';
import {FormattedMessage} from 'react-intl';

import {Channel} from 'mattermost-redux/types/channels';
import {ActionResult} from 'mattermost-redux/types/actions';
import {UserProfile} from 'mattermost-redux/types/users';

import AutosizeTextarea from 'components/autosize_textarea';
import PostMarkdown from 'components/post_markdown';
import Provider from 'components/suggestion/provider';
import AtMentionProvider from 'components/suggestion/at_mention_provider';
import ChannelMentionProvider from 'components/suggestion/channel_mention_provider.jsx';
import AppCommandProvider from 'components/suggestion/command_provider/app_provider';
import CommandProvider from 'components/suggestion/command_provider/command_provider';
import EmoticonProvider from 'components/suggestion/emoticon_provider.jsx';
import SuggestionBox from 'components/suggestion/suggestion_box';
import SuggestionBoxComponent from 'components/suggestion/suggestion_box/suggestion_box';
import SuggestionList from 'components/suggestion/suggestion_list.jsx';

import * as Utils from 'utils/utils.jsx';

type Props = {
    id: string;
    channelId: string;
    rootId?: string;
    tabIndex?: number;
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onKeyPress: (e: KeyboardEvent) => void;
    onComposition?: () => void;
    onHeightChange?: (height: number, maxHeight: number) => void;
    createMessage: string;
    onKeyDown?: (e: KeyboardEvent) => void;
    onSelect?: (e: React.SyntheticEvent) => void;
    onMouseUp?: (e: React.MouseEvent) => void;
    onKeyUp?: (e: React.KeyboardEvent) => void;
    onBlur?: (e: FocusEvent) => void;
    supportsCommands: boolean;
    handlePostError?: (message: JSX.Element | null) => void;
    suggestionList?: React.ComponentProps<typeof SuggestionBox>['listComponent'];
    suggestionListPosition?: React.ComponentProps<typeof SuggestionList>['position'];
    emojiEnabled?: boolean;
    isRHS?: boolean;
    characterLimit: number;
    disabled?: boolean;
    badConnection?: boolean;
    listenForMentionKeyClick?: boolean;
    currentUserId: string;
    currentTeamId: string;
    preview?: boolean;
    profilesInChannel: Array<{ id: string }>;
    autocompleteGroups: Array<{ id: string }> | null;
    actions: {
        autocompleteUsersInChannel: (prefix: string, channelId: string | undefined) => (dispatch: any, getState: any) => Promise<string[]>;
        autocompleteChannels: (term: string, success: (channels: Channel[]) => void, error: () => void) => (dispatch: any, getState: any) => Promise<ActionResult>;
        searchAssociatedGroupsForReference: (prefix: string, teamId: string, channelId: string | undefined) => (dispatch: any, getState: any) => Promise<{ data: any }>;
    };
    useChannelMentions: boolean;
    inputComponent?: ElementType;
    openWhenEmpty?: boolean;
    priorityProfiles?: UserProfile[];
};

export default class Textbox extends React.PureComponent<Props> {
    private suggestionProviders: Provider[];
    private wrapper: React.RefObject<HTMLDivElement>;
    private message: React.RefObject<SuggestionBoxComponent>;
    private preview: React.RefObject<HTMLDivElement>;

    static defaultProps = {
        supportsCommands: true,
        isRHS: false,
        listenForMentionKeyClick: false,
        inputComponent: AutosizeTextarea,
        suggestionList: SuggestionList,
    };

    constructor(props: Props) {
        super(props);

        this.suggestionProviders = [];

        if (props.supportsCommands) {
            this.suggestionProviders.push(new AppCommandProvider({
                teamId: this.props.currentTeamId,
                channelId: this.props.channelId,
                rootId: this.props.rootId,
            }));
        }

        this.suggestionProviders.push(
            new AtMentionProvider({
                currentUserId: this.props.currentUserId,
                profilesInChannel: this.props.profilesInChannel,
                autocompleteUsersInChannel: (prefix: string) => this.props.actions.autocompleteUsersInChannel(prefix, this.props.channelId),
                useChannelMentions: this.props.useChannelMentions,
                autocompleteGroups: this.props.autocompleteGroups,
                searchAssociatedGroupsForReference: (prefix: string) => this.props.actions.searchAssociatedGroupsForReference(prefix, this.props.currentTeamId, this.props.channelId),
                priorityProfiles: this.props.priorityProfiles,
            }),
            new ChannelMentionProvider(props.actions.autocompleteChannels),
            new EmoticonProvider(),
        );

        if (props.supportsCommands) {
            this.suggestionProviders.push(new CommandProvider({
                teamId: this.props.currentTeamId,
                channelId: this.props.channelId,
                rootId: this.props.rootId,
            }));
        }

        this.checkMessageLength(props.value);
        this.wrapper = React.createRef();
        this.message = React.createRef();
        this.preview = React.createRef();
    }

    handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.props.onChange(e);
    }

    updateSuggestions(prevProps: Props) {
        if (this.props.channelId !== prevProps.channelId ||
            this.props.currentUserId !== prevProps.currentUserId ||
            this.props.profilesInChannel !== prevProps.profilesInChannel ||
            this.props.autocompleteGroups !== prevProps.autocompleteGroups ||
            this.props.useChannelMentions !== prevProps.useChannelMentions ||
            this.props.currentTeamId !== prevProps.currentTeamId ||
            this.props.priorityProfiles !== prevProps.priorityProfiles) {
            // Update channel id for AtMentionProvider.
            for (const provider of this.suggestionProviders) {
                if (provider instanceof AtMentionProvider) {
                    provider.setProps({
                        currentUserId: this.props.currentUserId,
                        profilesInChannel: this.props.profilesInChannel,
                        autocompleteUsersInChannel: (prefix: string) => this.props.actions.autocompleteUsersInChannel(prefix, this.props.channelId),
                        useChannelMentions: this.props.useChannelMentions,
                        autocompleteGroups: this.props.autocompleteGroups,
                        searchAssociatedGroupsForReference: (prefix: string) => this.props.actions.searchAssociatedGroupsForReference(prefix, this.props.currentTeamId, this.props.channelId),
                        priorityProfiles: this.props.priorityProfiles,
                    });
                }
            }
        }

        if (this.props.channelId !== prevProps.channelId ||
            this.props.currentTeamId !== prevProps.currentTeamId ||
            this.props.rootId !== prevProps.rootId) {
            // Update channel id for CommandProvider and AppCommandProvider.
            for (const provider of this.suggestionProviders) {
                if (provider instanceof CommandProvider) {
                    provider.setProps({
                        teamId: this.props.currentTeamId,
                        channelId: this.props.channelId,
                        rootId: this.props.rootId,
                    });
                }
                if (provider instanceof AppCommandProvider) {
                    provider.setProps({
                        teamId: this.props.currentTeamId,
                        channelId: this.props.channelId,
                        rootId: this.props.rootId,
                    });
                }
            }
        }

        if (prevProps.value !== this.props.value) {
            this.checkMessageLength(this.props.value);
        }
    }

    componentDidUpdate(prevProps: Props) {
        if (!prevProps.preview && this.props.preview) {
            this.preview.current?.focus();
        }

        this.updateSuggestions(prevProps);
    }

    checkMessageLength = (message: string) => {
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

    handleKeyDown = (e: KeyboardEvent) => {
        this.props.onKeyDown?.(e);
    }

    handleSelect = (e: React.SyntheticEvent) => {
        this.props.onSelect?.(e);
    }

    handleMouseUp = (e: MouseEvent) => {
        this.props.onMouseUp?.(e);
    }

    handleKeyUp = (e: KeyboardEvent) => {
        this.props.onKeyUp?.(e);
    }

    handleBlur = (e: FocusEvent) => {
        this.props.onBlur?.(e);
    }

    handleHeightChange = (height: number, maxHeight: number) => {
        this.props.onHeightChange?.(height, maxHeight);
    }

    getInputBox = () => {
        return this.message.current?.getTextbox();
    }

    focus = () => {
        const textbox = this.getInputBox();
        if (textbox) {
            textbox.focus();
            Utils.placeCaretAtEnd(textbox);

            // reset character count warning
            this.checkMessageLength(textbox.value);
        }
    }

    blur = () => {
        this.getInputBox()?.blur();
    };

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
                    tabIndex={this.props.tabIndex || 0}
                    ref={this.preview}
                    className='form-control custom-textarea textbox-preview-area'
                    onKeyPress={this.props.onKeyPress}
                    onKeyDown={this.handleKeyDown}
                    onSelect={this.handleSelect}
                    onBlur={this.handleBlur}
                >
                    <PostMarkdown
                        isRHS={this.props.isRHS}
                        message={this.props.value}
                        mentionKeys={[]}
                        channelId={this.props.channelId}
                    />
                </div>
            );
        }

        return (
            <div
                ref={this.wrapper}
                className={textWrapperClass}
            >
                <SuggestionBox
                    id={this.props.id}
                    ref={this.message}
                    className={textboxClassName}
                    spellCheck='true'
                    placeholder={this.props.createMessage}
                    onChange={this.handleChange}
                    onKeyPress={this.props.onKeyPress}
                    onSelect={this.handleSelect}
                    onKeyDown={this.handleKeyDown}
                    onMouseUp={this.handleMouseUp}
                    onKeyUp={this.handleKeyUp}
                    onComposition={this.props.onComposition}
                    onBlur={this.handleBlur}
                    onHeightChange={this.handleHeightChange}
                    style={{visibility: this.props.preview ? 'hidden' : 'visible'}}
                    inputComponent={this.props.inputComponent}
                    listComponent={this.props.suggestionList}
                    listPosition={this.props.suggestionListPosition}
                    providers={this.suggestionProviders}
                    channelId={this.props.channelId}
                    value={this.props.value}
                    renderDividers={true}
                    isRHS={this.props.isRHS}
                    disabled={this.props.disabled}
                    contextId={this.props.channelId}
                    listenForMentionKeyClick={this.props.listenForMentionKeyClick}
                    openWhenEmpty={this.props.openWhenEmpty}
                />
                {preview}
            </div>
        );
    }
}
