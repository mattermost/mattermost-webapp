// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {isMobile} from 'utils/utils.jsx';
import EditIcon from 'components/widgets/icons/fa_edit_icon';

interface Props {

    /**
     * Settings title
     */
    title: JSX.Element | string;

    /**
     * Option to disable opening the setting
     */
    disableOpen?: boolean;

    /**
     * Settings or tab section
     */
    section: string;

    /**
     * Function to update section
     */
    updateSection: (section: string) => void;

    /**
     * Settings description
     */
    describe?: JSX.Element | JSX.Element[] | string;

}

export default class SettingItemMin extends React.PureComponent<Props> {
    private edit: HTMLButtonElement | null = null;

    componentDidMount() {
        if (this.edit) {
            this.edit.focus();
        }
    }

    private getEdit = (node: HTMLButtonElement) => {
        this.edit = node;
    }

    handleUpdateSection = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        this.props.updateSection(this.props.section);
    }

    render(): JSX.Element {
        let editButton = null;
        let describeSection = null;

        if (!this.props.disableOpen && isMobile()) {
            editButton = (
                <div className='section-min__edit'>
                    <button
                        id={this.props.section + 'Edit'}
                        className='color--link cursor--pointer style--none'
                        onClick={this.handleUpdateSection}
                        ref={this.getEdit}
                        aria-labelledby={this.props.section + 'Title ' + this.props.section + 'Edit'}
                    >
                        <EditIcon/>
                        {this.props.describe}
                    </button>
                </div>
            );
        } else if (!this.props.disableOpen) {
            editButton = (
                <div className='section-min__edit'>
                    <button
                        id={this.props.section + 'Edit'}
                        className='color--link cursor--pointer style--none text-left'
                        onClick={this.handleUpdateSection}
                        ref={this.getEdit}
                        aria-labelledby={this.props.section + 'Title ' + this.props.section + 'Edit'}
                    >
                        <EditIcon/>
                        <FormattedMessage
                            id='setting_item_min.edit'
                            defaultMessage='Edit'
                        />
                    </button>
                </div>
            );

            describeSection = (
                <div
                    id={this.props.section + 'Desc'}
                    className='section-min__describe'
                >
                    {this.props.describe}
                </div>
            );
        }

        return (
            <div
                className='section-min'
                onClick={this.handleUpdateSection}
            >
                <div className='d-flex'>
                    <h4
                        id={this.props.section + 'Title'}
                        className='section-min__title'
                    >
                        {this.props.title}
                    </h4>
                    {editButton}
                </div>
                {describeSection}
            </div>
        );
    }
}
