// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {FormattedMessage, useIntl} from 'react-intl';
import {Tooltip} from 'react-bootstrap';

import classNames from 'classnames';

import OverlayTrigger from 'components/overlay_trigger';
import GenericModal from 'components/generic_modal';
import Input from 'components/widgets/inputs/input/input';
import PublicPrivateSelector from 'components/widgets/public-private-selector/public-private-selector';
import URLInput from 'components/widgets/inputs/url_input/url_input';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import Menu from 'components/widgets/menu/menu';

import {createChannel} from 'mattermost-redux/actions/channels';
import Permissions from 'mattermost-redux/constants/permissions';
import {get as getPreference} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {ActionFunc, DispatchFunc} from 'mattermost-redux/types/actions';
import {haveICurrentChannelPermission} from 'mattermost-redux/selectors/entities/roles';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import Preferences from 'mattermost-redux/constants/preferences';
import {
    attachBoardToChannel,
    createBoardFromTemplate,
    createEmptyBoard,
    getBoardsTemplates,
    setNewChannelWithBoardPreference,
} from 'mattermost-redux/actions/boards';

import {switchToChannel} from 'actions/views/channel';
import {closeModal} from 'actions/views/modals';
import {sendGenericPostMessage} from 'actions/global_actions';

import {GlobalState} from 'types/store';

import Constants, {ItemStatus, ModalIdentifiers} from 'utils/constants';
import {cleanUpUrlable, validateChannelUrl, getSiteURL} from 'utils/url';
import {localizeMessage} from 'utils/utils';

import {Board, BoardPatch, BoardTemplate} from '@mattermost/types/boards';
import {ChannelType, Channel} from '@mattermost/types/channels';
import {ServerError} from '@mattermost/types/errors';

import {canCreateBoards} from './selectors';

import './new_channel_modal.scss';

export function getChannelTypeFromPermissions(canCreatePublicChannel: boolean, canCreatePrivateChannel: boolean) {
    let channelType = Constants.OPEN_CHANNEL;

    if (!canCreatePublicChannel && channelType === Constants.OPEN_CHANNEL) {
        channelType = Constants.PRIVATE_CHANNEL as ChannelType;
    }

    if (!canCreatePrivateChannel && channelType === Constants.PRIVATE_CHANNEL) {
        channelType = Constants.OPEN_CHANNEL as ChannelType;
    }

    return channelType as ChannelType;
}

export function validateDisplayName(displayName: string) {
    const errors: string[] = [];

    if (displayName.length < Constants.MIN_CHANNELNAME_LENGTH) {
        errors.push(localizeMessage('channel_modal.name.longer', 'Channel names must have at least 2 characters.'));
    }

    if (displayName.length > Constants.MAX_CHANNELNAME_LENGTH) {
        errors.push(localizeMessage('channel_modal.name.shorter', 'Channel names must have maximum 64 characters.'));
    }

    return errors;
}

const enum ServerErrorId {
    CHANNEL_URL_SIZE = 'model.channel.is_valid.1_or_more.app_error',
    CHANNEL_UPDATE_EXISTS = 'store.sql_channel.update.exists.app_error',
    CHANNEL_CREATE_EXISTS = 'store.sql_channel.save_channel.exists.app_error',
    CHANNEL_PURPOSE_SIZE = 'model.channel.is_valid.purpose.app_error',
}

