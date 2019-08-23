// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import {FormattedMessage} from 'react-intl';

import {trackEvent} from 'actions/diagnostics_actions.jsx';
import Constants from 'utils/constants.jsx';
import {cleanUpUrlable} from 'utils/url.jsx';
import logoImage from 'images/logo.png';
import NextIcon from 'components/widgets/icons/fa_next_icon';

export default class TeamSignupDisplayNamePage extends React.PureComponent {
    static propTypes = {

        /*
         * Object containing team's display_name and name
         */
        state: PropTypes.object,

        /*
         * Function that updates parent component with state props
         */
        updateParent: PropTypes.func,
    }

    constructor(props) {
        super(props);

        this.state = {};
    }

    componentDidMount() {
        trackEvent('signup', 'signup_team_01_name');
    }

    submitNext = (e) => {
        e.preventDefault();

        var displayName = ReactDOM.findDOMNode(this.refs.name).value.trim();
        if (!displayName) {
            this.setState({nameError: (
                <FormattedMessage
                    id='create_team.display_name.required'
                    defaultMessage='This field is required'
                />),
            });
            return;
        } else if (displayName.length < Constants.MIN_TEAMNAME_LENGTH || displayName.length > Constants.MAX_TEAMNAME_LENGTH) {
            this.setState({nameError: (
                <FormattedMessage
                    id='create_team.display_name.charLength'
                    defaultMessage='Name must be {min} or more characters up to a maximum of {max}. You can add a longer team description later.'
                    values={{
                        min: Constants.MIN_TEAMNAME_LENGTH,
                        max: Constants.MAX_TEAMNAME_LENGTH,
                    }}
                />),
            });
            return;
        }

        const newState = this.props.state;
        newState.wizard = 'team_url';
        newState.team.display_name = displayName;
        newState.team.name = cleanUpUrlable(displayName);
        this.props.updateParent(newState);
    }

    handleFocus = (e) => {
        e.preventDefault();
        e.currentTarget.select();
    }

    render() {
        var nameError = null;
        var nameDivClass = 'form-group';
        if (this.state.nameError) {
            nameError = <label className='control-label'>{this.state.nameError}</label>;
            nameDivClass += ' has-error';
        }

        return (
            <div>
                <form>
                    <img
                        alt={'signup logo'}
                        className='signup-team-logo'
                        src={logoImage}
                    />
                    <h2>
                        <FormattedMessage
                            id='create_team.display_name.teamName'
                            defaultMessage='Team Name'
                        />
                    </h2>
                    <div className={nameDivClass}>
                        <div className='row'>
                            <div className='col-sm-9'>
                                <input
                                    id='teamNameInput'
                                    type='text'
                                    ref='name'
                                    className='form-control'
                                    placeholder=''
                                    maxLength='128'
                                    defaultValue={this.props.state.team.display_name}
                                    autoFocus={true}
                                    onFocus={this.handleFocus}
                                    spellCheck='false'
                                />
                            </div>
                        </div>
                        {nameError}
                    </div>
                    <div>
                        <FormattedMessage
                            id='create_team.display_name.nameHelp'
                            defaultMessage='Name your team in any language. Your team name shows in menus and headings.'
                        />
                    </div>
                    <button
                        id='teamNameNextButton'
                        type='submit'
                        className='btn btn-primary margin--extra'
                        onClick={this.submitNext}
                    >
                        <FormattedMessage
                            id='create_team.display_name.next'
                            defaultMessage='Next'
                        />
                        <NextIcon/>
                    </button>
                </form>
            </div>
        );
    }
}
