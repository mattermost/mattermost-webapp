// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {IntlShape, injectIntl} from 'react-intl';

import {CategoryTypes} from 'mattermost-redux/constants/channel_categories';
import {ChannelCategory} from 'mattermost-redux/types/channel_categories';

import {trackEvent} from 'actions/telemetry_actions';
import DeleteCategoryModal from 'components/delete_category_modal';
import EditCategoryModal from 'components/edit_category_modal';
import SidebarMenu from 'components/sidebar/sidebar_menu';
import Menu from 'components/widgets/menu/menu';
import {ModalIdentifiers} from 'utils/constants';

type Props = {
    currentTeamId: string;
    category: ChannelCategory;
    isMenuOpen: boolean;
    onToggleMenu: (open: boolean) => void;
    intl: IntlShape;
    actions: {
        openModal: (modalData: {modalId: string; dialogType: any; dialogProps?: any}) => Promise<{
            data: boolean;
        }>;
    };
};

type State = {
    showDeleteCategoryModal: boolean;
}

class SidebarCategoryMenu extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            showDeleteCategoryModal: false,
        };
    }

    deleteCategory = () => {
        this.props.actions.openModal({
            modalId: ModalIdentifiers.DELETE_CATEGORY,
            dialogType: DeleteCategoryModal,
            dialogProps: {
                category: this.props.category,
            },
        });
    }

    renameCategory = () => {
        this.props.actions.openModal({
            modalId: ModalIdentifiers.EDIT_CATEGORY,
            dialogType: EditCategoryModal,
            dialogProps: {
                categoryId: this.props.category.id,
                initialCategoryName: this.props.category.display_name,
            },
        });
    }

    createCategory = () => {
        this.props.actions.openModal({
            modalId: ModalIdentifiers.EDIT_CATEGORY,
            dialogType: EditCategoryModal,
        });
        trackEvent('ui', 'ui_sidebar_category_menu_createCategory');
    }

    onToggleMenu = (open: boolean) => {
        this.props.onToggleMenu(open);

        if (open) {
            trackEvent('ui', 'ui_sidebar_category_menu_opened');
        }
    }

    renderDropdownItems = () => {
        const {intl, category} = this.props;

        let deleteCategory;
        let renameCategory;
        if (category.type === CategoryTypes.CUSTOM) {
            deleteCategory = (
                <Menu.ItemAction
                    isDangerous={true}
                    id={`delete-${category.id}`}
                    onClick={this.deleteCategory}
                    icon={<i className='icon-trash-can-outline'/>}
                    text={intl.formatMessage({id: 'sidebar_left.sidebar_category_menu.deleteCategory', defaultMessage: 'Delete Category'})}
                />
            );

            renameCategory = (
                <Menu.ItemAction
                    id={`rename-${category.id}`}
                    onClick={this.renameCategory}
                    icon={<i className='icon-pencil-outline'/>}
                    text={intl.formatMessage({id: 'sidebar_left.sidebar_category_menu.renameCategory', defaultMessage: 'Rename Category'})}
                />
            );
        }

        return (
            <React.Fragment>
                <Menu.Group>
                    {renameCategory}
                    {deleteCategory}
                </Menu.Group>
                <Menu.Group>
                    <Menu.ItemAction
                        id={`create-${category.id}`}
                        onClick={this.createCategory}
                        icon={<i className='icon-folder-plus-outline'/>}
                        text={intl.formatMessage({id: 'sidebar_left.sidebar_category_menu.createCategory', defaultMessage: 'Create New Category'})}
                    />
                </Menu.Group>
            </React.Fragment>
        );
    }

    render() {
        const {intl, category} = this.props;

        return (
            <React.Fragment>
                <SidebarMenu
                    id={`SidebarCategoryMenu-${category.id}`}
                    ariaLabel={intl.formatMessage({id: 'sidebar_left.sidebar_category_menu.dropdownAriaLabel', defaultMessage: 'Category Menu'})}
                    buttonAriaLabel={intl.formatMessage({id: 'sidebar_left.sidebar_category_menu.dropdownAriaLabel', defaultMessage: 'Category Menu'})}
                    isMenuOpen={this.props.isMenuOpen}
                    onToggleMenu={this.onToggleMenu}
                    tooltipText={intl.formatMessage({id: 'sidebar_left.sidebar_category_menu.editCategory', defaultMessage: 'Category options'})}
                >
                    {this.renderDropdownItems()}
                </SidebarMenu>
            </React.Fragment>
        );
    }
}

export default injectIntl(SidebarCategoryMenu);
