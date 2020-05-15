// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import {ChannelCategory} from 'mattermost-redux/types/channel_categories';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';

import '../category_modal.scss';

type Props = {
    category: ChannelCategory;
    onHide: () => void;
    actions: {
        deleteCategory: (categoryId: string) => void;
    };
};

type State = {
    show: boolean;
}

export default class DeleteCategoryModal extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            show: true,
        };
    }

    handleCancel = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        event.preventDefault();
        this.onHide();
    }

    handleConfirm = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        this.props.actions.deleteCategory(this.props.category.id);
        this.onHide();
    }

    onHide = () => {
        this.setState({show: false}, this.props.onHide);
    }

    render() {
        return (
            <Modal
                dialogClassName='a11y__modal edit-category'
                show={this.state.show}
                onHide={this.onHide}
                onExited={this.onHide}
                enforceFocus={true}
                restoreFocus={true}
                role='dialog'
                aria-labelledby='editCategoryModalLabel'
            >
                <Modal.Header
                    closeButton={true}
                />
                <Modal.Body>
                    <div className='edit-category__header'>
                        <h1 id='editCategoryModalLabel'>
                            <FormattedMessage
                                id='delete_category_modal.deleteCategory'
                                defaultMessage='Delete this category?'
                            />
                        </h1>
                    </div>
                    <div className='delete-category__body'>
                        <span className='delete-category__helpText'>
                            <FormattedMarkdownMessage
                                id='delete_category_modal.helpText'
                                defaultMessage='Channels in **{category_name}** move back to the Channels and Direct Messages categories. You are not removed from any channels.'
                                values={{
                                    category_name: this.props.category.display_name,
                                }}
                            />
                        </span>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button
                        type='button'
                        className='edit_category__button cancel'
                        onClick={this.handleCancel}
                    >
                        <FormattedMessage
                            id='edit_category_modal.cancel'
                            defaultMessage='Cancel'
                        />
                    </button>
                    <button
                        autoFocus={true}
                        type='button'
                        className={'edit_category__button delete'}
                        onClick={this.handleConfirm}
                    >
                        <FormattedMessage
                            id='delete_category_modal.delete'
                            defaultMessage='Delete'
                        />
                    </button>
                </Modal.Footer>
            </Modal>
        );
    }
}
