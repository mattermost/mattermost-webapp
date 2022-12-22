// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// See LICENSE.txt for license information.
import React, {useCallback, useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import styled from 'styled-components';
import classNames from 'classnames';
import {Editor} from '@tiptap/react';
import {offset, useFloating} from '@floating-ui/react-dom';
import {CSSTransition} from 'react-transition-group';
import {EmoticonPlusOutlineIcon} from '@mattermost/compass-icons/components';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import EmojiPickerTabs from 'components/emoji_picker/emoji_picker_tabs';

import {GfycatAPIItem} from '@mattermost/types/gifs';

import {Emoji} from '@mattermost/types/emojis';

import ToolbarControl, {FloatingContainer} from './toolbar/toolbar_controls';
import {useGetLatest} from './toolbar/toolbar_hooks';

const EmojiContainer = styled(FloatingContainer)`
    padding: 0;

    #emojiPicker {
        border: none;
    }

    #emojiPicker,
    #emoji-picker-tabs {
        position: relative;
        top: unset;
        right: unset;
        bottom: unset;
        left: unset;
    }

    // TODO: this height should be automated
    .categories-container,
    .search-grid-container {
        height: 364px;
    }

    .search-bar {
        padding: 8px 8px 0;
    }
`;

type Props = {
    editor: Editor;
};

const EmojiPicker = ({editor}: Props) => {
    const enableGifPicker = useSelector(getConfig).EnableGifPicker === 'true';
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const {x, y, reference, floating, strategy, update, refs: {reference: buttonRef, floating: floatingRef}} = useFloating<HTMLButtonElement>({
        placement: 'top-end',
        middleware: [offset({mainAxis: 4})],
    });

    // this little helper hook always returns the latest refs and does not mess with the floatingUI placement calculation
    const getLatest = useGetLatest({
        showEmojiPicker,
        buttonRef,
        floatingRef,
    });

    useEffect(() => {
        const handleClickOutside: EventListener = (event) => {
            event.stopPropagation();
            const {floatingRef, buttonRef} = getLatest();
            const target = event.composedPath?.()?.[0] || event.target;
            if (target instanceof Node) {
                if (floatingRef !== null &&
                    buttonRef !== null &&
                    !floatingRef.current?.contains(target) &&
                    !buttonRef.current?.contains(target)
                ) {
                    setShowEmojiPicker(false);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [getLatest]);

    useEffect(() => {
        update?.();
    }, [update]);

    const toggleEmojiPicker = useCallback((event?) => {
        event?.preventDefault();
        setShowEmojiPicker(!showEmojiPicker);
    }, [showEmojiPicker]);

    const emojiPickerContainerStyles: React.CSSProperties = {
        position: strategy,
        top: y ?? 0,
        left: x ?? 0,
    };

    const handleEmojiSelection = (emoji: Emoji) => {
        const emojiAlias = ('short_name' in emoji && emoji.short_name) || emoji.name;

        if (!emojiAlias) {
            // We cannot find the correct emojiAlias ... strange :D
            return;
        }

        editor.chain().focus().insertEmoji(emojiAlias).run();
        setShowEmojiPicker(false);
    };

    const handleGifSelection = (gif: string, item: GfycatAPIItem) => {
        editor.chain().focus().setImage({src: item.max5mbGif, title: item.title}).run();
        setShowEmojiPicker(false);
    };

    /**
     * this is mimicking the behavior inside the EmojiPicker, but since this cannot be
     * controlled from the outside and we render this the moment we mount this component
     * we need to handle that separately
     */
    useEffect(() => {
        const rootElement = document.getElementById('root');
        if (showEmojiPicker) {
            rootElement?.classList.add('emoji-picker--active');
        } else {
            rootElement?.classList.remove('emoji-picker--active');
        }
    }, [showEmojiPicker]);

    const codeBlockModeIsActive = editor.isActive('codeBlock');

    return (
        <>
            <ToolbarControl
                mode={'emoji'}
                onClick={toggleEmojiPicker}
                ref={reference}
                className={classNames({active: showEmojiPicker})}
                Icon={EmoticonPlusOutlineIcon}
                disabled={codeBlockModeIsActive}
            />
            <CSSTransition
                timeout={250}
                classNames='scale'
                in={showEmojiPicker}
            >
                <EmojiContainer
                    ref={floating}
                    style={emojiPickerContainerStyles}
                >
                    <EmojiPickerTabs
                        enableGifPicker={enableGifPicker}
                        onEmojiClose={() => setShowEmojiPicker(false)}
                        onEmojiClick={handleEmojiSelection}
                        onGifClick={handleGifSelection}
                    />
                </EmojiContainer>
            </CSSTransition>
        </>
    );
};

export default EmojiPicker;
