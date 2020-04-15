// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import QuickInput from 'components/quick_input';
import {localizeMessage} from 'utils/utils';

type Props = {
    onHide: () => void;
    actions: {
        createCategory: (categoryName: string) => void;
    };
};

type State = {
    categoryName: string;
}

export default class CreateCategoryModal extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            categoryName: '',
        };
    }

    handleClear = () => {
        this.setState({categoryName: ''});
    }

    handleChange = (e: any) => {
        this.setState({categoryName: e.target.value});
    }

    handleCancel = () => {
        this.handleClear();
        this.props.onHide();
    }

    handleConfirm = () => {
        this.props.actions.createCategory(this.state.categoryName);
        this.props.onHide();
    }

    render() {
        return (
            <Modal
                dialogClassName='a11y__modal create-category'
                ref='modal'
                show={true}
                onHide={this.props.onHide}
                onExited={this.props.onHide}
                enforceFocus={true}
                restoreFocus={true}
                role='dialog'
                aria-labelledby='createCategoryModalLabel'
            >
                <Modal.Header
                    closeButton={true}
                />
                <Modal.Body>
                    <div className='create-category__header'>
                        <h1 id='createCategoryModalLabel'>
                            <FormattedMessage
                                id='create_category_modal.createCategory'
                                defaultMessage='Create Category'
                            />
                        </h1>
                    </div>
                    <div className='create-category__body'>
                        <QuickInput
                            autofocus={true}
                            className='form-control filter-textbox'
                            type='text'
                            value={this.state.categoryName}
                            placeholder={localizeMessage('create_category_modal.placeholder', 'Choose a category name')}
                            clearable={true}
                            onClear={this.handleClear}
                            onChange={this.handleChange}
                        />
                        <span className='create-category__helpText'>
                            <FormattedMessage
                                id='create_category_modal.helpText'
                                defaultMessage='You can drag channels into categories to organize your sidebar.'
                            />
                        </span>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button
                        type='button'
                        className='create_category__button cancel'
                        onClick={this.handleCancel}
                    >
                        <FormattedMessage
                            id='create_category_modal.cancel'
                            defaultMessage='Cancel'
                        />
                    </button>
                    <button
                        type='button'
                        className={classNames('create_category__button create', {
                            disabled: !this.state.categoryName,
                        })}
                        onClick={this.handleConfirm}
                        disabled={!this.state.categoryName}
                    >
                        <FormattedMessage
                            id='create_category_modal.create'
                            defaultMessage='Create'
                        />
                    </button>
                </Modal.Footer>
            </Modal>
        );
    }
}
