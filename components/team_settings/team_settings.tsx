// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import GeneralTab from 'components/team_general_tab';
import ImportTab from 'components/team_import_tab.jsx';

type Props = {
    activeTab: string;
    activeSection: string;
    updateSection: (section: string) => void;
    closeModal: () => void;
    collapseModal: () => void;
    team?: Record<string, unknown>;
};

const TeamSettings = ({
    activeTab = '',
    activeSection = '',
    updateSection,
    closeModal,
    collapseModal,
    team,
}: Props): JSX.Element | null => {
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

export default TeamSettings;
