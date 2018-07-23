// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import {searchIfNeededInitial, searchGfycat} from 'mattermost-redux/actions/gifs';

import SearchGrid from 'components/gif_picker/components/SearchGrid';

function mapStateToProps(state) {
    return {
        ...state.entities.gifs.search,
    };
}

const mapDispatchToProps = ({
    searchGfycat,
    searchIfNeededInitial,
});

export class Search extends PureComponent {
    static propTypes = {
        handleItemClick: PropTypes.func,
        onCategories: PropTypes.func,
        searchText: PropTypes.string,
        searchIfNeededInitial: PropTypes.func,
        searchGfycat: PropTypes.func,
    }

    componentDidMount() {
        const {searchText} = this.props;
        this.props.searchIfNeededInitial(searchText.split('-').join(' '));
    }

    componentDidUpdate(prevProps) {
        const {searchText} = this.props;
        if (prevProps.searchText !== searchText) {
            this.props.searchIfNeededInitial(searchText.split('-').join(' '));
        }
    }

    loadMore = () => {
        const {searchText} = this.props;
        this.props.searchGfycat({searchText});
    }

    render() {
        const {handleItemClick, searchText, onCategories} = this.props;

        return (
            <SearchGrid
                keyword={searchText}
                handleItemClick={handleItemClick}
                onCategories={onCategories}
                loadMore={this.loadMore}
            />
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Search);
