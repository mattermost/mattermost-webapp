// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import TeamStore from 'stores/team_store.jsx';
import * as Utils from 'utils/utils.jsx';

import GeneralTab from './team_general_tab';
import ImportTab from './team_import_tab.jsx';

export default class TeamSettings extends React.Component {
    constructor(props) {
        super(props);

        this.onChange = this.onChange.bind(this);

        this.state = {team: TeamStore.getCurrent()};
    }

    componentDidMount() {
        TeamStore.addChangeListener(this.onChange);
    }

    componentWillUnmount() {
        TeamStore.removeChangeListener(this.onChange);
    }

    onChange() {
        const team = TeamStore.getCurrent();

        if (!Utils.areObjectsEqual(this.state.team, team)) {
            this.setState({team});
        }
    }

    render() {
        if (!this.state.team) {
            return null;
        }

        let result;
        switch (this.props.activeTab) {
        case 'general':
            result = (
                <div>
                    <GeneralTab
                        team={this.state.team}
                        activeSection={this.props.activeSection}
                        updateSection={this.props.updateSection}
                        closeModal={this.props.closeModal}
                        collapseModal={this.props.collapseModal}
                    />
                </div>
            );
            break;
        case 'import':
            result = (
                <div>
                    <ImportTab
                        team={this.state.team}
                        activeSection={this.props.activeSection}
                        updateSection={this.props.updateSection}
                        closeModal={this.props.closeModal}
                        collapseModal={this.props.collapseModal}
                    />
                </div>
            );
            break;
        default:
            result = (
                <div/>
            );
            break;
        }

        return result;
    }
}

TeamSettings.defaultProps = {
    activeTab: '',
    activeSection: '',
};

TeamSettings.propTypes = {
    activeTab: PropTypes.string.isRequired,
    activeSection: PropTypes.string.isRequired,
    updateSection: PropTypes.func.isRequired,
    closeModal: PropTypes.func.isRequired,
    collapseModal: PropTypes.func.isRequired,
};