const NewChannelModal = () => {
    const intl = useIntl();
    const {formatMessage} = intl;

    const {id: currentTeamId, name: currentTeamName} = useSelector((state: GlobalState) => getCurrentTeam(state));
    const user = useSelector((state: GlobalState) => getCurrentUser(state));

    const canCreatePublicChannel = useSelector((state: GlobalState) => (currentTeamId ? haveICurrentChannelPermission(state, Permissions.CREATE_PUBLIC_CHANNEL) : false));
    const canCreatePrivateChannel = useSelector((state: GlobalState) => (currentTeamId ? haveICurrentChannelPermission(state, Permissions.CREATE_PRIVATE_CHANNEL) : false));
    const dispatch = useDispatch<DispatchFunc>();

    const [type, setType] = useState(getChannelTypeFromPermissions(canCreatePublicChannel, canCreatePrivateChannel));
    const [displayName, setDisplayName] = useState('');
    const [url, setURL] = useState('');
    const [purpose, setPurpose] = useState('');
    const [displayNameModified, setDisplayNameModified] = useState(false);
    const [urlModified, setURLModified] = useState(false);
    const [displayNameError, setDisplayNameError] = useState('');
    const [urlError, setURLError] = useState('');
    const [purposeError, setPurposeError] = useState('');
    const [serverError, setServerError] = useState('');

    // create a board along with the channel
    const [addBoard, setAddBoard] = useState(false);
    const [selectedBoardTemplate, setSelectedBoardTemplate] = useState<BoardTemplate | null>(null);
    const [boardTemplates, setBoardTemplates] = useState<BoardTemplate[]>([]);
    const newChannelWithBoardPulsatingDotState = useSelector((state: GlobalState) => getPreference(state, Preferences.APP_BAR, Preferences.NEW_CHANNEL_WITH_BOARD_TOUR_SHOWED, ''));
    const EMPTY_BOARD = 'empty-board';
    const focalboardEnabled = useSelector(canCreateBoards);

    const handleOnModalConfirm = async () => {
        if (!canCreate) {
            return;
        }

        const channel: Channel = {
            team_id: currentTeamId,
            name: url,
            display_name: displayName,
            purpose,
            header: '',
            type,
            create_at: 0,
            creator_id: '',
            delete_at: 0,
            group_constrained: false,
            id: '',
            last_post_at: 0,
            last_root_post_at: 0,
            scheme_id: '',
            update_at: 0,
        };

        try {
            const {data: newChannel, error} = await dispatch(createChannel(channel, ''));
            if (error) {
                onCreateChannelError(error);
                return;
            }

            handleOnModalCancel();

            // If template selected, create a new board from this template
            if (addBoard && selectedBoardTemplate) {
                try {
                    addBoardToChannel(newChannel.id);
                } catch (e: any) {
                    // eslint-disable-next-line no-console
                    console.log(e.message);
                }
            }
            dispatch(switchToChannel(newChannel));
        } catch (e) {
            onCreateChannelError({message: formatMessage({id: 'channel_modal.error.generic', defaultMessage: 'Something went wrong. Please try again.'})});
        }
    };

    const addBoardToChannel = async (channelId: string) => {
        let addBoardFn: ((board: Board) => ActionFunc) | ((templateId: string) => ActionFunc) = createBoardFromTemplate;
        let addBoardParam: string | Board = selectedBoardTemplate!.id;
        if (selectedBoardTemplate!.id === EMPTY_BOARD) {
            addBoardFn = createEmptyBoard;
            addBoardParam = {
                id: '',
                title: formatMessage({id: 'channel_modal.new_empty_board.title', defaultMessage: 'New empty board'}),
                teamId: currentTeamId,
                channelId,
                createdBy: user.id,
                type: 'P',
                deleteAt: 0,
                icon: '',
                isTemplate: false,
                minimumRole: '',
                modifiedBy: '',
                properties: {},
                showDescription: false,
                templateVersion: 0,
            } as Board;
        }
        const {data: newBoard} = await dispatch(addBoardFn(addBoardParam as Board & string));
        if (newBoard) {
            const boardPatch: BoardPatch = {
                channelId,
                deletedCardProperties: [],
                deletedProperties: [],
                updatedCardProperties: [],
                updatedProperties: {},
            };

            const {data: patchedBoard} = await dispatch(attachBoardToChannel(newBoard.id, boardPatch));

            if (patchedBoard.channelId === channelId) {
                const boardUrl = `${getSiteURL()}/boards/team/${currentTeamId}/${newBoard.id}`;
                const newBoardMsg = formatMessage(
                    {
                        id: 'channel_modal.board.newBoardCreated',
                        defaultMessage: '**{user}** created the board [{board}]({boardUrl}) and linked it to this channel.',
                    },
                    {
                        user: user.username,
                        board: newBoard.title.trim(),
                        boardUrl,
                    },
                );

                await dispatch(sendGenericPostMessage(newBoardMsg, channelId, ''));

                // show the new channel with board tour tip
                if (newChannelWithBoardPulsatingDotState === '') {
                    dispatch(setNewChannelWithBoardPreference({[Preferences.NEW_CHANNEL_WITH_BOARD_TOUR_SHOWED]: false}));
                }
            } else {
                throw new Error('There was a problem patching the board');
            }
        } else {
            throw new Error('There was a problem creating the board.');
        }
    };

    const handleOnModalCancel = () => {
        dispatch(closeModal(ModalIdentifiers.NEW_CHANNEL_MODAL));
    };

    // eslint-disable-next-line @typescript-eslint/naming-convention
    const onCreateChannelError = ({server_error_id, message}: ServerError) => {
        switch (server_error_id) {
        case ServerErrorId.CHANNEL_URL_SIZE:
            setURLError(
                formatMessage({
                    id: 'channel_modal.handleTooShort',
                    defaultMessage: 'Channel URL must be 1 or more lowercase alphanumeric characters',
                }),
            );
            break;

        case ServerErrorId.CHANNEL_UPDATE_EXISTS:
        case ServerErrorId.CHANNEL_CREATE_EXISTS:
            setURLError(
                formatMessage({
                    id: 'channel_modal.alreadyExist',
                    defaultMessage: 'A channel with that URL already exists',
                }),
            );
            break;

        case ServerErrorId.CHANNEL_PURPOSE_SIZE:
            setPurposeError(
                formatMessage({
                    id: 'channel_modal.purposeTooLong',
                    defaultMessage: 'The purpose exceeds the maximum of 250 characters',
                }),
            );
            break;

        default:
            setServerError(message);
            break;
        }
    };

    const handleOnDisplayNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        const {target: {value: displayName}} = e;

        const displayNameErrors = validateDisplayName(displayName);

        setDisplayNameError(displayNameErrors.length ? displayNameErrors[displayNameErrors.length - 1] : '');
        setDisplayName(displayName);
        setServerError('');

        if (!urlModified) {
            setURL(cleanUpUrlable(displayName));
            setURLError('');
        }
    };

    const handleOnDisplayNameBlur = () => {
        if (!displayNameModified) {
            setDisplayNameModified(true);
        }
    };

    const handleOnURLChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        const {target: {value: url}} = e;

        const cleanURL = url.toLowerCase().replace(/\s/g, '-');
        const urlErrors = validateChannelUrl(cleanURL, intl) as string[];

        setURLError(urlErrors.length ? urlErrors[urlErrors.length - 1] : '');
        setURL(cleanURL);
        setURLModified(true);
        setServerError('');
    };

    const handleOnTypeChange = (channelType: ChannelType) => {
        setType(channelType);
        setServerError('');
    };

    const handleOnPurposeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        e.preventDefault();
        const {target: {value: purpose}} = e;

        setPurpose(purpose);
        setPurposeError('');
        setServerError('');
    };

    const handleOnPurposeKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // Avoid firing the handleEnterKeyPress in GenericModal from purpose textarea
        e.stopPropagation();
    };

    const canCreate = displayName && !displayNameError && url && !urlError && type && !purposeError && !serverError && (!addBoard || (addBoard && selectedBoardTemplate !== null));

    const showNewBoardTemplateSelector = async () => {
        setAddBoard((prev) => !prev);
        if (boardTemplates.length > 0) {
            return;
        }
        const {data: templates} = await dispatch(getBoardsTemplates());

        // define a dummy template use to identify the empty board
        const emptyBoard = [{
            id: EMPTY_BOARD,
            title: 'Empty board',
            icon: '',
            description: 'Create an empty board.',
        } as BoardTemplate];
        setBoardTemplates([...templates || [], ...emptyBoard]);
    };

    const newBoardInfoIcon = () => {
        const tooltip = (
            <Tooltip
                id='new-channel-with-board-tooltip'
            >
                <>
                    <div className='title'>
                        <FormattedMessage
                            id={'channel_modal.create_board.tooltip_title'}
                            defaultMessage={'Manage your task with a board'}
                        />
                    </div>
                    <div className='description'>
                        <FormattedMessage
                            id={'channel_modal.create_board.tooltip_description'}
                            defaultMessage={'Use any of our templates to manage your tasks or start from scratch with your own!'}
                        />
                    </div>
                </>
            </Tooltip>
        );

        return (
            <OverlayTrigger
                delayShow={Constants.OVERLAY_TIME_DELAY}
                placement='right'
                overlay={tooltip}
            >
                <i className='icon-information-outline'/>
            </OverlayTrigger>
        );
    };

    return (
        <GenericModal
            id='new-channel-modal'
            className='new-channel-modal'
            modalHeaderText={formatMessage({id: 'channel_modal.modalTitle', defaultMessage: 'Create a new channel'})}
            confirmButtonText={formatMessage({id: 'channel_modal.createNew', defaultMessage: 'Create channel'})}
            cancelButtonText={formatMessage({id: 'channel_modal.cancel', defaultMessage: 'Cancel'})}
            errorText={serverError}
            isConfirmDisabled={!canCreate}
            autoCloseOnConfirmButton={false}
            compassDesign={true}
            handleConfirm={handleOnModalConfirm}
            handleEnterKeyPress={handleOnModalConfirm}
            handleCancel={handleOnModalCancel}
            onExited={handleOnModalCancel}
        >
            <div className='new-channel-modal-body'>
                <Input
                    type='text'
                    autoComplete='off'
                    autoFocus={true}
                    required={true}
                    name='new-channel-modal-name'
                    containerClassName='new-channel-modal-name-container'
                    inputClassName='new-channel-modal-name-input'
                    label={formatMessage({id: 'channel_modal.name.label', defaultMessage: 'Channel name'})}
                    placeholder={formatMessage({id: 'channel_modal.name.placeholder', defaultMessage: 'Enter a name for your new channel'})}
                    limit={Constants.MAX_CHANNELNAME_LENGTH}
                    value={displayName}
                    customMessage={displayNameModified ? {type: ItemStatus.ERROR, value: displayNameError} : null}
                    onChange={handleOnDisplayNameChange}
                    onBlur={handleOnDisplayNameBlur}
                />
                <URLInput
                    className='new-channel-modal__url'
                    base={getSiteURL()}
                    path={`${currentTeamName}/channels`}
                    pathInfo={url}
                    limit={Constants.MAX_CHANNELNAME_LENGTH}
                    shortenLength={Constants.DEFAULT_CHANNELURL_SHORTEN_LENGTH}
                    error={urlError}
                    onChange={handleOnURLChange}
                />
                <PublicPrivateSelector
                    className='new-channel-modal-type-selector'
                    selected={type}
                    publicButtonProps={{
                        title: formatMessage({id: 'channel_modal.type.public.title', defaultMessage: 'Public Channel'}),
                        description: formatMessage({id: 'channel_modal.type.public.description', defaultMessage: 'Anyone can join'}),
                        disabled: !canCreatePublicChannel,
                    }}
                    privateButtonProps={{
                        title: formatMessage({id: 'channel_modal.type.private.title', defaultMessage: 'Private Channel'}),
                        description: formatMessage({id: 'channel_modal.type.private.description', defaultMessage: 'Only invited members'}),
                        disabled: !canCreatePrivateChannel,
                    }}
                    onChange={handleOnTypeChange}
                />
                <div className='new-channel-modal-purpose-container'>
                    <textarea
                        id='new-channel-modal-purpose'
                        className={classNames('new-channel-modal-purpose-textarea', {'with-error': purposeError})}
                        placeholder={formatMessage({id: 'channel_modal.purpose.placeholder', defaultMessage: 'Enter a purpose for this channel (optional)'})}
                        rows={4}
                        maxLength={Constants.MAX_CHANNELPURPOSE_LENGTH}
                        autoComplete='off'
                        value={purpose}
                        onChange={handleOnPurposeChange}
                        onKeyDown={handleOnPurposeKeyDown}
                    />
                    {purposeError ? (
                        <div className='new-channel-modal-purpose-error'>
                            <i className='icon icon-alert-outline'/>
                            <span>{purposeError}</span>
                        </div>
                    ) : (
                        <div className='new-channel-modal-purpose-info'>
                            <span>
                                {formatMessage({id: 'channel_modal.purpose.info', defaultMessage: 'This will be displayed when browsing for channels.'})}
                            </span>
                        </div>
                    )}
                    {focalboardEnabled && <div className='add-board-to-channel'>
                        <label>
                            <input
                                type='checkbox'
                                onChange={showNewBoardTemplateSelector}
                                checked={addBoard}
                                id={'add-board-to-channel'}
                                data-testid='add-board-to-channel-check'
                            />
                            <span>
                                {formatMessage({id: 'channel_modal.create_board.title', defaultMessage: 'Create a board for this channel'})}
                            </span>
                        </label>
                        {newBoardInfoIcon()}
                    </div>}
                    {addBoard && (
                        <div className='new-channel-modal-board-template-selector'>
                            <MenuWrapper
                                id='selectBoardTemplate'
                                className='select-board-template'
                            >
                                <>
                                    <Input
                                        type='text'
                                        autoComplete='off'
                                        value={selectedBoardTemplate?.title ? `${selectedBoardTemplate.icon} ${selectedBoardTemplate.title}` : ''}
                                        name='select-board-template'
                                        containerClassName='select-board-template-container'
                                        inputClassName='select-board-template-input'
                                        label={formatMessage({id: 'channel_modal.create_board.select_template', defaultMessage: 'Select a template'})}
                                        placeholder={formatMessage({id: 'channel_modal.create_board.select_template_placeholder', defaultMessage: 'Select a template'})}
                                    />
                                    <i className='icon icon-chevron-down'/>
                                </>
                                <Menu
                                    openLeft={true}
                                    openUp={false}
                                    id='SelectBoardTemplate'
                                    className='SelectTemplateMenu'
                                    ariaLabel={formatMessage({id: 'channel_modal.create_board.select_template', defaultMessage: 'Select board template'})}
                                >
                                    <Menu.Group>
                                        {boardTemplates?.map((boardTemplate: BoardTemplate) => {
                                            let templateDescription = boardTemplate.description || ' ';
                                            if (templateDescription !== ' ' && templateDescription.length > 70) {
                                                templateDescription = boardTemplate.description.substring(0, 70) + '…';
                                            }

                                            return (
                                                <Menu.ItemAction
                                                    id={boardTemplate.title.trim().split(' ').join('_')}
                                                    onClick={() => setSelectedBoardTemplate(boardTemplate)}
                                                    icon={boardTemplate.icon || <i className='icon icon-product-boards'/>}
                                                    text={boardTemplate.title || ''}
                                                    extraText={templateDescription}
                                                    key={boardTemplate.id}
                                                />
                                            );
                                        })}
                                    </Menu.Group>
                                </Menu>
                            </MenuWrapper>
                        </div>
                    )}
                </div>
            </div>
        </GenericModal>
    );
};

export default NewChannelModal;
