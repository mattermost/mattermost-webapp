// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Button, Tooltip} from 'react-bootstrap';
import ReactDOM from 'react-dom';
import {FormattedMessage} from 'react-intl';

import {trackEvent} from 'actions/diagnostics_actions.jsx';
import Constants from 'utils/constants.jsx';
import * as URL from 'utils/url';
import logoImage from 'images/logo.png';

import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';
import OverlayTrigger from 'components/overlay_trigger';

export default class TeamUrl extends React.PureComponent {
    static propTypes = {

        /*
         * Object containing team's display_name and name
         */
        state: PropTypes.object,

        /*
         * Function that updates parent component with state props
         */
        updateParent: PropTypes.func,

        /*
         * Object with redux action creators
         */
        actions: PropTypes.shape({

            /*
             * Action creator to check if a team already exists
             */
            checkIfTeamExists: PropTypes.func.isRequired,

            /*
             * Action creator to create a new team
             */
            createTeam: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            nameError: '',
            isLoading: false,
        };
    }

    componentDidMount() {
        trackEvent('signup', 'signup_team_02_url');
    }

    submitBack = (e) => {
        e.preventDefault();
        const newState = this.props.state;
        newState.wizard = 'display_name';
        this.props.updateParent(newState);
    }

    submitNext = async (e) => {
        e.preventDefault();

        const name = ReactDOM.findDOMNode(this.refs.name).value.trim();
        const cleanedName = URL.cleanUpUrlable(name);
        const urlRegex = /^[a-z]+([a-z\-0-9]+|(__)?)[a-z0-9]+$/g;
        const {actions: {checkIfTeamExists, createTeam}} = this.props;

        if (!name) {
            this.setState({nameError: (
                <FormattedMessage
                    id='create_team.team_url.required'
                    defaultMessage='This field is required'
                />),
            });
            return;
        }

        if (cleanedName.length < Constants.MIN_TEAMNAME_LENGTH || cleanedName.length > Constants.MAX_TEAMNAME_LENGTH) {
            this.setState({nameError: (
                <FormattedMessage
                    id='create_team.team_url.charLength'
                    defaultMessage='Name must be {min} or more characters up to a maximum of {max}'
                    values={{
                        min: Constants.MIN_TEAMNAME_LENGTH,
                        max: Constants.MAX_TEAMNAME_LENGTH,
                    }}
                />),
            });
            return;
        }

        if (cleanedName !== name || !urlRegex.test(name)) {
            this.setState({nameError: (
                <FormattedMessage
                    id='create_team.team_url.regex'
                    defaultMessage="Use only lower case letters, numbers and dashes. Must start with a letter and can't end in a dash."
                />),
            });
            return;
        }

        for (let index = 0; index < Constants.RESERVED_TEAM_NAMES.length; index++) {
            if (cleanedName.indexOf(Constants.RESERVED_TEAM_NAMES[index]) === 0) {
                this.setState({nameError: (
                    <FormattedMarkdownMessage
                        id='create_team.team_url.taken'
                        defaultMessage='This URL [starts with a reserved word](!https://docs.mattermost.com/help/getting-started/creating-teams.html#team-url) or is unavailable. Please try another.'
                    />),
                });
                return;
            }
        }

        this.setState({isLoading: true});
        var teamSignup = JSON.parse(JSON.stringify(this.props.state));
        teamSignup.team.type = 'O';
        teamSignup.team.name = name;

        const {exists} = await checkIfTeamExists(name);

        if (exists) {
            this.setState({nameError: (
                <FormattedMessage
                    id='create_team.team_url.unavailable'
                    defaultMessage='This URL is taken or unavailable. Please try another.'
                />),
            });
            this.setState({isLoading: false});
            return;
        }

        const {data, error} = await createTeam(teamSignup.team);

        if (data) {
            this.props.history.push('/' + data.name + '/channels/' + Constants.DEFAULT_CHANNEL);
            trackEvent('signup', 'signup_team_03_complete');
        } else if (error) {
            this.setState({nameError: error.message});
            this.setState({isLoading: false});
        }
    }

    handleFocus = (e) => {
        e.preventDefault();
        e.currentTarget.select();
    }

    render() {
        let nameError = null;
        let nameDivClass = 'form-group';
        if (this.state.nameError) {
            nameError = <label className='control-label'>{this.state.nameError}</label>;
            nameDivClass += ' has-error';
        }

        const title = `${URL.getSiteURL()}/`;
        const urlTooltip = (
            <Tooltip id='urlTooltip'>{title}</Tooltip>
        );

        let finishMessage = (
            <FormattedMessage
                id='create_team.team_url.finish'
                defaultMessage='Finish'
            />
        );

        if (this.state.isLoading) {
            finishMessage = (
                <FormattedMessage
                    id='create_team.team_url.creatingTeam'
                    defaultMessage='Creating team...'
                />
            );
        }

        return (
            <div>
                <form>
                    <img
                        alt={'signup team logo'}
                        className='signup-team-logo'
                        src={logoImage}
                    />
                    <h2>
                        <FormattedMessage
                            id='create_team.team_url.teamUrl'
                            defaultMessage='Team URL'
                        />
                    </h2>
                    <div className={nameDivClass}>
                        <div className='row'>
                            <div className='col-sm-11'>
                                <div className='input-group input-group--limit'>
                                    <OverlayTrigger
                                        delayShow={Constants.OVERLAY_TIME_DELAY}
                                        placement='top'
                                        overlay={urlTooltip}
                                    >
                                        <span className='input-group-addon'>
                                            {title}
                                        </span>
                                    </OverlayTrigger>
                                    <input
                                        id='teamURLInput'
                                        type='text'
                                        ref='name'
                                        className='form-control'
                                        placeholder=''
                                        maxLength='128'
                                        defaultValue={this.props.state.team.name}
                                        autoFocus={true}
                                        onFocus={this.handleFocus}
                                        spellCheck='false'
                                    />
                                </div>
                            </div>
                        </div>
                        {nameError}
                    </div>
                    <p>
                        <FormattedMessage
                            id='create_team.team_url.webAddress'
                            defaultMessage='Choose the web address of your new team:'
                        />
                    </p>
                    <ul className='color--light'>
                        <li>
                            <FormattedMessage
                                id='create_team.team_url.hint1'
                                defaultMessage='Short and memorable is best'
                            />
                        </li>
                        <li>
                            <FormattedMessage
                                id='create_team.team_url.hint2'
                                defaultMessage='Use lowercase letters, numbers and dashes'
                            />
                        </li>
                        <li>
                            <FormattedMessage
                                id='create_team.team_url.hint3'
                                defaultMessage="Must start with a letter and can't end in a dash"
                            />
                        </li>
                    </ul>
                    <div className='mt-8'>
                        <Button
                            id='teamURLFinishButton'
                            type='submit'
                            bsStyle='primary'
                            disabled={this.state.isLoading}
                            onClick={this.submitNext}
                        >
                            {finishMessage}
                        </Button>
                    </div>
                    <div className='mt-8'>
                        <a
                            href='#'
                            onClick={this.submitBack}
                        >
                            <FormattedMessage
                                id='create_team.team_url.back'
                                defaultMessage='Back to previous step'
                            />
                        </a>
                    </div>
                </form>
            </div>
        );
    }
}
