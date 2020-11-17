// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {ChannelCategory} from 'mattermost-redux/types/channel_categories';

import {trackEvent} from 'actions/telemetry_actions';
import QuickInput from 'components/quick_input';
import {localizeMessage} from 'utils/utils';

import '../category_modal.scss';
import GenericModal from 'components/generic_modal';

type Props = {
    onHide: () => void;
    currentTeamId: string;
    categoryId?: string;
    initialCategoryName?: string;
    channelIdsToAdd?: string[];
    actions: {
        createCategory: (teamId: string, displayName: string, channelIds?: string[] | undefined) => {data: ChannelCategory};
        renameCategory: (categoryId: string, newName: string) => void;
    };
};

type State = {
    categoryName: string;
}

export default class EditCategoryModal extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            categoryName: props.initialCategoryName || '',
        };
    }

    handleClear = () => {
        this.setState({categoryName: ''});
    }

    handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({categoryName: e.target.value});
    }

    handleCancel = () => {
        this.handleClear();
    }

    handleConfirm = () => {
        if (this.props.categoryId) {
            this.props.actions.renameCategory(this.props.categoryId, this.state.categoryName);
        } else {
            this.props.actions.createCategory(this.props.currentTeamId, this.state.categoryName, this.props.channelIdsToAdd);
            trackEvent('ui', 'ui_sidebar_created_category');
        }
    }

    isConfirmDisabled = () => {
        return !this.state.categoryName ||
            (Boolean(this.props.initialCategoryName) && this.props.initialCategoryName === this.state.categoryName);
    }

    getText = () => {
        let modalHeaderText;
        let editButtonText;
        let helpText;

        if (this.props.categoryId) {
            modalHeaderText = (
                <FormattedMessage
                    id='rename_category_modal.renameCategory'
                    defaultMessage='Rename Category'
                />
            );
            editButtonText = (
                <FormattedMessage
                    id='rename_category_modal.rename'
                    defaultMessage='Rename'
                />
            );
        } else {
            modalHeaderText = (
                <FormattedMessage
                    id='create_category_modal.createCategory'
                    defaultMessage='Create New Category'
                />
            );
            editButtonText = (
                <FormattedMessage
                    id='create_category_modal.create'
                    defaultMessage='Create'
                />
            );
            helpText = (
                <FormattedMessage
                    id='edit_category_modal.helpText'
                    defaultMessage='Drag channels into this category to organize your sidebar.'
                />
            );
        }

        return {
            modalHeaderText,
            editButtonText,
            helpText,
        };
    }

    render() {
        const {
            modalHeaderText,
            editButtonText,
            helpText,
        } = this.getText();

        return (
            <GenericModal
                onHide={this.props.onHide}
                modalHeaderText={modalHeaderText}
                handleConfirm={this.handleConfirm}
                handleCancel={this.handleCancel}
                confirmButtonText={editButtonText}
                isConfirmDisabled={this.isConfirmDisabled()}
                id='editCategoryModal'
            >
                <QuickInput
                    autoFocus={true}
                    className='form-control filter-textbox'
                    type='text'
                    value={this.state.categoryName}
                    placeholder={localizeMessage('edit_category_modal.placeholder', 'Name your category')}
                    clearable={true}
                    onClear={this.handleClear}
                    onChange={this.handleChange}
                    maxLength={22}
                />
                {Boolean(helpText) && <span className='edit-category__helpText'>
                    {helpText}
                </span>}
            </GenericModal>
        );
    }
}
