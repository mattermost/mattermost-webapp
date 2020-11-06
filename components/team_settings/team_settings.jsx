// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import GeneralTab from 'components/team_general_tab';
import ImportTab from 'components/team_import_tab.jsx';

const TeamSettings = ({activeTab, activeSection, updateSection, closeModal, collapseModal, team}) => {
    if (!team) {
        return null;
    }

    let result;
    switch (activeTab) {
    case 'general':
        result = (
            <div>
                <GeneralTab
                    team={team}
                    activeSection={activeSection}
                    updateSection={updateSection}
                    closeModal={closeModal}
                    collapseModal={collapseModal}
                />
            </div>
        );
        break;
    case 'import':
        result = (
            <div>
                <ImportTab
                    team={team}
                    activeSection={activeSection}
                    updateSection={updateSection}
                    closeModal={closeModal}
                    collapseModal={collapseModal}
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
};

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
    team: PropTypes.object,
};

export default TeamSettings;
