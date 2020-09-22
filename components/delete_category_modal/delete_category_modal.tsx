// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {ChannelCategory} from 'mattermost-redux/types/channel_categories';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';

import '../category_modal.scss';
import GenericModal from 'components/generic_modal';

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

    handleConfirm = () => {
        this.props.actions.deleteCategory(this.props.category.id);
    }

    render() {
        return (
            <GenericModal
                onHide={this.props.onHide}
                modalHeaderText={(
                    <FormattedMessage
                        id='delete_category_modal.deleteCategory'
                        defaultMessage='Delete this category?'
                    />
                )}
                handleConfirm={this.handleConfirm}
                confirmButtonText={(
                    <FormattedMessage
                        id='delete_category_modal.delete'
                        defaultMessage='Delete'
                    />
                )}
                confirmButtonClassName={'delete'}
            >
                <span className='delete-category__helpText'>
                    <FormattedMarkdownMessage
                        id='delete_category_modal.helpText'
                        defaultMessage="Channels in **{category_name}** will move back to the Channels and Direct messages categories. You're not removed from any channels."
                        values={{
                            category_name: this.props.category.display_name,
                        }}
                    />
                </span>
            </GenericModal>
        );
    }
}
