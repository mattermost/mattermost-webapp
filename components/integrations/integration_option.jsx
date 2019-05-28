// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Link} from 'react-router-dom';

export default class IntegrationOption extends React.PureComponent {
    static get propTypes() {
        return {
            image: PropTypes.string.isRequired,
            title: PropTypes.node.isRequired,
            description: PropTypes.node.isRequired,
            link: PropTypes.string.isRequired,
        };
    }

    render() {
        const {image, title, description, link} = this.props;

        return (
            <Link
                to={link}
                className='integration-option'
            >
                <img
                    alt={'integration image'}
                    className='integration-option__image'
                    src={image}
                />
                <div className='integration-option__title'>
                    {title}
                </div>
                <div className='integration-option__description'>
                    {description}
                </div>
            </Link>
        );
    }
}
