// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {FileInfo} from '@mattermost/types/files';
import React from 'react';
import {shallow} from 'enzyme';
import {EmojiIndicesByAlias, EmojiIndicesByUnicode, Emojis} from 'utils/emoji';
import {PostDraft} from 'types/store/draft';
import { GroupSource} from '@mattermost/types/groups';
import {TextboxClass, TextboxElement} from '../textbox';

import {testComponentForLineBreak} from 'tests/helpers/line_break_helpers';
import {testComponentForMarkdownHotkeys} from 'tests/helpers/markdown_hotkey_helpers.js';

import Constants, {ModalIdentifiers} from 'utils/constants';
import {CustomEmoji, Emoji, SystemEmoji} from '@mattermost/types/emojis';

import AdvancedCreateComment from 'components/advanced_create_comment/advanced_create_comment';
import AdvanceTextEditor from '../advanced_text_editor/advanced_text_editor';
import {PreferenceType} from '@mattermost/types/preferences';
import {ActionResult} from 'mattermost-redux/types/actions';
import EmojiMap from 'utils/emoji_map';
import { any } from 'prop-types';
import Group from 'react-select/src/components/Group';
import { isEqual } from 'lodash';

let preventDefaultObject={
        preventDefault: jest.fn(),
        nativeEvent: null as unknown as Event,
        currentTarget: undefined as unknown as EventTarget & Element,
        target: undefined as unknown as EventTarget,
        bubbles: false,
        cancelable: false,
        defaultPrevented: false,
        eventPhase: 0,
        isTrusted: false,
        isDefaultPrevented: function (): boolean {
            throw new Error('Function not implemented.');
        },
        stopPropagation: function (): void {
            throw new Error('Function not implemented.');
        },
        isPropagationStopped: function (): boolean {
            throw new Error('Function not implemented.');
        },
        persist: function (): void {
            throw new Error('Function not implemented.');
        },
        timeStamp: 0,
        type: ''
}
describe('components/AdvancedCreateComment', () => {
    jest.useFakeTimers();
    let spiedRequestAnimationFrame:jest.SpyInstance<number, [FrameRequestCallback]>;;
    beforeEach(() => {
        spiedRequestAnimationFrame=jest.spyOn(window, 'requestAnimationFrame')
        spiedRequestAnimationFrame.mockImplementation((cb) => setTimeout(cb, 16));
    });

        afterEach(() => {
            spiedRequestAnimationFrame.mockRestore();
        });

    const currentTeamId = 'current-team-id';
    const channelId = 'g6139tbospd18cmxroesdk3kkc';
    const rootId = '';
    const latestPostId = '3498nv24823948v23m4nv34';
    const currentUserId = 'zaktnt8bpbgu8mb6ez9k64r7sa';
    let fInfo:any={
    id:'',
    user_id: ''
    };


    let emojiObject:Emoji={
        id: '',
        name: '',
        category: 'custom',
        create_at: 0,
        update_at: 0,
        delete_at: 0,
        creator_id: '',
    }
    const draftObject:any={
        message: 'Test message',
        uploadsInProgress: [],
        fileInfos: [],
    }
    const baseProps = {
        channelTimezoneCount:undefined,
        channelId :'',
        currentTeamId:'',
        currentUserId:'',
        rootId:'',
        rootDeleted: false,
        channelMembersCount: 3,
        draft: draftObject,
        enableAddButton: true,
        ctrlSend: false,
        latestPostId:'',
        locale: 'en',
        clearCommentDraftUploads: jest.fn(),
        onUpdateCommentDraft: jest.fn(),
        updateCommentDraftWithRootId: jest.fn(),
        onSubmit: jest.fn(),
        onResetHistoryIndex: jest.fn(),
        onMoveHistoryIndexBack: jest.fn(),
        onMoveHistoryIndexForward: jest.fn(),
        onEditLatestPost: jest.fn(),
        resetCreatePostRequest: jest.fn(),
        setShowPreview: jest.fn(),
        searchAssociatedGroupsForReference: jest.fn(),
        shouldShowPreview: false,
        enableEmojiPicker: true,
        enableGifPicker: true,
        enableConfirmNotificationsToChannel: true,
        maxPostSize: Constants.DEFAULT_CHARACTER_LIMIT,
        rhsExpanded: false,
        badConnection: false,
        getChannelTimezones: jest.fn().mockResolvedValue([] as ActionResult[]),
        isTimezoneEnabled: false,
        selectedPostFocussedAt: 0,
        isMarkdownPreviewEnabled: true,
        canPost: true,
        canUploadFiles: true,
        isFormattingBarHidden: false,
        useChannelMentions: true,
        getChannelMemberCountsByGroup: jest.fn(),
        useLDAPGroupMentions: true,
        useCustomGroupMentions: true,
        openModal: jest.fn(),
        messageInHistory: '',
        createPostErrorId: '',
        scrollToBottom: undefined,
        onHeightChange: undefined,
        focusOnMount: false,
        isThreadView: false,

        emitShortcutReactToLastPostFrom:function (location: string): void {
            throw new Error('Function not implemented.');
        } ,

        groupsWithAllowReference:null,

         channelMemberCountsByGroup:{},
          savePreferences:function (userId: string, preferences: PreferenceType[]): ActionResult {
            throw new Error('Function not implemented.');
        } ,
        emojiMap:new EmojiMap(new Map<string, CustomEmoji>)
                

    };

    
    test('should match snapshot, empty comment', () => {
        const draft :any= baseProps.draft;
        const enableAddButton = false;
        const ctrlSend = true;
        const props = {...baseProps, draft, enableAddButton, ctrlSend};

        const wrapper = shallow(
            <AdvancedCreateComment {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, comment with message', () => {
        const clearCommentDraftUploads = jest.fn();
        const onResetHistoryIndex = jest.fn();
        const getChannelMemberCountsByGroup = jest.fn();
        const draft:any = {
            message: 'Test message',
            uploadsInProgress: [],
            fileInfos: [],
        };
        const ctrlSend = true;
        const props = {...baseProps, ctrlSend, draft, clearCommentDraftUploads, onResetHistoryIndex, getChannelMemberCountsByGroup};

        const wrapper = shallow(
            <AdvancedCreateComment {...props}/>,
        );

        // should clear draft uploads on mount
        expect(clearCommentDraftUploads).toHaveBeenCalled();

        // should reset message history index on mount
        expect(onResetHistoryIndex).toHaveBeenCalled();

        // should load channel member counts on mount
        expect(getChannelMemberCountsByGroup).not.toHaveBeenCalled();

        expect(wrapper).toMatchSnapshot();
    });

    test('should call searchAssociatedGroupsForReference if there is one mention in the draft', () => {
        const draft:any = {
            message: '@group',
            uploadsInProgress: [],
            fileInfos: [],

        };

        const searchAssociatedGroupsForReference = jest.fn();
        const props = {...baseProps, draft, searchAssociatedGroupsForReference};

        shallow(<AdvancedCreateComment {...props}/>);

        expect(searchAssociatedGroupsForReference).toHaveBeenCalled();
    });

    test('should call getChannelMemberCountsByGroup if there is more than one mention in the draft', () => {
        const draft:any = {
            message: '@group @othergroup',
            uploadsInProgress: [],
            fileInfos: [], 
        };
        const getChannelMemberCountsByGroup = jest.fn();
        const props = {...baseProps, draft, getChannelMemberCountsByGroup};

        shallow(<AdvancedCreateComment {...props}/>);

        expect(getChannelMemberCountsByGroup).toHaveBeenCalled();
    });

    test('should not call getChannelMemberCountsByGroup, without group mentions permission or license', () => {
        const useLDAPGroupMentions = false;
        const useCustomGroupMentions = false;
        const draft:any = {
            message: '@group @othergroup',
            uploadsInProgress: [],
            fileInfos: [],
            
        };

        const getChannelMemberCountsByGroup = jest.fn();
        const props = {...baseProps, useLDAPGroupMentions, useCustomGroupMentions, getChannelMemberCountsByGroup, draft};

        shallow(<AdvancedCreateComment {...props}/>);

        // should not load channel member counts on mount without useGroupmentions
        expect(getChannelMemberCountsByGroup).not.toHaveBeenCalled();
    });

    test('should match snapshot, non-empty message and uploadsInProgress + fileInfos', () => {
        const draft :any= {
            message: 'Test message',
            uploadsInProgress: [],
            fileInfos: [],
            
        };
        const props = {...baseProps, draft};

        const wrapper = shallow(
            <AdvancedCreateComment {...props}/>,
        );

        wrapper.setState({draft});
        expect(wrapper).toMatchSnapshot();
    });

    test('should correctly change state when toggleEmojiPicker is called', () => {
        const wrapper = shallow<AdvancedCreateComment>(
            <AdvancedCreateComment {...baseProps}/>,
        );

        wrapper.instance().toggleEmojiPicker();
        expect(wrapper.state().showEmojiPicker).toBe(true);

        wrapper.instance().toggleEmojiPicker();
        expect(wrapper.state().showEmojiPicker).toBe(false);
    });

    test('should correctly change state when hideEmojiPicker is called', () => {
        const wrapper = shallow<AdvancedCreateComment>(
            <AdvancedCreateComment {...baseProps}/>,
        );

        wrapper.instance().hideEmojiPicker();
        expect(wrapper.state().showEmojiPicker).toBe(false);
    });

        test('should correctly update draft when handleEmojiClick is called', () => {
            const onUpdateCommentDraft = jest.fn();
            const draft:any = baseProps.draft;
            const enableAddButton = false;
            const props = {...baseProps, draft, onUpdateCommentDraft, enableAddButton};

            const wrapper = shallow<AdvancedCreateComment>(
                <AdvancedCreateComment {...props}/>,
            );
                
        const mockImpl = () => {
            return {
                setSelectionRange: jest.fn(),
                getBoundingClientRect: jest.fn(mockTop),
                focus: jest.fn(),
            };
        };

        const mockTop = () => {
            return document.createElement('div');
        };
        
        emojiObject.name='smile'
        wrapper.instance().handleEmojiClick(emojiObject);

        jest.advanceTimersByTime(Constants.SAVE_DRAFT_TIMEOUT);
        expect(onUpdateCommentDraft).toHaveBeenCalled();

        // Empty message case
        expect(onUpdateCommentDraft.mock.calls[0][0]).toEqual(
            expect.objectContaining({message: ':smile: '}),
        );
        expect(wrapper.state().draft!.message).toBe(':smile: ');

        wrapper.setState({draft: {...baseProps.draft,message: 'test'},
            caretPosition: 'test'.length, // cursor is at the end
        });

        emojiObject.name="smile"
        wrapper.instance().handleEmojiClick(emojiObject);

        // Message with no space at the end
        jest.advanceTimersByTime(Constants.SAVE_DRAFT_TIMEOUT);
        expect(onUpdateCommentDraft.mock.calls[1][0]).toEqual(
            expect.objectContaining({message: 'test :smile:  '}),
        );
        expect(wrapper.state().draft!.message).toBe('test :smile:  ');

        wrapper.setState({draft: {...baseProps.draft,message: 'test '},
            caretPosition: 'test '.length, // cursor is at the end
        });
        wrapper.instance().handleEmojiClick(emojiObject);

        // Message with space at the end
        jest.advanceTimersByTime(Constants.SAVE_DRAFT_TIMEOUT);
        expect(onUpdateCommentDraft.mock.calls[2][0]).toEqual(
            expect.objectContaining({message: 'test  :smile:  '}),
        );
        expect(wrapper.state().draft!.message).toBe('test  :smile:  ');

        expect(wrapper.state().showEmojiPicker).toBe(false);
    });

    test('handlePostError should update state with the correct error', () => {
        const wrapper = shallow<AdvancedCreateComment>(
            <AdvancedCreateComment {...baseProps}/>,
        );

        wrapper.instance().handlePostError('test error 1');
        expect(wrapper.state().postError).toBe('test error 1');

        wrapper.instance().handlePostError('test error 2');
        expect(wrapper.state().postError).toBe('test error 2');
    });

    test('handleUploadError should update state with the correct error', () => {
        const updateCommentDraftWithRootId = jest.fn();
        const draft:any = {
            message: 'Test message',
            uploadsInProgress: ['1', '2', '3'],
            fileInfos: [fInfo, fInfo, fInfo],
            
        };
        const props = {...baseProps, draft, updateCommentDraftWithRootId};

        const wrapper = shallow<AdvancedCreateComment>(
            <AdvancedCreateComment {...props}/>,
        );

        const instance = wrapper.instance();

        const testError1 = 'test error 1';
        wrapper.setState({draft});
        instance.DraftsForPost[props.rootId] = draft;
        instance.handleUploadError(testError1, 1, undefined, props.rootId);

        expect(updateCommentDraftWithRootId).toHaveBeenCalled();
        expect(updateCommentDraftWithRootId.mock.calls[0][0]).toEqual(props.rootId);
        expect(updateCommentDraftWithRootId.mock.calls[0][1]).toEqual(
            expect.objectContaining({uploadsInProgress: ["2", "3"]}),
        );
        expect(wrapper.state().serverError!.message).toBe(testError1);
        expect(wrapper.state().draft!.uploadsInProgress).toEqual(["2", "3"]);

        // clientId = -1
        const testError2 = 'test error 2';
        instance.handleUploadError(testError2, -1, undefined, props.rootId);

        // should not call onUpdateCommentDraft
        expect(updateCommentDraftWithRootId.mock.calls.length).toBe(1);
        expect(wrapper.state().serverError!.message).toBe(testError2);
    });

    test('should call openModal when showPostDeletedModal is called', () => {
        const wrapper = shallow<AdvancedCreateComment>(
            <AdvancedCreateComment {...baseProps}/>,
        );

        wrapper.instance().showPostDeletedModal();

        expect(baseProps.openModal).toHaveBeenCalledTimes(1);
    });

    test('handleUploadStart should update comment draft correctly', () => {
        const onUpdateCommentDraft = jest.fn();
        const draft:any = {
            message: 'Test message',
            uploadsInProgress: ['1', '2', '3'],
            fileInfos: [fInfo, fInfo, fInfo],
            
        };
        const props = {...baseProps, onUpdateCommentDraft, draft};

        const wrapper = shallow<AdvancedCreateComment>(
            <AdvancedCreateComment {...props}/>,
        );

        const focusTextbox = jest.fn();
        wrapper.setState({draft});
        wrapper.instance().focusTextbox = focusTextbox;
        wrapper.instance().handleUploadStart(['4', '5']);

        expect(onUpdateCommentDraft).toHaveBeenCalled();
        expect(onUpdateCommentDraft.mock.calls[0][0]).toEqual(
            expect.objectContaining({uploadsInProgress: ["1", "2", "3", "4", "5"]}),
        );
        
        const result = isEqual(wrapper.state().draft!.uploadsInProgress,['1', '2', '3', '4', '5'])
        expect(result);
        expect(focusTextbox).toHaveBeenCalled();
    });

    test('handleFileUploadComplete should update comment draft correctly', () => {
        const updateCommentDraftWithRootId = jest.fn();
        const fileInfos = [{id: '1', name: 'aaa', create_at: 100}, {id: '2', name: 'bbb', create_at: 200}];
        const draft:any = {
            message: 'Test message',
            uploadsInProgress: ['1', '2', '3'],
            fileInfos: [fInfo, fInfo, fInfo],
            
        };
        const props = {...baseProps, updateCommentDraftWithRootId, draft};

        const wrapper = shallow<AdvancedCreateComment>(
            <AdvancedCreateComment {...props}/>,
        );

        const instance = wrapper.instance();
        wrapper.setState({draft});
        instance.DraftsForPost[props.rootId] = draft;

        const fInfo1=fInfo;
        fInfo1.id='3'; fInfo1.name= 'ccc', fInfo1.create_at=300;
        const uploadCompleteFileInfo = [fInfo1];
        const expectedNewFileInfos = fileInfos.concat(uploadCompleteFileInfo);
        instance.handleFileUploadComplete(uploadCompleteFileInfo, ['3'], '', props.rootId);

        jest.advanceTimersByTime(Constants.SAVE_DRAFT_TIMEOUT);
        expect(updateCommentDraftWithRootId).toHaveBeenCalled();
        expect(updateCommentDraftWithRootId.mock.calls[0][0]).toEqual(props.rootId);
        expect(updateCommentDraftWithRootId.mock.calls[0][1]).toEqual(
            expect.objectContaining({uploadsInProgress: ['1', '2'], fileInfos: expectedNewFileInfos}),
        );

        expect(wrapper.state().draft!.uploadsInProgress).toEqual(['1', '2']);
        expect(wrapper.state().draft!.fileInfos).toEqual(expectedNewFileInfos);
    });

    test('should open PostDeletedModal when createPostErrorId === api.post.create_post.root_id.app_error', () => {
        const onUpdateCommentDraft = jest.fn();

        const fInfo1:FileInfo = fInfo;
        fInfo1.id='1';
        fInfo1.name='aaa';
        fInfo1.create_at=100;

        const fInfo2:FileInfo=fInfo;
        fInfo2.id='2';
        fInfo2.name='bbb';
        fInfo2.create_at=200;


        
        const draft:any = {
            message: 'Test message',
            fileInfos: [fInfo1,fInfo2],
            uploadsInProgress: ['1', '2', '3'],
            
        };
        const props = {...baseProps, onUpdateCommentDraft, draft};

        const wrapper = shallow<AdvancedCreateComment>(
            <AdvancedCreateComment {...props}/>,
        );

        wrapper.setProps({createPostErrorId: 'api.post.create_post.root_id.app_error'});

        expect(props.openModal).toHaveBeenCalledTimes(1);
        expect(props.openModal.mock.calls[0][0]).toMatchObject({
            modalId: ModalIdentifiers.POST_DELETED_MODAL,
        });
    });

    test('should open PostDeletedModal when message is submitted to deleted root', () => {
        const onUpdateCommentDraft = jest.fn();

        const fInfo1:FileInfo = fInfo;
        fInfo1.id='1';
        fInfo1.name='aaa';
        fInfo1.create_at=100;

        const fInfo2:FileInfo=fInfo;
        fInfo2.id='2';
        fInfo2.name='bbb';
        fInfo2.create_at=200;


        const draft :any= {
            message: 'Test message',
            uploadsInProgress: ['1', '2', '3'],
            fileInfos: [fInfo1, fInfo2],
          
        };
        const props = {...baseProps, onUpdateCommentDraft, draft};

        const wrapper = shallow<AdvancedCreateComment>(
            <AdvancedCreateComment {...props}/>,
        );

        wrapper.setProps({rootDeleted: true});
        wrapper.instance().handleSubmit({
            preventDefault: jest.fn(),
            nativeEvent: null as unknown as Event,
            currentTarget: undefined as unknown as EventTarget & Element,
            target: undefined as unknown as EventTarget,
            bubbles: false,
            cancelable: false,
            defaultPrevented: false,
            eventPhase: 0,
            isTrusted: false,
            isDefaultPrevented: function (): boolean {
                throw new Error('Function not implemented.');
            },
            stopPropagation: function (): void {
                throw new Error('Function not implemented.');
            },
            isPropagationStopped: function (): boolean {
                throw new Error('Function not implemented.');
            },
            persist: function (): void {
                throw new Error('Function not implemented.');
            },
            timeStamp: 0,
            type: ''
        });

        expect(props.openModal).toHaveBeenCalledTimes(1);
        expect(props.openModal.mock.calls[0][0]).toMatchObject({
            modalId: ModalIdentifiers.POST_DELETED_MODAL,
        });
    });

    describe('focusTextbox', () => {
        const fInfo1:FileInfo = fInfo;
        fInfo1.id='1';
        fInfo1.name='aaa';
        fInfo1.create_at=100;

        const fInfo2:FileInfo=fInfo;
        fInfo2.id='2';
        fInfo2.name='bbb';
        fInfo2.create_at=200;


        const draft:any = {
            message: 'Test message',
            uploadsInProgress: ['1', '2', '3'],
            fileInfos: [fInfo1, fInfo2],
        };
        it('is called when rootId changes', () => {
            const props = {...baseProps, draft};
            const wrapper = shallow<AdvancedCreateComment>(
                <AdvancedCreateComment {...props}/>,
            );

            const focusTextbox = jest.fn();
            wrapper.instance().focusTextbox = focusTextbox;
            
            const newProps = {
                ...props,
                rootId: 'testid123',
                showEmojiPicker:false,
                  renderScrollbar:false, 
                  scrollbarWidth:0,
                  errorClass:'', 
                  serverError:null, 
                  showFormat:false,
                  uploadsProgressPercent:{
                    "clientId":fInfo
                  }
            };

            // Note that setProps doesn't actually trigger componentDidUpdate
            wrapper.setProps(newProps);
            wrapper.instance().componentDidUpdate(props, newProps);
            expect(focusTextbox).toHaveBeenCalled();
        });

        it('is called when selectPostFocussedAt changes', () => {
            const props = {...baseProps, draft, selectedPostFocussedAt: 1000};
            const wrapper = shallow<AdvancedCreateComment>(
                <AdvancedCreateComment {...props}/>,
            );

            const focusTextbox = jest.fn();
            wrapper.instance().focusTextbox = focusTextbox;

            const newProps = {
                ...props,
                selectedPostFocussedAt: 2000,
                
            };
            
            const additionalProps ={showEmojiPicker:false,
                renderScrollbar:false, 
                scrollbarWidth:0,
                errorClass:'', 
                serverError:null, 
                showFormat:false,
                uploadsProgressPercent:{
                  "clientId":fInfo
                }}
            // Note that setProps doesn't actually trigger componentDidUpdate
            wrapper.setProps(newProps);
            wrapper.instance().componentDidUpdate(props,{...props,...additionalProps});
            expect(focusTextbox).toHaveBeenCalled();
        });

        it('is not called when rootId and selectPostFocussedAt have not changed', () => {
            const props = {...baseProps, draft, selectedPostFocussedAt: 1000};
            const wrapper = shallow<AdvancedCreateComment>(
                <AdvancedCreateComment {...props}/>,
            );

            const focusTextbox = jest.fn();
            wrapper.instance().focusTextbox = focusTextbox;
            wrapper.instance().handleBlur();

            // Note that setProps doesn't actually trigger componentDidUpdate
            wrapper.setProps(props);
            const additionalProps={
                channelTimezoneCount:undefined as any,
                showEmojiPicker:false,
                  renderScrollbar:false, 
                  scrollbarWidth:0,
                  errorClass:'', 
                  serverError:null, 
                  showFormat:false,
                  uploadsProgressPercent:{
                    "clientId":fInfo
                  }
            }
            wrapper.instance().componentDidUpdate(props, {...props,...additionalProps});
            expect(focusTextbox).not.toHaveBeenCalled();
        });
    });

    test('handleChange should update comment draft correctly', () => {
        const fInfo1:FileInfo = fInfo;
    
        const draft:any = {
            message: 'Test message',
            uploadsInProgress: ['1', '2', '3'],
            fileInfos: [fInfo, fInfo,fInfo],
            
        };
        const scrollToBottom = jest.fn();
        const props = {...baseProps, draft, scrollToBottom};

        const wrapper = shallow<AdvancedCreateComment>(
            <AdvancedCreateComment
                {...props}
            />,
        );

        const testMessage = 'new msg';
        let eventObject :  React.ChangeEvent<TextboxElement>
        let targetObject:any={
            target: {
            value: testMessage,
        }}
        wrapper.instance().handleChange(targetObject);

        // The callback won't we called until after a short delay
        expect(baseProps.onUpdateCommentDraft).not.toHaveBeenCalled();

        jest.runOnlyPendingTimers();
        jest.advanceTimersByTime(Constants.SAVE_DRAFT_TIMEOUT);
        expect(baseProps.onUpdateCommentDraft).toHaveBeenCalled();
        expect(baseProps.onUpdateCommentDraft.mock.calls[0][0]).toEqual(
            expect.objectContaining({message: testMessage}),
        );
        expect(wrapper.state().draft!.message).toBe(testMessage);
        expect(scrollToBottom).toHaveBeenCalled();
    });

    it('handleChange should throw away invalid command error if user resumes typing', async () => {
        const onUpdateCommentDraft = jest.fn();

        const error = new Error('No command found');
        error.server_error_id = 'api.command.execute_command.not_found.app_error';
        const onSubmit = jest.fn(() => Promise.reject(error));
        
        const draft:any = {
            message: '/fakecommand other text',
            uploadsInProgress: ['1', '2', '3'],
            fileInfos: [fInfo, fInfo,fInfo],
            
        };
    
        const props = {...baseProps, onUpdateCommentDraft, draft, onSubmit};

        const wrapper = shallow<AdvancedCreateComment>(
            <AdvancedCreateComment {...props}/>,
        );

        await wrapper.instance().handleSubmit(preventDefaultObject);

        expect(onSubmit).toHaveBeenCalledWith({
            message: '/fakecommand other text',
            uploadsInProgress: [],
            fileInfos:[fInfo,fInfo,fInfo],
        }, {ignoreSlash: false});

        let targetObject: any ={   target: {
            value: 'some valid text',
    }}
        wrapper.instance().handleChange(targetObject);

        wrapper.instance().handleSubmit({
            preventDefault: jest.fn(),
            nativeEvent: null as unknown as Event,
            currentTarget: undefined as unknown as EventTarget & Element,
            target: undefined as unknown as EventTarget,
            bubbles: false,
            cancelable: false,
            defaultPrevented: false,
            eventPhase: 0,
            isTrusted: false,
            isDefaultPrevented: function (): boolean {
                throw new Error('Function not implemented.');
            },
            stopPropagation: function (): void {
                throw new Error('Function not implemented.');
            },
            isPropagationStopped: function (): boolean {
                throw new Error('Function not implemented.');
            },
            persist: function (): void {
                throw new Error('Function not implemented.');
            },
            timeStamp: 0,
            type: ''
        });

        expect(onSubmit).toHaveBeenCalledWith({
            message: 'some valid text',
            uploadsInProgress: [],
            fileInfos:[fInfo,fInfo,fInfo],
        }, {ignoreSlash: false});
    });

    test('should scroll to bottom when uploadsInProgress increase', () => {

        const draft:any = {
            message: 'Test message',
            uploadsInProgress: ['1', '2', '3'],
            fileInfos: [fInfo, fInfo,fInfo],
            
           
        };
        const scrollToBottom = jest.fn();
        const props = {...baseProps, draft, scrollToBottom};

        const wrapper = shallow<AdvancedCreateComment>(
            <AdvancedCreateComment
                {...props}
            />,
        );

        wrapper.setState({draft: {...draft, uploadsInProgress: ['1', '2', '3', '4']}});
        expect(scrollToBottom).toHaveBeenCalled();
    });

    test('handleSubmit should call onSubmit prop', () => {
        const onSubmit = jest.fn();
       const draft:any = {
            message: 'Test message',
            uploadsInProgress: ['1', '2', '3'],
            fileInfos: [fInfo, fInfo,fInfo],
        
        };
        const props = {...baseProps, draft, onSubmit};

        const wrapper = shallow<AdvancedCreateComment>(
            <AdvancedCreateComment {...props}/>,
        );

        const preventDefault = jest.fn();
        wrapper.instance().handleSubmit(preventDefaultObject);
        expect(onSubmit).toHaveBeenCalled();
        expect(preventDefault).toHaveBeenCalled();
    });

    describe('handleSubmit', () => {
        let onSubmit: jest.Mock<any, any>;
        let preventDefault: jest.Mock<any, any>;

        beforeEach(() => {
            onSubmit = jest.fn();
            preventDefault = jest.fn();
        });

        ['channel', 'all', 'here'].forEach((mention) => {
            describe(`should not show Confirm Modal for @${mention} mentions`, () => {
                it('when channel member count too low', () => {
                    const props = {
                        ...baseProps,
                        draft: {
                            ...baseProps.draft,
                            message: `Test message @${mention}`,
                            uploadsInProgress: [],
                            fileInfos: [fInfo,fInfo,fInfo],
                        },
                        onSubmit: (draft: PostDraft, options: {ignoreSlash: boolean}) : void=>{
                            
                        },
                        channelMembersCount: 1,
                        enableConfirmNotificationsToChannel: true,
                    };

                    const wrapper = shallow<AdvancedCreateComment>(
                        <AdvancedCreateComment {...props}/>,
                    );

                    wrapper.instance().handleSubmit(preventDefaultObject);
                    expect(onSubmit).toHaveBeenCalled();
                    expect(preventDefault).toHaveBeenCalled();
                    expect(props.openModal).not.toHaveBeenCalled();
                });

                it('when feature disabled', () => {
                    const props = {
                        ...baseProps,
                        draft: {
                            ...baseProps.draft,
                            message: `Test message @${mention}`,
                            uploadsInProgress: [],
                            fileInfos: [fInfo,fInfo,fInfo],
                        },
                        onSubmit:(draft: PostDraft, options: { ignoreSlash: boolean }): void => {
                            // Function body implementation goes here
                            console.log('onSubmit called');
                            console.log('Draft:', draft);
                            console.log('Options:', options);
                          },
                        channelMembersCount: 8,
                        enableConfirmNotificationsToChannel: false,
                    };

                    const wrapper = shallow<AdvancedCreateComment>(
                        <AdvancedCreateComment {...props}/>,
                    );

                    wrapper.instance().handleSubmit(preventDefaultObject);
                    expect(onSubmit).toHaveBeenCalled();
                    expect(preventDefault).toHaveBeenCalled();
                    expect(props.openModal).not.toHaveBeenCalled();
                });

                it('when no mention', () => {
                        const props = {
                            ...baseProps,
                            draft: {
                                ...baseProps.draft,
                                message: `Test message ${mention}`,
                                uploadsInProgress: [],
                                fileInfos: [fInfo,fInfo,fInfo],
                                
                            },
                            onSubmit:(draft: PostDraft, options: { ignoreSlash: boolean }): void => {
                                // Function body implementation goes here
                                console.log('onSubmit called');
                                console.log('Draft:', draft);
                                console.log('Options:', options);
                              },
                            channelMembersCount: 8,
                            enableConfirmNotificationsToChannel: true,
                        };

                    const wrapper = shallow<AdvancedCreateComment>(
                        <AdvancedCreateComment {...props}/>,
                    );

                    wrapper.instance().handleSubmit(preventDefaultObject);
                    expect(onSubmit).toHaveBeenCalled();
                    expect(preventDefault).toHaveBeenCalled();
                    expect(props.openModal).not.toHaveBeenCalled();
                });

                it('when user has insufficient permissions', () => {
                    const props = {
                        ...baseProps,
                        useChannelMentions: false,
                        draft: {
                            ...baseProps.draft,
                            message: `Test message @${mention}`,
                            uploadsInProgress: [],
                            fileInfos: [fInfo,fInfo,fInfo],
                            
                        },
                        onSubmit:(draft: PostDraft, options: { ignoreSlash: boolean }): void => {
                            // Function body implementation goes here
                            console.log('onSubmit called');
                            console.log('Draft:', draft);
                            console.log('Options:', options);
                          },
                        channelMembersCount: 8,
                        enableConfirmNotificationsToChannel: true,
                    };

                    const wrapper = shallow<AdvancedCreateComment>(
                        <AdvancedCreateComment {...props}/>,
                    );

                    wrapper.instance().handleSubmit(preventDefaultObject);
                    expect(onSubmit).toHaveBeenCalled();
                    expect(preventDefault).toHaveBeenCalled();
                    expect(props.openModal).not.toHaveBeenCalled();
                });
            });

            it(`should show Confirm Modal for @${mention} mentions when needed`, () => {
                const props = {
                    ...baseProps,
                    draft: {
                        ...baseProps.draft,
                        message: `Test message @${mention}`,
                        uploadsInProgress: [],
                        fileInfos: [fInfo,fInfo,fInfo],
                       
                    },
                    onSubmit:(draft: PostDraft, options: { ignoreSlash: boolean }): void => {
                        // Function body implementation goes here
                        console.log('onSubmit called');
                        console.log('Draft:', draft);
                        console.log('Options:', options);
                      },
                    channelMembersCount: 8,
                    enableConfirmNotificationsToChannel: true,
                };

                const wrapper = shallow<AdvancedCreateComment>(
                    <AdvancedCreateComment {...props}/>,
                );

                wrapper.instance().handleSubmit(preventDefaultObject);
                expect(onSubmit).not.toHaveBeenCalled();
                expect(preventDefault).toHaveBeenCalled();
                expect(props.openModal).toHaveBeenCalled();
            });

            it(`should show Confirm Modal for @${mention} mentions when needed and timezone notification`, async () => {
                const props = {
                    ...baseProps,
                    draft: {
                        ...baseProps.draft,
                        message: `Test message @${mention}`,
                        uploadsInProgress: [],
                        fileInfos: [fInfo,fInfo,fInfo],
                      
                    },
                    onSubmit:(draft: PostDraft, options: { ignoreSlash: boolean }): void => {
                        // Function body implementation goes here
                        console.log('onSubmit called');
                        console.log('Draft:', draft);
                        console.log('Options:', options);
                      },
                    isTimezoneEnabled: true,
                    channelMembersCount: 8,
                    enableConfirmNotificationsToChannel: true,
                };

                const wrapper = shallow<AdvancedCreateComment>(
                    <AdvancedCreateComment {...props}/>,
                );

                await wrapper.instance().handleSubmit(preventDefaultObject);
                wrapper.setState({channelTimezoneCount: 4});

                expect(onSubmit).not.toHaveBeenCalled();
                expect(preventDefault).toHaveBeenCalled();
                expect(wrapper.state('channelTimezoneCount')).toBe(4);
                expect(baseProps.getChannelTimezones).toHaveBeenCalledTimes(1);
                expect(props.openModal).toHaveBeenCalled();
            });

            it(`should show Confirm Modal for @${mention} mentions when needed and no timezone notification`, async () => {
                const props = {
                    ...baseProps,
                    draft: {
                        ...baseProps.draft,
                        message: `Test message @${mention}`,
                        uploadsInProgress: [],
                        fileInfos: [fInfo,fInfo,fInfo],
                      
                    },
                    onSubmit:(draft: PostDraft, options: { ignoreSlash: boolean }): void => {
                        // Function body implementation goes here
                        console.log('onSubmit called');
                        console.log('Draft:', draft);
                        console.log('Options:', options);
                      },
                    isTimezoneEnabled: true,
                    channelMembersCount: 8,
                    enableConfirmNotificationsToChannel: true,
                };

                const wrapper = shallow<AdvancedCreateComment>(
                    <AdvancedCreateComment {...props}/>,
                );

                await wrapper.instance().handleSubmit(preventDefaultObject);
                wrapper.setState({channelTimezoneCount: 0});

                expect(onSubmit).not.toHaveBeenCalled();
                expect(preventDefault).toHaveBeenCalled();
                expect(wrapper.state('channelTimezoneCount')).toBe(0);
                expect(baseProps.getChannelTimezones).toHaveBeenCalledTimes(1);
                expect(props.openModal).toHaveBeenCalled();
            });
        });

    
        it('should show Confirm Modal for @group mention when needed and no timezone notification', async () => {
            const props = {
                ...baseProps,
                draft: {
                    ...baseProps.draft,
                    message: 'Test message @developers',
                    uploadsInProgress: [],
                    fileInfos: [fInfo,fInfo,fInfo],
                    
                },
               
                groupsWithAllowReference: new Map([
                    ['@developers', {
                        id: 'developers',
                        name: 'developers',
                        display_name: '',
                        description: '',
                        source: '',
                        remote_id: null,
                        create_at: 0,
                        update_at: 0,
                        delete_at: 0,
                        has_syncables: false,
                        member_count: 0,
                        scheme_admin: false,
                        allow_reference: false,
                    }],
                ]),
                channelMemberCountsByGroup: {
                    developers: {
                        channel_member_count: 10,
                        channel_member_timezones_count: 0,
                        group_id:''
                    },
                },
                isTimezoneEnabled: false,
                channelMembersCount: 8,
                useChannelMentions: true,
                enableConfirmNotificationsToChannel: true,
            };

            const wrapper = shallow<AdvancedCreateComment>(
                <AdvancedCreateComment {...props}/>,
            );
            const showNotifyAllModal = wrapper.instance().showNotifyAllModal;
            wrapper.instance().showNotifyAllModal = jest.fn((mentions, channelTimezoneCount, memberNotifyCount) => showNotifyAllModal(mentions, channelTimezoneCount, memberNotifyCount));

            await wrapper.instance().handleSubmit(preventDefaultObject);

            expect(onSubmit).not.toHaveBeenCalled();
            expect(preventDefault).toHaveBeenCalled();
            expect(baseProps.getChannelTimezones).toHaveBeenCalledTimes(0);
            expect(wrapper.instance().showNotifyAllModal).toHaveBeenCalledWith(['@developers'], 0, 10);
            expect(props.openModal).toHaveBeenCalled();
        });

        it('should show Confirm Modal for @group mentions when needed and no timezone notification', async () => {
            const additionalProperties={
                display_name:'', description:'', source:'', remote_id:'',
                 update_at:0, delete_at:0, has_syncables:false,
                 create_at:0, member_count:0, scheme_admin:false, allow_reference:false
            }
            const props = {
                ...baseProps,
                draft: {
                    ...baseProps.draft,
                    message: 'Test message @developers @boss @love @you @software-developers',
                    uploadsInProgress: [],
                    fileInfos:[fInfo,fInfo,fInfo],
                
                },
                groupsWithAllowReference: new Map([
                    ['@developers', {
                        id: 'developers',
                        name: 'developers',
                        ...additionalProperties
                    }],
                    ['@boss', {
                        id: 'boss',
                        name: 'boss',
                        ...additionalProperties
                    }],
                    ['@love', {
                        id: 'love',
                        name: 'love',
                        ...additionalProperties
                    }],
                    ['@you', {
                        id: 'you',
                        name: 'you',
                        ...additionalProperties
                    }],
                    ['@software-developers', {
                        id: 'softwareDevelopers',
                        name: 'software-developers',
                        ...additionalProperties
                    }],
                ]),
                channelMemberCountsByGroup: {
                    developers: {
                        channel_member_count: 10,
                        channel_member_timezones_count: 0,
                        group_id:''
                    },
                    boss: {
                        channel_member_count: 20,
                        channel_member_timezones_count: 0,
                        group_id:''

                    },
                    love: {
                        channel_member_count: 30,
                        channel_member_timezones_count: 0,
                        group_id:''

                    },
                    you: {
                        channel_member_count: 40,
                        channel_member_timezones_count: 0,
                        group_id:''

                    },
                    softwareDevelopers: {
                        channel_member_count: 5,
                        channel_member_timezones_count: 0,
                        group_id:''

                    },
                },
                isTimezoneEnabled: false,
                channelMembersCount: 8,
                useChannelMentions: true,
                enableConfirmNotificationsToChannel: true,
            };

            const wrapper = shallow<AdvancedCreateComment>(
                <AdvancedCreateComment {...props}/>,
            );

            const showNotifyAllModal = wrapper.instance().showNotifyAllModal;
            wrapper.instance().showNotifyAllModal = jest.fn((mentions, channelTimezoneCount, memberNotifyCount) => showNotifyAllModal(mentions, channelTimezoneCount, memberNotifyCount));

            await wrapper.instance().handleSubmit(preventDefaultObject);

            expect(onSubmit).not.toHaveBeenCalled();
            expect(preventDefault).toHaveBeenCalled();
            expect(baseProps.getChannelTimezones).toHaveBeenCalledTimes(0);
            expect(wrapper.instance().showNotifyAllModal).toHaveBeenCalledWith(['@developers', '@boss', '@love', '@you', '@software-developers'], 0, 40);
            expect(props.openModal).toHaveBeenCalled();
        });
    
        it('should show Confirm Modal for @group mention with timezone enabled', async () => {
           let additionalGroupProperties:any={
                display_name:"",
                description:"",
                source:"",
                remote_id:"",
                
           }
            const props = {
                ...additionalGroupProperties,
                ...baseProps,
                draft: {
                    ...baseProps.draft,
                    message: 'Test message @developers',
                    uploadsInProgress: [],
                    fileInfos:[fInfo,fInfo,fInfo],
                    
                },
                groupsWithAllowReference: new Map([
                    ['@developers', {
                        id: 'developers',
                        name: 'developers',
                    }],
                ]),
                channelMemberCountsByGroup: {
                    developers: {
                        channel_member_count: 10,
                        channel_member_timezones_count: 5,
                    },
                },
                isTimezoneEnabled: true,
                channelMembersCount: 8,
                useChannelMentions: true,
                enableConfirmNotificationsToChannel: true,
            };

            const wrapper = shallow<AdvancedCreateComment>(
                <AdvancedCreateComment {...props}/>,
            );

            const showNotifyAllModal = wrapper.instance().showNotifyAllModal;
            wrapper.instance().showNotifyAllModal = jest.fn((mentions, channelTimezoneCount, memberNotifyCount) => showNotifyAllModal(mentions, channelTimezoneCount, memberNotifyCount));

            await wrapper.instance().handleSubmit(preventDefaultObject);

            expect(onSubmit).not.toHaveBeenCalled();
            expect(preventDefault).toHaveBeenCalled();
            expect(baseProps.getChannelTimezones).toHaveBeenCalledTimes(0);
            expect(wrapper.instance().showNotifyAllModal).toHaveBeenCalledWith(['@developers'], 5, 10);
            expect(props.openModal).toHaveBeenCalled();
        });

        it('should allow to force send invalid slash command as a message', async () => {
            const error = new Error('No command found');
            error.server_error_id = 'api.command.execute_command.not_found.app_error';
            const onSubmitWithError = jest.fn(() => Promise.reject(error));

            const props = {
                ...baseProps,
                draft: {
                    ...baseProps.draft,
                    message: '/fakecommand other text',
                    uploadsInProgress: [],
                    fileInfos: [fInfo,fInfo,fInfo],
                    
                },
                onSubmit: onSubmitWithError,
            };

            const wrapper = shallow<AdvancedCreateComment>(
                <AdvancedCreateComment {...props}/>,
            );

            await wrapper.instance().handleSubmit(preventDefaultObject);

            expect(onSubmitWithError).toHaveBeenCalledWith({
                message: '/fakecommand other text',
                uploadsInProgress: [],
                fileInfos: [fInfo,fInfo,fInfo],
            }, {ignoreSlash: false});
            expect(preventDefault).toHaveBeenCalled();

            wrapper.setProps({onSubmit});
            await wrapper.instance().handleSubmit(preventDefaultObject);

            expect(onSubmit).toHaveBeenCalledWith({
                message: '/fakecommand other text',
                uploadsInProgress: [],
                fileInfos: [fInfo,fInfo,fInfo],
            }, {ignoreSlash: true});
            expect(wrapper.find('[id="postServerError"]').exists()).toBe(false);
        });

        it('should update global draft state if invalid slash command error occurs', async () => {
            const error = new Error('No command found');
            error.server_error_id = 'api.command.execute_command.not_found.app_error';
            const onSubmitWithError = jest.fn(() => Promise.reject(error));

            const props = {
                ...baseProps,
                draft: {
                    ...baseProps.draft,
                    message: '/fakecommand other text',
                    uploadsInProgress: [],
                    fileInfos:[fInfo,fInfo,fInfo],
                    
                },
                onSubmit: onSubmitWithError,
            };

            const wrapper = shallow<AdvancedCreateComment>(
                <AdvancedCreateComment {...props}/>,
            );

            const submitPromise = wrapper.instance().handleSubmit(preventDefaultObject);
            expect(props.onUpdateCommentDraft).not.toHaveBeenCalled();

            await submitPromise;
            expect(props.onUpdateCommentDraft).toHaveBeenCalledWith(props.draft);
        });
        ['channel', 'all', 'here'].forEach((mention) => {
            it(`should set mentionHighlightDisabled when user does not have permission and message contains channel @${mention}`, async () => {
                const props = {
                    ...baseProps,
                    useChannelMentions: false,
                    enableConfirmNotificationsToChannel: false,
                    draft: {
                        ...baseProps.draft, 
                        message: `Test message @${mention}`,
                        uploadsInProgress: [],
                        fileInfos:[fInfo,fInfo,fInfo],
                    },
                    onSubmit,
                };

                const wrapper = shallow<AdvancedCreateComment>(
                    <AdvancedCreateComment {...props}/>,
                );

                wrapper.instance().handleSubmit(preventDefaultObject);
                expect(onSubmit).toHaveBeenCalled();
                expect(wrapper.state('draft')!.props.mentionHighlightDisabled).toBe(true);
            });

            it(`should not set mentionHighlightDisabled when user does have permission and message contains channel channel @${mention}`, async () => {
                const props = {
                    ...baseProps,
                    useChannelMentions: true,
                    enableConfirmNotificationsToChannel: false,
                    draft: {
                        ...baseProps.draft,
                        message: `Test message @${mention}`,
                        uploadsInProgress: [],
                        fileInfos:[fInfo,fInfo,fInfo],

                    },
                    onSubmit,
                };

                const wrapper = shallow<AdvancedCreateComment>(
                    <AdvancedCreateComment {...props}/>,
                );

                wrapper.instance().handleSubmit(preventDefaultObject);
                expect(onSubmit).toHaveBeenCalled();
                expect(wrapper.state('draft')!.props).toBe(undefined);
            });
        });

        it('should not set mentionHighlightDisabled when user does not have useChannelMentions permission and message contains no mention', async () => {
            const props = {
                ...baseProps,
                useChannelMentions: false,
                draft: {
                    ...baseProps.draft,
                    message: 'Test message',
                    uploadsInProgress: [],
                    fileInfos:[fInfo,fInfo,fInfo],
                    
                },
                onSubmit,
            };

            const wrapper = shallow<AdvancedCreateComment>(
                <AdvancedCreateComment {...props}/>,
            );

            wrapper.instance().handleSubmit(preventDefaultObject);
            expect(onSubmit).toHaveBeenCalled();
            expect(wrapper.state('draft')!.props).toBe(undefined);
        });
    });

    test('removePreview should remove file info and upload in progress with corresponding id', () => {
        const onUpdateCommentDraft = jest.fn();
        let fInfo1=fInfo, fInfo2=fInfo,fInfo3=fInfo;
        fInfo1.id='1',fInfo2.id='2',fInfo3.id='3'
        const draft:any = {
            message: 'Test message',
            uploadsInProgress: ['4', '5', '6'],
            fileInfos: [fInfo1,fInfo2,fInfo3],
        };
        const props = {...baseProps, draft, onUpdateCommentDraft};

        const wrapper = shallow<AdvancedCreateComment>(
            <AdvancedCreateComment {...props}/>,
        );

        wrapper.setState({draft});

        wrapper.instance().removePreview('3');

        jest.advanceTimersByTime(Constants.SAVE_DRAFT_TIMEOUT);
        expect(onUpdateCommentDraft).toHaveBeenCalled();
        expect(onUpdateCommentDraft.mock.calls[0][0]).toEqual(
            expect.objectContaining({fileInfos: [fInfo1,fInfo2]}),
        );
        expect(wrapper.state().draft!.fileInfos).toEqual([fInfo1,fInfo2]);

        wrapper.instance().removePreview('5');

        jest.advanceTimersByTime(Constants.SAVE_DRAFT_TIMEOUT);
        expect(onUpdateCommentDraft.mock.calls[1][0]).toEqual(
            expect.objectContaining({uploadsInProgress: ['4', '6']}),
        );
        expect(wrapper.state().draft!.uploadsInProgress).toEqual(['4', '6']);
    });

    test('should match draft state on componentWillReceiveProps with change in messageInHistory', () => {
        const draft :any= {
            message: 'Test message',
            uploadsInProgress: [],
            fileInfos:[fInfo,fInfo,fInfo],
            
        };

        const wrapper = shallow<AdvancedCreateComment>(
            <AdvancedCreateComment {...baseProps}/>,
        );
        expect(wrapper.state('draft')).toEqual(draft);

        const newDraft = {...draft, message: 'Test message edited'};
        wrapper.setProps({draft: newDraft, messageInHistory: 'Test message edited'});
        expect(wrapper.state('draft')).toEqual(newDraft);
    });

    test('should match draft state on componentWillReceiveProps with new rootId', () => {
        const draft:any = {
            message: 'Test message',
            uploadsInProgress: ['4', '5', '6'],
            fileInfos: [{...fInfo,id: '1'}, {...fInfo,id: '2'}, {...fInfo,id: '3'}],
          
        };

        const wrapper = shallow<AdvancedCreateComment>(
            <AdvancedCreateComment {...baseProps}/>,
        );
        wrapper.setState({draft});
        expect(wrapper.state('draft')).toEqual(draft);

        wrapper.setProps({rootId: 'new_root_id'});
        expect(wrapper.state('draft')).toEqual({...draft, uploadsInProgress: [], fileInfos:[fInfo,fInfo,fInfo]});
    });

    test('should match snapshot when cannot post', () => {
        const props = {...baseProps, canPost: false};
        const wrapper = shallow<AdvancedCreateComment>(
            <AdvancedCreateComment {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, emoji picker disabled', () => {
        const props = {...baseProps, enableEmojiPicker: false};
        const wrapper = shallow<AdvancedCreateComment>(
            <AdvancedCreateComment {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('check for handleFileUploadChange callback for focus', () => {
        const wrapper = shallow<AdvancedCreateComment>(
            <AdvancedCreateComment {...baseProps}/>,
        );
        const instance = wrapper.instance();
        instance.focusTextbox = jest.fn();

        instance.handleFileUploadChange();
        expect(instance.focusTextbox).toHaveBeenCalledTimes(1);
    });

    test('should call functions on handleKeyDown', () => {
        const onMoveHistoryIndexBack = jest.fn();
        const onMoveHistoryIndexForward = jest.fn();
        const onEditLatestPost = jest.fn().
            mockImplementationOnce(() => ({data: true})).
            mockImplementationOnce(() => ({data: false}));
        const wrapper = shallow<AdvancedCreateComment>(
            <AdvancedCreateComment
                {...baseProps}
                ctrlSend={true}
                onMoveHistoryIndexBack={onMoveHistoryIndexBack}
                onMoveHistoryIndexForward={onMoveHistoryIndexForward}
                onEditLatestPost={onEditLatestPost}
            />,
        );
        const instance = wrapper.instance();
        instance.commentMsgKeyPress = jest.fn();
        instance.focusTextbox = jest.fn();
        const blur = jest.fn();

        const mockImpl = () => {
            return {
                setSelectionRange: jest.fn(),
                getBoundingClientRect: jest.fn(mockTop),
                blur: jest.fn(),
                focus: jest.fn(),
            };
        };

        const mockTop = () => {
            return document.createElement('div');
        };
        const newTextBoxRef:any= {
            ...instance.textBoxRef,
            current:{blur, focus, getInputBox: jest.fn(mockImpl)}
        }
        instance.textBoxRef=newTextBoxRef;

        const mockTarget = {
            selectionStart: 0,
            selectionEnd: 0,
            value: 'brown\nfox jumps over lazy dog',
        };

        const commentMsgKey :any= {
            preventDefault: jest.fn(),
            ctrlKey: true,
            key: Constants.KeyCodes.ENTER[0],
            keyCode: Constants.KeyCodes.ENTER[1],
            target: mockTarget,
        };
        instance.handleKeyDown(commentMsgKey);
        expect(instance.commentMsgKeyPress).toHaveBeenCalledTimes(1);

        const upKey :any= {
            preventDefault: jest.fn(),
            ctrlKey: true,
            key: Constants.KeyCodes.UP[0],
            keyCode: Constants.KeyCodes.UP[1],
            target: mockTarget,
        };
        instance.handleKeyDown(upKey);
        expect(upKey.preventDefault).toHaveBeenCalledTimes(1);
        expect(onMoveHistoryIndexBack).toHaveBeenCalledTimes(1);

        const downKey:any = {
            preventDefault: jest.fn(),
            ctrlKey: true,
            key: Constants.KeyCodes.DOWN[0],
            keyCode: Constants.KeyCodes.DOWN[1],
            target: mockTarget,
        };
        instance.handleKeyDown(downKey);
        expect(downKey.preventDefault).toHaveBeenCalledTimes(1);
        expect(onMoveHistoryIndexForward).toHaveBeenCalledTimes(1);

        wrapper.setState({draft: {...baseProps.draft,message: '', fileInfos: [], uploadsInProgress: []}});
        const upKeyForEdit :any= {
            preventDefault: jest.fn(),
            ctrlKey: false,
            key: Constants.KeyCodes.UP[0],
            keyCode: Constants.KeyCodes.UP[1],
            target: mockTarget,
        };
        instance.handleKeyDown(upKeyForEdit);
        expect(upKeyForEdit.preventDefault).toHaveBeenCalledTimes(1);
        expect(onEditLatestPost).toHaveBeenCalledTimes(1);
        expect(blur).toHaveBeenCalledTimes(1);

        instance.handleKeyDown(upKeyForEdit);
        expect(upKeyForEdit.preventDefault).toHaveBeenCalledTimes(2);
        expect(onEditLatestPost).toHaveBeenCalledTimes(2);
        expect(instance.focusTextbox).toHaveBeenCalledTimes(1);
        expect(instance.focusTextbox).toHaveBeenCalledWith(true);
    });

    test('should the RHS thread scroll to bottom one time after mount when props.draft.message is not empty', () => {
        const draft :any= baseProps.draft;
        const scrollToBottom = jest.fn();
        const wrapper = shallow<AdvancedCreateComment>(
            <AdvancedCreateComment
                {...baseProps}
                scrollToBottom={scrollToBottom}
            />,
        );

        expect(scrollToBottom).toBeCalledTimes(0);
        expect(wrapper.instance().DoInitialScrollToBottom).toEqual(true);

        // should scroll to bottom on first component update
        wrapper.setState({draft: {...draft, message: 'new message'}});
        expect(scrollToBottom).toBeCalledTimes(1);
        expect(wrapper.instance().DoInitialScrollToBottom).toEqual(false);

        // but not after the first update
        wrapper.setState({draft: {...draft, message: 'another message'}});
        expect(scrollToBottom).toBeCalledTimes(1);
        expect(wrapper.instance().DoInitialScrollToBottom).toEqual(false);
    });

    test('should the RHS thread scroll to bottom when state.draft.uploadsInProgress increases but not when it decreases', () => {
        const draft:any = baseProps.draft;
        const scrollToBottom = jest.fn();
        const wrapper = shallow<AdvancedCreateComment>(
            <AdvancedCreateComment
                {...baseProps}
                draft={draft}
                scrollToBottom={scrollToBottom}
            />,
        );

        expect(scrollToBottom).toBeCalledTimes(0);

        wrapper.setState({draft: {...draft, uploadsInProgress: ['1']}});
        expect(scrollToBottom).toBeCalledTimes(1);

        wrapper.setState({draft: {...draft, uploadsInProgress: ['1', '2']}});
        expect(scrollToBottom).toBeCalledTimes(2);

        wrapper.setState({draft: {...draft, uploadsInProgress: ['2']}});
        expect(scrollToBottom).toBeCalledTimes(2);
    });

    it('should be able to format a pasted markdown table', () => {
        const draft :any= baseProps.draft;
        const wrapper = shallow<AdvancedCreateComment>(
            <AdvancedCreateComment
                {...baseProps}
                draft={draft}
            />,
        );

        const mockTop = () => {
            return document.createElement('div');
        };

        const mockImpl = () => {
            return {
                setSelectionRange: jest.fn(),
                getBoundingClientRect: jest.fn(mockTop),
                focus: jest.fn(),
            };
        };
        const newTextBoxRef:any= {
            ...wrapper.instance().textBoxRef,
            current: {getInputBox: jest.fn(mockImpl), focus: jest.fn(), blur: jest.fn()}
        }
        wrapper.instance().textBoxRef=newTextBoxRef;
        // wrapper.instance().TextboxRef.current = {getInputBox: jest.fn(mockImpl), focus: jest.fn(), blur: jest.fn()};

        const event:any = {
            target: {
                id: 'reply_textbox',
            },
            preventDefault: jest.fn(),
            clipboardData: {
                items: [1],
                types: ['text/html'],
                getData: () => {
                    return '<table><tr><th>test</th><th>test</th></tr><tr><td>test</td><td>test</td></tr></table>';
                },
            },
        };

        const markdownTable = '| test | test |\n| --- | --- |\n| test | test |';

        wrapper.instance().pasteHandler(event);
        expect(wrapper.state('draft')!.message).toBe(markdownTable);
    });

    it('should be able to format a pasted markdown table without headers', () => {
        const draft:any = baseProps.draft;
        const wrapper = shallow<AdvancedCreateComment>(
            <AdvancedCreateComment
                {...baseProps}
                draft={draft}
            />,
        );

        const mockTop = () => {
            return document.createElement('div');
        };

        const mockImpl = () => {
            return {
                setSelectionRange: jest.fn(),
                getBoundingClientRect: jest.fn(mockTop),
                focus: jest.fn(),
            };
        };

          const newTextBoxRef:any= {
            ...wrapper.instance().textBoxRef,
            current: {getInputBox: jest.fn(mockImpl), focus: jest.fn(), blur: jest.fn()}
        }
        wrapper.instance().textBoxRef=newTextBoxRef;
        // wrapper.instance().TextboxRef.current = {getInputBox: jest.fn(mockImpl), focus: jest.fn(), blur: jest.fn()};

        const event:any = {
            target: {
                id: 'reply_textbox',
            },
            preventDefault: jest.fn(),
            clipboardData: {
                items: [1],
                types: ['text/html'],
                getData: () => {
                    return '<table><tr><td>test</td><td>test</td></tr><tr><td>test</td><td>test</td></tr></table>';
                },
            },
        };

        const markdownTable = '| test | test |\n| --- | --- |\n| test | test |\n';

        wrapper.instance().pasteHandler(event);
        expect(wrapper.state('draft')!.message).toBe(markdownTable);
    });

    it('should be able to format a pasted hyperlink', () => {
        const draft:any = baseProps.draft;
        const wrapper = shallow<AdvancedCreateComment>(
            <AdvancedCreateComment
                {...baseProps}
                draft={draft}
            />,
        );

        const mockTop = () => {
            return document.createElement('div');
        };

        const mockImpl = () => {
            return {
                setSelectionRange: jest.fn(),
                getBoundingClientRect: jest.fn(mockTop),
                focus: jest.fn(),
            };
        };

        const newTextBoxRef:any= {
            ...wrapper.instance().textBoxRef,
            current: {getInputBox: jest.fn(mockImpl), focus: jest.fn(), blur: jest.fn()}
        }
        wrapper.instance().textBoxRef=newTextBoxRef;
        // wrapper.instance().TextboxRef.current = {getInputBox: jest.fn(mockImpl), focus: jest.fn(), blur: jest.fn()};

        const event:any = {
            target: {
                id: 'reply_textbox',
            },
            preventDefault: jest.fn(),
            clipboardData: {
                items: [1],
                types: ['text/html'],
                getData: () => {
                    return '<a href="https://test.domain">link text</a>';
                },
            },
        };

        const markdownLink = '[link text](https://test.domain)';

        wrapper.instance().pasteHandler(event);
        expect(wrapper.state('draft')!.message).toBe(markdownLink);
    });

    it('should be able to format a github codeblock (pasted as a table)', () => {
        const draft:any = baseProps.draft;
        const wrapper = shallow<AdvancedCreateComment>(
            <AdvancedCreateComment
                {...baseProps}
                draft={draft}
            />,
        );

        const mockTop = () => {
            return document.createElement('div');
        };

        const mockImpl = () => {
            return {
                setSelectionRange: jest.fn(),
                getBoundingClientRect: jest.fn(mockTop),
                focus: jest.fn(),
            };
        };
        const newTextBoxRef:any= {
            ...wrapper.instance().textBoxRef,
            current: {getInputBox: jest.fn(mockImpl), focus: jest.fn(), blur: jest.fn()}
        }
        wrapper.instance().textBoxRef=newTextBoxRef;
        // wrapper.instance().TextboxRef.current = {getInputBox: jest.fn(mockImpl), focus: jest.fn(), blur: jest.fn()};

        const event:any = {
            target: {
                id: 'reply_textbox',
            },
            preventDefault: jest.fn(),
            clipboardData: {
                items: [1],
                types: ['text/plain', 'text/html'],
                getData: (type:string) => {
                    if (type === 'text/plain') {
                        return '// a javascript codeblock example\nif (1 > 0) {\n  return \'condition is true\';\n}';
                    }
                    return '<table class="highlight tab-size js-file-line-container" data-tab-size="8"><tbody><tr><td id="LC1" class="blob-code blob-code-inner js-file-line"><span class="pl-c"><span class="pl-c">//</span> a javascript codeblock example</span></td></tr><tr><td id="L2" class="blob-num js-line-number" data-line-number="2">&nbsp;</td><td id="LC2" class="blob-code blob-code-inner js-file-line"><span class="pl-k">if</span> (<span class="pl-c1">1</span> <span class="pl-k">&gt;</span> <span class="pl-c1">0</span>) {</td></tr><tr><td id="L3" class="blob-num js-line-number" data-line-number="3">&nbsp;</td><td id="LC3" class="blob-code blob-code-inner js-file-line"><span class="pl-en">console</span>.<span class="pl-c1">log</span>(<span class="pl-s"><span class="pl-pds">\'</span>condition is true<span class="pl-pds">\'</span></span>);</td></tr><tr><td id="L4" class="blob-num js-line-number" data-line-number="4">&nbsp;</td><td id="LC4" class="blob-code blob-code-inner js-file-line">}</td></tr></tbody></table>';
                },
            },
        };

        const codeBlockMarkdown = "```\n// a javascript codeblock example\nif (1 > 0) {\n  return 'condition is true';\n}\n```";

        wrapper.instance().pasteHandler(event);
        expect(wrapper.state('draft')!.message).toBe(codeBlockMarkdown);
    });

    it('should be able to format a github codeblock (pasted as a table) with with existing draft post', () => {
        const draft:any = baseProps.draft;
        const wrapper = shallow<AdvancedCreateComment>(
            <AdvancedCreateComment
                {...baseProps}
                draft={draft}
            />,
        );

        const mockTop = () => {
            return document.createElement('div');
        };

        const mockImpl = () => {
            return {
                setSelectionRange: jest.fn(),
                getBoundingClientRect: jest.fn(mockTop),
                focus: jest.fn(),
            };
        };

        const newTextBoxRef:any= {
            ...wrapper.instance().textBoxRef,
            current: {getInputBox: jest.fn(mockImpl), getBoundingClientRect: jest.fn(), focus: jest.fn()}
        }
        wrapper.instance().textBoxRef=newTextBoxRef;
        // wrapper.instance().TextboxRef.current = {getInputBox: jest.fn(mockImpl), getBoundingClientRect: jest.fn(), focus: jest.fn()};
        wrapper.setState({
            draft: {
                ...draft,
                message: 'test',
            },
            caretPosition: 'test'.length, // cursor is at the end
        });

        const event:any = {
            target: {
                id: 'reply_textbox',
            },
            preventDefault: jest.fn(),
            clipboardData: {
                items: [1],
                types: ['text/plain', 'text/html'],
                getData: (type:string) => {
                    if (type === 'text/plain') {
                        return '// a javascript codeblock example\nif (1 > 0) {\n  return \'condition is true\';\n}';
                    }
                    return '<table class="highlight tab-size js-file-line-container" data-tab-size="8"><tbody><tr><td id="LC1" class="blob-code blob-code-inner js-file-line"><span class="pl-c"><span class="pl-c">//</span> a javascript codeblock example</span></td></tr><tr><td id="L2" class="blob-num js-line-number" data-line-number="2">&nbsp;</td><td id="LC2" class="blob-code blob-code-inner js-file-line"><span class="pl-k">if</span> (<span class="pl-c1">1</span> <span class="pl-k">&gt;</span> <span class="pl-c1">0</span>) {</td></tr><tr><td id="L3" class="blob-num js-line-number" data-line-number="3">&nbsp;</td><td id="LC3" class="blob-code blob-code-inner js-file-line"><span class="pl-en">console</span>.<span class="pl-c1">log</span>(<span class="pl-s"><span class="pl-pds">\'</span>condition is true<span class="pl-pds">\'</span></span>);</td></tr><tr><td id="L4" class="blob-num js-line-number" data-line-number="4">&nbsp;</td><td id="LC4" class="blob-code blob-code-inner js-file-line">}</td></tr></tbody></table>';
                },
            },
        };

        const codeBlockMarkdown = "test\n```\n// a javascript codeblock example\nif (1 > 0) {\n  return 'condition is true';\n}\n```";

        wrapper.instance().pasteHandler(event);
        expect(wrapper.state('draft')!.message).toBe(codeBlockMarkdown);
    });

    test('should show preview and edit mode, and return focus on preview disable', () => {
        const wrapper = shallow<AdvancedCreateComment>(
            <AdvancedCreateComment {...baseProps}/>,
        );
        const instance:AdvancedCreateComment = wrapper.instance();
        instance.focusTextbox = jest.fn();
        expect(instance.focusTextbox).not.toBeCalled();

        instance.setShowPreview(true);

        expect(baseProps.setShowPreview).toHaveBeenCalledWith(true);
        expect(instance.focusTextbox).not.toBeCalled();

        wrapper.setProps({shouldShowPreview: true});
        expect(instance.focusTextbox).not.toBeCalled();
        wrapper.setProps({shouldShowPreview: false});
        expect(instance.focusTextbox).toBeCalled();
    });

    testComponentForLineBreak((value:string) => (
        <AdvancedCreateComment
            {...baseProps}
            draft={{
                ...baseProps.draft,
                message: value,
            }}
            ctrlSend={true}
        />
    ), (instance: any) => instance.state().draft.message, false);

    testComponentForMarkdownHotkeys(
        (value:string) => (
            <AdvancedCreateComment
                {...baseProps}
                draft={{
                    ...baseProps.draft,
                    message: value,
                }}
                ctrlSend={true}
            />
        ),
        (wrapper :any, setSelectionRangeFn :any) => {
            const mockTop = () => {
                return document.createElement('div');
            };
            wrapper.instance().textBoxRef = {
                current: {
                    getInputBox: jest.fn(() => {
                        return {
                            focus: jest.fn(),
                            getBoundingClientRect: jest.fn(mockTop),
                            setSelectionRange: setSelectionRangeFn,
                        };
                    }),
                },
            };
        },
        (instance :any) => instance.find(AdvanceTextEditor),
        (instance :any) => instance.state().draft.message,
        false,
    );

    it('should blur when ESCAPE is pressed', () => {
        const wrapper = shallow<AdvancedCreateComment>(
            <AdvancedCreateComment
                {...baseProps}
            />,
        );
        const instance = wrapper.instance();
        const blur = jest.fn();

        const mockImpl = () => {
            return {
                blur: jest.fn(),
                focus: jest.fn(),
            };
        };
        const newTextBoxRef:any= {
            ...wrapper.instance().textBoxRef,
            current: {blur, getInputBox: jest.fn(mockImpl)}
        }
        wrapper.instance().textBoxRef=newTextBoxRef;
        // instance.textBoxRef.current = {blur, getInputBox: jest.fn(mockImpl)};

        const mockTarget = {
            selectionStart: 0,
            selectionEnd: 0,
            value: 'brown\nfox jumps over lazy dog',
        };

        const commentEscapeKey:any = {
            preventDefault: jest.fn(),
            ctrlKey: true,
            key: Constants.KeyCodes.ESCAPE[0],
            keyCode: Constants.KeyCodes.ESCAPE[1],
            target: mockTarget,
        };

        instance.handleKeyDown(commentEscapeKey);
        expect(blur).toHaveBeenCalledTimes(1);
    });
});
