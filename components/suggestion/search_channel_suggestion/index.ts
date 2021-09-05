// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {connect} from 'react-redux';

import {getDirectTeammate} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import {GlobalState} from 'types/store';

import {Channel} from 'mattermost-redux/types/channels';

import {SuggestionProps} from '../suggestion';

import SearchChannelSuggestion from './search_channel_suggestion';

// type DispatchProps = Record<string, never>;
type OwnProps = Omit<SuggestionProps, 'item'> & {item: Channel};

const mapStateToProps = (state: GlobalState, props: OwnProps) => {
    return {
        teammate: getDirectTeammate(state, props.item.id),
        currentUser: getCurrentUserId(state),
    };
};

export default connect(
    mapStateToProps,
    null,
    null,
    {forwardRef: true},
)(SearchChannelSuggestion);
