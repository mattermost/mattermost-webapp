// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, memo} from 'react';
import {useIntl} from 'react-intl';
import classNames from 'classnames';

import {AlertOutlineIcon, AlertCircleOutlineIcon, MessageTextOutlineIcon, CheckIcon} from '@mattermost/compass-icons/components';

import {PostPriority} from '@mattermost/types/posts';

import Label, {LabelType} from 'components/label/label';
import menuItem from 'components/widgets/menu/menu_items/menu_item';

import './post_priority_picker.scss';

type Props = {
    priority?: PostPriority;
    onClose: () => void;
    onApply: (props: {priority: PostPriority|undefined}) => void;
    placement: string;
    rightOffset?: number;
    topOffset?: number;
    leftOffset?: number;
    style?: React.CSSProperties;
}

type ItemProps = {
    isSelected: boolean;
    onClick: () => void;
    ariaLabel: string;
    text: React.ReactNode;
    id: string;
}

function Item({
    onClick,
    ariaLabel,
    text,
    isSelected,
    id,
}: ItemProps) {
    return (
        <button
            id={id}
            aria-label={ariaLabel}
            className='style--none PostPriorityPicker__item'
            onClick={onClick}
        >
            {text && <span className='MenuItem__primary-text'>{text}</span>}
            {isSelected && (
                <span className='PostPriorityPicker__check'>
                    <CheckIcon size={18}/>
                </span>
            )}
        </button>
    );
}

const MenuItem = menuItem(Item);

function PostPriorityPicker({
    priority,
    onClose,
    onApply,
    placement,
    rightOffset = 0,
    topOffset = 0,
    leftOffset = 0,
    style,
}: Props) {
    const {formatMessage} = useIntl();

    const handleSelect = useCallback((type?: PostPriority) => () => {
        onApply({priority: type});
        onClose();
    }, []);

    let pickerStyle: React.CSSProperties = {};
    if (style && !(style.left === 0 && style.top === 0)) {
        if (placement === 'top' || placement === 'bottom') {
            // Only take the top/bottom position passed by React Bootstrap since we want to be left-aligned
            pickerStyle = {
                top: style.top,
                bottom: style.bottom,
                left: leftOffset,
            };
        } else {
            pickerStyle = {...style};
        }

        pickerStyle.top = pickerStyle.top ? Number(pickerStyle.top) + topOffset : topOffset;

        if (pickerStyle.right) {
            pickerStyle.right = Number(pickerStyle.right) + rightOffset;
        }
    }

    return (
        <div
            style={pickerStyle}
            className={classNames({PostPriorityPicker: true, bottom: placement === 'bottom'})}
        >
            <div className='PostPriorityPicker__header'>
                <h4 className='modal-title mr-2'>
                    {formatMessage({
                        id: 'post_priority.picker.header',
                        defaultMessage: 'Message priority',
                    })}
                </h4>
                <Label variant={LabelType.Primary}>
                    {'BETA'}
                </Label>
            </div>
            <div
                className='PostPriorityPicker__body'
                role='application'
            >
                <ul className='PostPriorityPicker__menu Menu'>
                    <MenuItem
                        onClick={handleSelect()}
                        isSelected={priority === undefined}
                        text={formatMessage({
                            id: 'post_priority.priority.standard',
                            defaultMessage: 'Standard',
                        })}
                        icon={
                            <div className='PostPriorityPicker__standard'>
                                <MessageTextOutlineIcon size={18}/>
                            </div>
                        }
                    />
                    <MenuItem
                        onClick={handleSelect(PostPriority.IMPORTANT)}
                        text={formatMessage({
                            id: 'post_priority.priority.important',
                            defaultMessage: 'Important',
                        })}
                        isSelected={priority === PostPriority.IMPORTANT}
                        icon={
                            <div className='PostPriorityPicker__important'>
                                <AlertCircleOutlineIcon size={18}/>
                            </div>
                        }
                    />
                    <MenuItem
                        onClick={handleSelect(PostPriority.URGENT)}
                        text={formatMessage({
                            id: 'post_priority.priority.urgent',
                            defaultMessage: 'Urgent',
                        })}
                        isSelected={priority === PostPriority.URGENT}
                        icon={
                            <div className='PostPriorityPicker__urgent'>
                                <AlertOutlineIcon size={18}/>
                            </div>
                        }
                    />
                </ul>
            </div>
        </div>
    );
}

export default memo(PostPriorityPicker);
