import {GlobalState} from '@mattermost/types/store';
import {connect} from 'react-redux';

function mapStateToProps(state: GlobalState) {
    return state && {} || {}
}

import EditorPostsArchivedWarning from './editor_posts_archived_warning';

export default connect(mapStateToProps)(EditorPostsArchivedWarning )
