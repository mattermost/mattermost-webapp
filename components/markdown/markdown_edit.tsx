// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useState} from 'react';
import styled, {css} from 'styled-components';
import {useIntl} from 'react-intl';

import {useUpdateEffect} from 'react-use';

import Tooltip from 'components/widgets/simple_tooltip';

import ShowMore from 'components/post_view/show_more/show_more';

import Button from 'components/button';

import {PrimaryButton, TertiaryButton} from '../buttons';

import MarkdownTextbox from './markdown_textbox';

import Markdown from './';

let idCounter = 0;

// uniqueId generates a unique id with an optional prefix.
export const uniqueId = (prefix?: string) => prefix + String(++idCounter);

// useUniqueId exports a React hook simplifying the use of uniqueId.
//
// Note that changes to the prefix will not effect a change to the unique identifier.
export const useUniqueId = (prefix?: string) => {
    const [id] = useState(() => uniqueId(prefix));

    return id;
};

interface MarkdownEditProps {
    value: string;
    onSave: (value: string) => void;
    placeholder: string;
    className?: string;
    noBorder?: boolean;
    disabled?: boolean;
    previewDisabled?: boolean;
}

const MarkdownEdit = (props: MarkdownEditProps) => {
    const {formatMessage} = useIntl();

    const id = useUniqueId('editabletext-markdown-textbox');
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(props.value);

    useUpdateEffect(() => {
        setValue(props.value);
    }, [props.value]);

    const save = () => {
        setIsEditing(false);
        props.onSave(value);
    };

    const cancel = () => {
        setIsEditing(false);
        setValue(props.value);
    };

    if (isEditing) {
        return (
            <MarkdownEditContainer
                dashed={false}
                editing={true}
                className={props.className}
            >
                <MarkdownTextbox
                    id={id}
                    value={value}
                    placeholder={props.placeholder}
                    setValue={setValue}
                    autoFocus={true}
                    disabled={props.disabled}
                    previewDisabled={props.previewDisabled ?? true}
                    onKeyDown={(e) => {
                        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                            save();
                        } else if (e.key === 'Escape') {
                            cancel();
                        }
                    }}
                />
                <SaveCancel>
                    <PrimaryButton
                        onClick={save}
                    >
                        {'Save'}
                    </PrimaryButton>
                    <TertiaryButton
                        onClick={cancel}
                    >
                        {'Cancel'}
                    </TertiaryButton>
                </SaveCancel>
            </MarkdownEditContainer>
        );
    }

    return (
        <MarkdownEditContainer
            editing={isEditing}
            dashed={value === ''}
            noBorder={props.noBorder}
            className={props.className}
            onClick={(e) => {
                if (props.disabled) {
                    return;
                }
                if (!value || e.detail >= 2) {
                    setIsEditing(true);
                }
            }}
        >
            {!isEditing && !props.disabled && (
                <HoverMenuContainer>
                    <Tooltip
                        id={`${id}-tooltip`}
                        shouldUpdatePosition={true}
                        content={formatMessage({id: 'markdown_edit.edit', defaultMessage: 'Edit'})}
                    >
                        <Button
                            className={'icon-pencil-outline icon-16 btn-icon'}
                            onClick={() => !props.disabled && setIsEditing(true)}
                        />
                    </Tooltip>
                </HoverMenuContainer>
            )}
            <RenderedText data-testid='rendered-text'>
                {value ? (
                    <ShowMore
                        isRHSExpanded={false}
                        isRHSOpen={false}
                        compactDisplay={false}
                    >
                        <Markdown message={value}/>
                    </ShowMore>
                ) : (
                    <PlaceholderText>
                        <Markdown message={props.placeholder}/>
                    </PlaceholderText>
                )}
            </RenderedText>
        </MarkdownEditContainer>
    );
};

const HoverMenuContainer = styled.div`
    display: flex;
    align-items: center;
    padding: 0px 8px;
    position: absolute;
    height: 32px;
    right: 2px;
    top: 8px;
    z-index: 1;
`;

const commonTextStyle = css`
    display: block;
    align-items: center;
    border-radius: var(--markdown-textbox-radius, 4px);
    font-size: 14px;
    line-height: 20px;
    font-weight: 400;
    color: rgba(var(--center-channel-color-rgb), 0.72);
    padding: var(--markdown-textbox-padding, 12px 30px 12px 16px);

    :hover {
        cursor: text;
    }

    p {
        white-space: pre-wrap;
    }
`;

const MarkdownEditContainer = styled.div<{editing: boolean;dashed: boolean;noBorder?: boolean}>`
    position: relative;
    box-sizing: border-box;
    border-radius: var(--markdown-textbox-radius, 4px);

    && .custom-textarea.custom-textarea {
        ${commonTextStyle}
    }


    ${HoverMenuContainer} {
        opacity: 0
    }
    &:hover,
    &:focus-within {
        ${HoverMenuContainer} {
            opacity: 1;
        }

        ${({noBorder}) => noBorder && css`
            border: 1px solid rgba(var(--center-channel-color-rgb), 0.08);
        `}
    }

    border: ${(props) => (props.dashed ? '1px dashed var(--center-channel-color-16)' : '1px solid var(--center-channel-color-08)')};
    ${({editing, noBorder}) => (editing || noBorder) && css`
        border-color: transparent;
    `}
`;

export const RenderedText = styled.div`
    ${commonTextStyle}

    p:last-child {
        margin-bottom: 0;
    }
`;

const PlaceholderText = styled.span`
    font-style: italic;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    color: rgba(var(--center-channel-color-rgb), 0.56);
`;

const SaveCancel = styled.div`
    display: flex;
    gap: 4px;
    margin: 10px 0;
    justify-content: end;
`;

export default styled(MarkdownEdit)``;
