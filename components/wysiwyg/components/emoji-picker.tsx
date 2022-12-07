// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {EmoticonPlusOutlineIcon} from '@mattermost/compass-icons/components';

// See LICENSE.txt for license information.
import classNames from 'classnames';

// See LICENSE.txt for license information.
import React, {useCallback, useEffect, useState} from 'react';
import {Editor} from '@tiptap/react';
import {offset, useFloating} from '@floating-ui/react-dom';
import {CSSTransition} from 'react-transition-group';

import {Emoji} from '@mattermost/types/emojis';

import EmojiPickerTabs from '../../emoji_picker/emoji_picker_tabs';

import ToolbarControl, {FloatingContainer} from './toolbar/toolbar_controls';
import {useGetLatest} from './toolbar/toolbar_hooks';

type Props = {
    editor: Editor;
};

const EmojiPicker = ({editor}: Props) => {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const {x, y, reference, floating, strategy, update, refs: {reference: buttonRef, floating: floatingRef}} = useFloating<HTMLButtonElement>({
        placement: 'top',
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
                if (
                    floatingRef !== null &&
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

    const handleEmojiCSelection = (emoji: Emoji) => {
        const emojiAlias = ('short_name' in emoji && emoji.short_name) || emoji.name;

        if (!emojiAlias) {
            //Oops... There went something wrong
            return;
        }

        editor.chain().focus().insertContent(`:${emojiAlias}: `).run();
        setShowEmojiPicker(false);
    };

    const handleGifSelection = (gif: string) => {
        editor.chain().focus().insertContent(gif).run();
        setShowEmojiPicker(false);
    };

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
                <FloatingContainer
                    ref={floating}
                    style={emojiPickerContainerStyles}
                >
                    <EmojiPickerTabs
                        enableGifPicker={false}
                        onEmojiClose={() => setShowEmojiPicker(false)}
                        onEmojiClick={handleEmojiCSelection}
                        onGifClick={handleGifSelection}
                    />
                </FloatingContainer>
            </CSSTransition>
        </>
    );
};

export default EmojiPicker;
