import {connect} from 'react-redux';

import {saveSearchScrollPosition, sendEvent} from 'mattermost-redux/actions/gifs';

import SearchGrid from './SearchGrid';

function mapStateToProps(state) {
    return {
        ...state.entities.gifs.cache,
        ...state.entities.gifs.search,
        appProps: state.entities.gifs.app,
    };
}

function mapDispatchToProps() {
    return {
        saveSearchScrollPosition,
        sendEvent,
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SearchGrid);
