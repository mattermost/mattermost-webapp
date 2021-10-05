// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getBool} from 'mattermost-redux/selectors/entities/preferences';
import {Preferences} from 'utils/constants';
import {GlobalState} from '../../../types/store';

import PostEditedIndicator from './post_edited_indicator';

type OwnProps = {
    postId?: string;
    editedAt?: number;
}

type StateProps = {
    isMilitaryTime: boolean;
}

export type Props = OwnProps & StateProps;

function mapStateToProps(state: GlobalState): StateProps {
    const isMilitaryTime = getBool(state, Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.USE_MILITARY_TIME, false);
    return {isMilitaryTime};
}

export default connect<StateProps, null, OwnProps, GlobalState>(mapStateToProps)(PostEditedIndicator);
