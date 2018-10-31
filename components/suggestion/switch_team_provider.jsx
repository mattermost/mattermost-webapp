// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import * as Selectors from 'mattermost-redux/selectors/entities/teams';

import AppDispatcher from 'dispatcher/app_dispatcher.jsx';
import {getCurrentLocale} from 'selectors/i18n';
import store from 'stores/redux_store.jsx';
import {ActionTypes} from 'utils/constants.jsx';
import {localizeMessage} from 'utils/utils.jsx';

import Provider from './provider.jsx';
import Suggestion from './suggestion.jsx';

const getState = store.getState;

class SwitchTeamSuggestion extends Suggestion {
    render() {
        const {item, isSelection} = this.props;

        let className = 'mentions__name';
        if (isSelection) {
            className += ' suggestion--selected';
        }

        return (
            <div
                onClick={this.handleClick}
                className={className}
                {...Suggestion.baseProps}
            >
                <div className='status'>
                    <i
                        className='fa fa-group'
                        title={localizeMessage('general_tab.teamIcon', 'Team Icon')}
                    />
                </div>
                {item.display_name}
            </div>
        );
    }
}

let prefix = '';

function quickSwitchSorter(a, b) {
    const aDisplayName = a.display_name.toLowerCase();
    const bDisplayName = b.display_name.toLowerCase();
    const aStartsWith = aDisplayName.startsWith(prefix);
    const bStartsWith = bDisplayName.startsWith(prefix);

    if (aStartsWith && bStartsWith) {
        const locale = getCurrentLocale(getState());

        if (aDisplayName !== bDisplayName) {
            return aDisplayName.localeCompare(bDisplayName, locale, {numeric: true});
        }

        return a.name.localeCompare(b.name, locale, {numeric: true});
    } else if (aStartsWith) {
        return -1;
    }

    return 1;
}

export default class SwitchTeamProvider extends Provider {
    handlePretextChanged(suggestionId, teamPrefix) {
        if (teamPrefix) {
            prefix = teamPrefix;
            this.startNewRequest(suggestionId, teamPrefix);

            const allTeams = Selectors.getMyTeams(getState());

            const teams = allTeams.filter((team) => {
                return team.display_name.toLowerCase().indexOf(teamPrefix) !== -1 ||
                    team.name.indexOf(teamPrefix) !== -1;
            });

            const teamNames = teams.
                sort(quickSwitchSorter).
                map((team) => team.name);

            setTimeout(() => {
                AppDispatcher.handleServerAction({
                    type: ActionTypes.SUGGESTION_RECEIVED_SUGGESTIONS,
                    id: suggestionId,
                    matchedPretext: teamPrefix,
                    terms: teamNames,
                    items: teams,
                    component: SwitchTeamSuggestion,
                });
            }, 0);

            return true;
        }

        return false;
    }
}
