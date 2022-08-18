// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {AlertOutlineIcon, AlertCircleOutlineIcon, MessageTextOutlineIcon, CheckIcon} from '@mattermost/compass-icons/components';

import Label, {LabelType} from 'components/label/label';
import menuItem from 'components/widgets/menu/menu_items/menu_item';

import './post_priority_picker.scss';

type Props = typeof PostPriorityPicker.defaultProps & {
    priority: ''|'important'|'urgent';
    onClose: () => void;
    onApply: (props: {priority: string}) => void;
    placement: string;
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

type State = {
    selected: ''|'important'|'urgent';
}

export default class PostPriorityPicker extends React.PureComponent<Props, State> {
    state: State;

    static defaultProps = {
        rightOffset: 0,
        topOffset: 0,
        leftOffset: 0,
    }

    constructor(props: Props) {
        super(props);

        this.state = {
            selected: props.priority ?? '',
        };

        this.handleSelect = this.handleSelect.bind(this);
        this.handleApply = this.handleApply.bind(this);
    }

    handleSelect(type: State['selected']) {
        return () => {
            this.setState({
                selected: type,
            });
        };
    }

    handleApply() {
        this.props.onApply({
            priority: this.state.selected,
        });
        this.props.onClose();
    }

    render() {
        let pickerStyle: React.CSSProperties = {};
        if (this.props.style && !(this.props.style.left === 0 && this.props.style.top === 0)) {
            if (this.props.placement === 'top' || this.props.placement === 'bottom') {
                // Only take the top/bottom position passed by React Bootstrap since we want to be left-aligned
                pickerStyle = {
                    top: this.props.style.top,
                    bottom: this.props.style.bottom,
                    left: this.props.leftOffset,
                };
            } else {
                pickerStyle = {...this.props.style};
            }

            pickerStyle.top = pickerStyle.top ? Number(pickerStyle.top) + this.props.topOffset : this.props.topOffset;

            if (pickerStyle.right) {
                pickerStyle.right = Number(pickerStyle.right) + this.props.rightOffset;
            }
        }

        let pickerClass = 'PostPriorityPicker';
        if (this.props.placement === 'bottom') {
            pickerClass += ' bottom';
        }

        return (
            <div
                style={pickerStyle}
                className={pickerClass}
            >
                <div className='PostPriorityPicker__header'>
                    <h4 className='modal-title'>
                        <FormattedMessage
                            id={'post_priority.picker.header'}
                            defaultMessage={'Message Priority'}
                        />
                    </h4>
                    <Label type={LabelType.Primary}>
                        {'BETA'}
                    </Label>
                    <button className='style--none PostPriorityPicker__feedback'>
                        <FormattedMessage
                            id={'post_priority.picker.feedback'}
                            defaultMessage={'Give feedback'}
                        />
                    </button>
                </div>
                <div
                    className='PostPriorityPicker__body'
                    role='application'
                >
                    <ul className='PostPriorityPicker__menu Menu'>
                        <MenuItem
                            onClick={this.handleSelect('')}
                            isSelected={this.state.selected === ''}
                            text={(
                                <FormattedMessage
                                    id={'post_priority.priority.standard'}
                                    defaultMessage={'Standard'}
                                />
                            )}
                            icon={
                                <div className='PostPriorityPicker__standard'>
                                    <MessageTextOutlineIcon size={18}/>
                                </div>
                            }
                        />
                        <MenuItem
                            onClick={this.handleSelect('important')}
                            text={(
                                <FormattedMessage
                                    id={'post_priority.priority.important'}
                                    defaultMessage={'Important'}
                                />
                            )}
                            isSelected={this.state.selected === 'important'}
                            icon={
                                <div className='PostPriorityPicker__important'>
                                    <AlertCircleOutlineIcon size={18}/>
                                </div>
                            }
                        />
                        <MenuItem
                            onClick={this.handleSelect('urgent')}
                            text={(
                                <FormattedMessage
                                    id={'post_priority.priority.urgent'}
                                    defaultMessage={'Urgent'}
                                />
                            )}
                            isSelected={this.state.selected === 'urgent'}
                            icon={
                                <div className='PostPriorityPicker__urgent'>
                                    <AlertOutlineIcon size={18}/>
                                </div>
                            }
                        />
                    </ul>
                </div>
                <div
                    className='PostPriorityPicker__bottom'
                    role='application'
                >
                    <button
                        type='button'
                        className='PostPriorityPicker__cancel'
                        onClick={this.props.onClose}
                    >
                        <FormattedMessage
                            id={'post_priority.picker.cancel'}
                            defaultMessage={'Cancel'}
                        />
                    </button>
                    <button
                        onClick={this.handleApply}
                        type='button'
                        className='PostPriorityPicker__apply'
                    >
                        <FormattedMessage
                            id={'post_priority.picker.apply'}
                            defaultMessage={'Apply'}
                        />
                    </button>
                </div>
            </div>
        );
    }
}
