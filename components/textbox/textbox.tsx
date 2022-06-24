// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ChangeEvent, ClipboardEventHandler, createRef, ElementType, FocusEvent, KeyboardEvent, MouseEvent, useCallback, useEffect, useImperativeHandle} from 'react';
import {FormattedMessage} from 'react-intl';

import {Channel} from '@mattermost/types/channels';
import {ActionResult} from 'mattermost-redux/types/actions';
import {UserProfile} from '@mattermost/types/users';

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

import * as Utils from 'utils/utils';

import {TextboxElement} from './index';

type Props = {
    id: string;
    channelId: string;
    rootId?: string;
    tabIndex?: number;
    value: string;
    onChange: (e: ChangeEvent<TextboxElement>) => void;
    onKeyPress: (e: KeyboardEvent<any>) => void;
    onComposition?: () => void;
    onHeightChange?: (height: number, maxHeight: number) => void;
    createMessage: string;
    onKeyDown?: (e: KeyboardEvent<TextboxElement>) => void;
    onSelect?: (e: React.SyntheticEvent<TextboxElement>) => void;
    onMouseUp?: (e: React.MouseEvent<TextboxElement>) => void;
    onKeyUp?: (e: React.KeyboardEvent<TextboxElement>) => void;
    onBlur?: (e: FocusEvent<TextboxElement>) => void;
    supportsCommands?: boolean;
    handlePostError?: (message: JSX.Element | null) => void;
    onPaste?: ClipboardEventHandler;
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

export type TextboxForwarded = {
    getInputBox: () => any;
    focus: () => void;
    blur: () => void;
}
const TextboxComponent: React.ForwardRefRenderFunction<TextboxForwarded, Props> = ({
    supportsCommands = true,
    isRHS = false,
    listenForMentionKeyClick = false,
    inputComponent = AutosizeTextarea,
    suggestionList = SuggestionList,
    characterLimit,
    handlePostError,
    channelId,
    currentTeamId,
    rootId,
    currentUserId,
    useChannelMentions,
    autocompleteGroups,
    priorityProfiles,
    actions,
    value,
    onChange,
    onKeyDown,
    onSelect,
    onMouseUp,
    onKeyUp,
    onBlur,
    onHeightChange,
    preview,
    emojiEnabled,
    badConnection,
    tabIndex,
    onKeyPress,
    id,
    createMessage,
    onComposition,
    onPaste,
    suggestionListPosition,
    disabled,
    openWhenEmpty,
}: Props, ref) => {
    const [suggestionProviders, updateSuggestionProviders] = React.useState<Provider[]>([]);
    const wrapper = createRef<HTMLDivElement>();
    const message = createRef<SuggestionBoxComponent>();
    const previewDiv = createRef<HTMLDivElement>();

    useEffect(() => {
        const newProviders: Provider[] = [];

        if (supportsCommands) {
            newProviders.push(new AppCommandProvider({
                channelId,
                teamId: currentTeamId,
                rootId,
            }),
            new CommandProvider({
                teamId: currentTeamId,
                channelId,
                rootId,
            }));
        }

        newProviders.push(
            new AtMentionProvider({
                currentUserId,
                channelId,
                autocompleteUsersInChannel: (prefix: string) => actions.autocompleteUsersInChannel(prefix, channelId),
                useChannelMentions,
                autocompleteGroups,
                searchAssociatedGroupsForReference: (prefix: string) => actions.searchAssociatedGroupsForReference(prefix, currentTeamId, channelId),
                priorityProfiles,
            }),
            new ChannelMentionProvider(actions.autocompleteChannels),
            new EmoticonProvider(),
        );

        updateSuggestionProviders(newProviders);
    }, [autocompleteGroups, channelId, currentTeamId, currentUserId, actions, priorityProfiles, useChannelMentions, rootId, supportsCommands]);

    const checkMessageLength = useCallback((message: string) => {
        if (handlePostError) {
            if (message.length > characterLimit) {
                const errorMessage = (
                    <FormattedMessage
                        id='create_post.error_message'
                        defaultMessage='Your message is too long. Character count: {length}/{limit}'
                        values={{
                            length: message.length,
                            limit: characterLimit,
                        }}
                    />);
                handlePostError(errorMessage);
            } else {
                handlePostError(null);
            }
        }
    }, [characterLimit, handlePostError]);

    const updateSuggestions = useCallback((prevProps: Pick<Props, 'channelId' | 'currentUserId' | 'autocompleteGroups' | 'useChannelMentions' | 'currentTeamId' | 'priorityProfiles' | 'rootId' | 'value'>) => {
        if (channelId !== prevProps.channelId ||
            currentUserId !== prevProps.currentUserId ||
            autocompleteGroups !== prevProps.autocompleteGroups ||
            useChannelMentions !== prevProps.useChannelMentions ||
            currentTeamId !== prevProps.currentTeamId ||
            priorityProfiles !== prevProps.priorityProfiles) {
            // Update channel id for AtMentionProvider.
            for (const provider of suggestionProviders) {
                if (provider instanceof AtMentionProvider) {
                    provider.setProps({
                        currentUserId,
                        channelId,
                        autocompleteUsersInChannel: (prefix: string) => actions.autocompleteUsersInChannel(prefix, channelId),
                        useChannelMentions,
                        autocompleteGroups,
                        searchAssociatedGroupsForReference: (prefix: string) => actions.searchAssociatedGroupsForReference(prefix, currentTeamId, channelId),
                        priorityProfiles,
                    });
                }
            }
        }

        if (channelId !== prevProps.channelId ||
            currentTeamId !== prevProps.currentTeamId ||
            rootId !== prevProps.rootId) {
            // Update channel id for CommandProvider and AppCommandProvider.
            for (const provider of suggestionProviders) {
                if (provider instanceof CommandProvider) {
                    provider.setProps({
                        teamId: currentTeamId,
                        channelId,
                        rootId,
                    });
                }
                if (provider instanceof AppCommandProvider) {
                    provider.setProps({
                        teamId: currentTeamId,
                        channelId,
                        rootId,
                    });
                }
            }
        }

        if (prevProps.value !== value) {
            checkMessageLength(value);
        }
    }, [actions, autocompleteGroups, channelId, currentTeamId, currentUserId, priorityProfiles, rootId, suggestionProviders, useChannelMentions, value, checkMessageLength]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => onChange(e);

    // adding in the HTMLDivElement to support event handling in preview state
    // since we do only handle the sending when in preview mode this is fine to be casted
    const handleKeyDown = (e: KeyboardEvent<TextboxElement | HTMLDivElement>) => onKeyDown?.(e as KeyboardEvent<TextboxElement>);

    const handleSelect = (e: React.SyntheticEvent<TextboxElement>) => onSelect?.(e);

    const handleMouseUp = (e: MouseEvent<TextboxElement>) => onMouseUp?.(e);

    const handleKeyUp = (e: KeyboardEvent<TextboxElement>) => onKeyUp?.(e);

    // adding in the HTMLDivElement to support event handling in preview state
    // since we do only handle the sending when in preview mode this is fine to be casted
    const handleBlur = (e: FocusEvent<TextboxElement | HTMLDivElement>) => onBlur?.(e as FocusEvent<TextboxElement>);

    const handleHeightChange = (height: number, maxHeight: number) => onHeightChange?.(height, maxHeight);

    const getInputBox = () => message.current?.getTextbox();

    useImperativeHandle(ref, () => ({
        getInputBox: () => message.current?.getTextbox(),

        focus: () => {
            const textbox = getInputBox();
            if (textbox) {
                textbox.focus();
                Utils.placeCaretAtEnd(textbox);
                setTimeout(() => {
                    Utils.scrollToCaret(textbox);
                });

                // reset character count warning
                checkMessageLength(textbox.value);
            }
        },
        blur: () => getInputBox()?.blur(),
    }));

    useEffect(() => {
        if (preview) {
            previewDiv.current?.focus();
        }
        updateSuggestions({autocompleteGroups, channelId, currentTeamId, currentUserId, priorityProfiles, useChannelMentions, rootId, value});
    }, [preview, previewDiv, updateSuggestions, autocompleteGroups, channelId, currentTeamId, currentUserId, priorityProfiles, useChannelMentions, rootId, value]);

    checkMessageLength(value);
    let previewText = null;

    let textboxClassName = 'form-control custom-textarea';
    let textWrapperClass = 'textarea-wrapper';
    if (emojiEnabled) {
        textboxClassName += ' custom-textarea--emoji-picker';
    }
    if (badConnection) {
        textboxClassName += ' bad-connection';
    }
    if (preview) {
        textboxClassName += ' custom-textarea--preview';
        textWrapperClass += ' textarea-wrapper--preview';
        previewText = (
            <div
                tabIndex={tabIndex || 0}
                ref={previewDiv}
                className='form-control custom-textarea textbox-preview-area'
                onKeyPress={onKeyPress}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}

            >
                <PostMarkdown
                    isRHS={isRHS}
                    message={value}
                    mentionKeys={[]}
                    channelId={channelId}
                />
            </div>
        );
    }

    return (
        <div
            ref={wrapper}
            className={textWrapperClass}
        >
            <SuggestionBox
                id={id}
                ref={message}
                className={textboxClassName}
                spellCheck='true'
                placeholder={createMessage}
                onChange={handleChange}
                onKeyPress={onKeyPress}
                onSelect={handleSelect}
                onKeyDown={handleKeyDown}
                onMouseUp={handleMouseUp}
                onKeyUp={handleKeyUp}
                onComposition={onComposition}
                onBlur={handleBlur}
                onHeightChange={handleHeightChange}
                onPaste={onPaste}
                style={{visibility: preview ? 'hidden' : 'visible'}}
                inputComponent={inputComponent}
                listComponent={suggestionList}
                listPosition={suggestionListPosition}
                providers={suggestionProviders}
                channelId={channelId}
                value={value}
                renderDividers={['all']}
                isRHS={isRHS}
                disabled={disabled}
                contextId={channelId}
                listenForMentionKeyClick={listenForMentionKeyClick}
                openWhenEmpty={openWhenEmpty}
            />
            {previewText}
        </div>
    );
};

const Textbox = React.forwardRef(TextboxComponent);
export {
    Textbox,
};

