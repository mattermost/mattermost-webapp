// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import UserStore from 'stores/user_store.jsx';
import * as utils from 'utils/utils.jsx';

import AdvancedTab from './advanced';
import DisplayTab from './display';
import GeneralTab from './general';
import NotificationsTab from './notifications';
import SecurityTab from './security';
import SidebarTab from './sidebar';

export default class UserSettings extends React.Component {
    constructor(props) {
        super(props);

        this.state = {user: UserStore.getCurrentUser()};
    }

    componentDidMount() {
        UserStore.addChangeListener(this.onListenerChange);
    }

    componentWillUnmount() {
        UserStore.removeChangeListener(this.onListenerChange);
    }

    onListenerChange = () => {
        var user = UserStore.getCurrentUser();
        if (!utils.areObjectsEqual(this.state.user, user)) {
            this.setState({user});
        }
    }

    render() {
        if (this.props.activeTab === 'general') {
            return (
                <div>
                    <GeneralTab
                        user={this.state.user}
                        activeSection={this.props.activeSection}
                        prevActiveSection={this.props.prevActiveSection}
                        updateSection={this.props.updateSection}
                        updateTab={this.props.updateTab}
                        closeModal={this.props.closeModal}
                        collapseModal={this.props.collapseModal}
                    />
                </div>
            );
        } else if (this.props.activeTab === 'security') {
            return (
                <div>
                    <SecurityTab
                        user={this.state.user}
                        activeSection={this.props.activeSection}
                        prevActiveSection={this.props.prevActiveSection}
                        updateSection={this.props.updateSection}
                        updateTab={this.props.updateTab}
                        closeModal={this.props.closeModal}
                        collapseModal={this.props.collapseModal}
                        setEnforceFocus={this.props.setEnforceFocus}
                        setRequireConfirm={this.props.setRequireConfirm}
                    />
                </div>
            );
        } else if (this.props.activeTab === 'notifications') {
            return (
                <div>
                    <NotificationsTab
                        user={this.state.user}
                        activeSection={this.props.activeSection}
                        prevActiveSection={this.props.prevActiveSection}
                        updateSection={this.props.updateSection}
                        updateTab={this.props.updateTab}
                        closeModal={this.props.closeModal}
                        collapseModal={this.props.collapseModal}
                    />
                </div>
            );
        } else if (this.props.activeTab === 'display') {
            return (
                <div>
                    <DisplayTab
                        user={this.state.user}
                        activeSection={this.props.activeSection}
                        prevActiveSection={this.props.prevActiveSection}
                        updateSection={this.props.updateSection}
                        updateTab={this.props.updateTab}
                        closeModal={this.props.closeModal}
                        collapseModal={this.props.collapseModal}
                        setEnforceFocus={this.props.setEnforceFocus}
                        setRequireConfirm={this.props.setRequireConfirm}
                    />
                </div>
            );
        } else if (this.props.activeTab === 'sidebar') {
            return (
                <div>
                    <SidebarTab
                        activeSection={this.props.activeSection}
                        prevActiveSection={this.props.prevActiveSection}
                        updateSection={this.props.updateSection}
                        updateTab={this.props.updateTab}
                        closeModal={this.props.closeModal}
                        collapseModal={this.props.collapseModal}
                    />
                </div>
            );
        } else if (this.props.activeTab === 'advanced') {
            return (
                <div>
                    <AdvancedTab
                        user={this.state.user}
                        activeSection={this.props.activeSection}
                        prevActiveSection={this.props.prevActiveSection}
                        updateSection={this.props.updateSection}
                        updateTab={this.props.updateTab}
                        closeModal={this.props.closeModal}
                        collapseModal={this.props.collapseModal}
                    />
                </div>
            );
        }

        return <div/>;
    }
}

UserSettings.propTypes = {
    activeTab: PropTypes.string,
    activeSection: PropTypes.string,
    prevActiveSection: PropTypes.string,
    updateSection: PropTypes.func,
    updateTab: PropTypes.func,
    closeModal: PropTypes.func.isRequired,
    collapseModal: PropTypes.func.isRequired,
    setEnforceFocus: PropTypes.func.isRequired,
    setRequireConfirm: PropTypes.func.isRequired,
};
