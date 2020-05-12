// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React, {useState, useEffect} from 'react';
import {Button, ButtonGroup} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import {memoizeResult} from 'mattermost-redux/utils/helpers';

import * as GlobalActions from 'actions/global_actions.jsx';
import AnnouncementBar from 'components/announcement_bar';
import LoadingScreen from 'components/loading_screen';
import LoadingSpinner from 'components/widgets/loading/loading_spinner';
import LogoutIcon from 'components/widgets/icons/fa_logout_icon';
import WarningIcon from 'components/widgets/icons/fa_warning_icon';

import {browserHistory} from 'utils/browser_history';
import messageHtmlToComponent from 'utils/message_html_to_component';
import {formatText} from 'utils/text_formatting';
import {Constants} from 'utils/constants.jsx';
import { Typography, Grid } from '@material-ui/core';
import Card from '@material-ui/core/Card';
import { makeStyles } from '@material-ui/core/styles';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import TextField from '@material-ui/core/TextField';
import Send from '@material-ui/icons/SendRounded';
import * as Utils from '../../utils/Util';

let publish = true;
const remoteList = [0, 1, 2, 3, 4];
const hosting = 'teachild.ga';
var server = null;
if (window.location.protocol === 'http:')
  server = `http://${hosting}:8088/janus`;
else server = `https://${hosting}/janus`;
var janus = null;
var sfutest = null;
var opaqueId = 'videoroomtest-' + Utils.randomString(12);
var roomId = 0; // Demo room
var myusername = null;
var myid = null;
var mystream = null;
// We use this other ID just to map our subscriptions to us
var mypvtid = null;
var feeds = [];
var bitrateTimer = [];
var doSimulcast =
  Utils.getQueryStringValue('simulcast') === 'yes' ||
  Utils.getQueryStringValue('simulcast') === 'true';
var doSimulcast2 =
  Utils.getQueryStringValue('simulcast2') === 'yes' ||
  Utils.getQueryStringValue('simulcast2') === 'true';

// Detect tab close: make sure we don't loose existing onbeforeunload handlers
// (note: for iOS we need to subscribe to a different event, 'pagehide', see
// https://gist.github.com/thehunmonkgroup/6bee8941a49b86be31a787fe8f4b8cfe)
let messageList = [];
let varIsInCall = false;
var iOS = ['iPad', 'iPhone', 'iPod'].indexOf(navigator.platform) >= 0;
var eventName = iOS ? 'pagehide' : 'beforeunload';
let formattedText = memoizeResult((text) => formatText(text, {}, props.emojiMap));

function CallScreen(props) {
    
    const [loading, setLoading] = useState(true)
    const [serverError, setServerError] = useState(null)

    useEffect(() => {
      //componentdidmount
      const script = document.createElement('script');
      script.src = '/janus/janus.js';
      document.head.appendChild(script);
      if (props.location.pathname) {
        let params = new URLSearchParams(props.location.search);
        let paramId = params.get('id');
        let rid = parseInt(paramId);
        if (rid) {
          props.history.push();
          props.joinRoomById(rid, joinRoomSuccessWithRoomId);
        } else if (paramId !== '' && paramId !== null) {
          props.history.goBack();
        }
      }
  
      // beforeunload event
      window.addEventListener(eventName, requestLeaveRoom);
    }, []);
  

    const joinRoomSuccessWithRoomId = (newRoomId) => {
        if (newRoomId === null) {
          props.history.push();
          return;
        }
        roomId = newRoomId;
        Janus.init({
          debug: config.log_enabled && 'all',
          callback: function() {
            // Make sure the browser supports WebRTC
            if (!Janus.isWebrtcSupported()) {
              props.showHideAlertDialog(true, 'No WebRTC support... ');
              return;
            }
            // Create session
            janus = new Janus({
              server: server,
              iceServers: [
                {
                  urls: `turn:${hosting}:3478`,
                  username: 'test',
                  credential: 'test',
                },
                { urls: `stun:${hosting}:3478` },
              ],
    
              success: function() {
                // Attach to video room test plugin
                janus.attach({
                  plugin: 'janus.plugin.videoroom',
                  opaqueId: opaqueId,
                  success: function(pluginHandle) {
                    sfutest = pluginHandle;
                    Janus.log(
                      'Plugin attached! (' +
                        sfutest.getPlugin() +
                        ', id=' +
                        sfutest.getId() +
                        ')'
                    );
                    Janus.log(
                      '  -- This is a publisher/manager with room Id ' + roomId
                    );
                    registerUsername();
                    setIsInCall(true);
                    varIsInCall = true;
                  },
                  error: function(error) {
                    Janus.error('  -- Error attaching plugin...', error);
                    props.showHideAlertDialog(
                      true,
                      'Error attaching plugin... ' + error
                    );
                  },
                  consentDialog: function(on) {
                    Janus.debug(
                      'Consent dialog should be ' + (on ? 'on' : 'off') + ' now'
                    );
                    if (on) {
                      // Darken screen and show hint
                      props.showHideLoadingDialog(true, 'loadingg');
                    } else {
                      // Restore screen
                      props.showHideLoadingDialog(false);
                    }
                  },
                  mediaState: function(medium, on) {
                    Janus.log(
                      'Janus ' +
                        (on ? 'started' : 'stopped') +
                        ' receiving our ' +
                        medium
                    );
                  },
                  webrtcState: function(on) {
                    Janus.log(
                      'Janus says our WebRTC PeerConnection is ' +
                        (on ? 'up' : 'down') +
                        ' now'
                    );
                    $('#videolocal')
                      .parent()
                      .parent()
                      .unblock();
                    if (!on) return;
                    $('#publish').remove();
                    // This controls allows us to override the global room bitrate cap
                    $('#bitrate')
                      .parent()
                      .parent()
                      .removeClass('hide')
                      .show();
                    $('#bitrate a').click(function() {
                      var id = $(this).attr('id');
                      var bitrate = parseInt(id) * 1000;
                      if (bitrate === 0) {
                        Janus.log('Not limiting bandwidth via REMB');
                      } else {
                        Janus.log('Capping bandwidth to ' + bitrate + ' via REMB');
                      }
                      $('#bitrateset')
                        .html($(this).html() + '<span class="caret"></span>')
                        .parent()
                        .removeClass('open');
                      sfutest.send({
                        message: { request: 'configure', bitrate: bitrate },
                      });
                      return false;
                    });
                  },
                  onmessage: function(msg, jsep) {
                    Janus.debug(' ::: Got a message (publisher) :::');
                    Janus.debug(msg);
                    var event = msg['videoroom'];
                    Janus.debug('Event: ' + event);
                    if (event !== undefined && event !== null) {
                      if (event === 'joined') {
                        // Publisher/manager created, negotiate WebRTC and attach to existing feeds, if any
                        myid = msg['id'];
                        mypvtid = msg['private_id'];
                        Janus.log(
                          'Successfully joined room ' +
                            msg['room'] +
                            ' with ID ' +
                            myid
                        );
                        props.saveJanusId(roomId, myid);
                        publishOwnFeed(true);
                        // Any new feed to attach to?
                        if (
                          msg['publishers'] !== undefined &&
                          msg['publishers'] !== null
                        ) {
                          let list = msg['publishers'];
                          Janus.debug('Got a list of available publishers/feeds:');
                          Janus.debug(list);
                          for (let f in list) {
                            let id = list[f]['id'];
                            let display = list[f]['display'];
                            let audio = list[f]['audio_codec'];
                            let video = list[f]['video_codec'];
                            Janus.debug(
                              '  >> [' +
                                id +
                                '] ' +
                                display +
                                ' (audio: ' +
                                audio +
                                ', video: ' +
                                video +
                                ')'
                            );
                            newRemoteFeed(id, display, audio, video);
                          }
                        }
                      } else if (event === 'destroyed') {
                        // The room has been destroyed
                        Janus.warn('The room has been destroyed!');
                        props.showHideAlertDialog(
                          true,
                          'The room has been destroyed',
                          '',
                          [
                            {
                              text: strings.ok,
                              onPress: () => window.location.reload(),
                            },
                          ]
                        );
                      } else if (event === 'event') {
                        // Any new feed to attach to?
                        if (
                          msg['publishers'] !== undefined &&
                          msg['publishers'] !== null
                        ) {
                          let list = msg['publishers'];
                          Janus.debug('Got a list of available publishers/feeds:');
                          Janus.debug(list);
                          for (let f in list) {
                            let id = list[f]['id'];
                            let display = list[f]['display'];
                            let audio = list[f]['audio_codec'];
                            let video = list[f]['video_codec'];
                            Janus.debug(
                              '  >> [' +
                                id +
                                '] ' +
                                display +
                                ' (audio: ' +
                                audio +
                                ', video: ' +
                                video +
                                ')'
                            );
                            newRemoteFeed(id, display, audio, video);
                          }
                        } else if (
                          msg['leaving'] !== undefined &&
                          msg['leaving'] !== null
                        ) {
                          // One of the publishers has gone away?
                          var leaving = msg['leaving'];
                          Janus.log('Publisher left: ' + leaving);
                          var remoteFeed = null;
                          for (var i = 1; i < 6; i++) {
                            if (
                              feeds[i] !== null &&
                              feeds[i] !== undefined &&
                              feeds[i].rfid === leaving
                            ) {
                              remoteFeed = feeds[i];
                              break;
                            }
                          }
                          if (remoteFeed !== null) {
                            Janus.debug(
                              'Feed ' +
                                remoteFeed.rfid +
                                ' (' +
                                remoteFeed.rfdisplay +
                                ') has left the room, detaching'
                            );
                            $('#remote' + remoteFeed.rfindex)
                              .empty()
                              .hide();
                            $('#videoremote' + remoteFeed.rfindex).empty();
                            feeds[remoteFeed.rfindex] = null;
                            remoteFeed.detach();
                          }
                        } else if (
                          msg['unpublished'] !== undefined &&
                          msg['unpublished'] !== null
                        ) {
                          // One of the publishers has unpublished?
                          var unpublished = msg['unpublished'];
                          Janus.log('Publisher left: ' + unpublished);
                          if (unpublished === 'ok') {
                            // That's us
                            sfutest.hangup();
                            return;
                          }
                          let remoteFeed = null;
                          for (let i = 1; i < 6; i++) {
                            if (
                              feeds[i] !== null &&
                              feeds[i] !== undefined &&
                              feeds[i].rfid === unpublished
                            ) {
                              remoteFeed = feeds[i];
                              break;
                            }
                          }
                          if (remoteFeed !== null) {
                            Janus.debug(
                              'Feed ' +
                                remoteFeed.rfid +
                                ' (' +
                                remoteFeed.rfdisplay +
                                ') has left the room, detaching'
                            );
                            $('#remote' + remoteFeed.rfindex)
                              .empty()
                              .hide();
                            $('#videoremote' + remoteFeed.rfindex).empty();
                            feeds[remoteFeed.rfindex] = null;
                            remoteFeed.detach();
                          }
                        } else if (
                          msg['error'] !== undefined &&
                          msg['error'] !== null
                        ) {
                          if (msg['error_code'] === 426) {
                            // This is a "no such room" error: give a more meaningful description
                            props.showHideAlertDialog(
                              true,
                              strings.room_not_available
                            );
                            props.history.goBack();
                          } else {
                            props.showHideAlertDialog(true, msg['error']);
                          }
                        }
                      }
                    }
                    if (jsep !== undefined && jsep !== null) {
                      Janus.debug('Handling SDP as well...');
                      Janus.debug(jsep);
                      sfutest.handleRemoteJsep({ jsep: jsep });
                      // Check if any of the media we wanted to publish has
                      // been rejected (e.g., wrong or unsupported codec)
                      let audio = msg['audio_codec'];
                      if (
                        mystream &&
                        mystream.getAudioTracks() &&
                        mystream.getAudioTracks().length > 0 &&
                        !audio
                      ) {
                        // Audio has been rejected
                        props.enqueueSnackbar(
                          "Our audio stream has been rejected, viewers won't hear us"
                        );
                      }
                      var video = msg['video_codec'];
                      if (
                        mystream &&
                        mystream.getVideoTracks() &&
                        mystream.getVideoTracks().length > 0 &&
                        !video
                      ) {
                        // Video has been rejected
                        props.enqueueSnackbar(
                          "Our video stream has been rejected, viewers won't see us"
                        );
                        // Hide the webcam video
                        $('#myvideo').hide();
                        $('#videolocal').append(
                          '<div class="no-video-container">' +
                            '<i class="fa fa-video-camera fa-5 no-video-icon" style="height: 100%;"></i>' +
                            '<span class="no-video-text" style="font-size: 16px;">Video rejected, no webcam</span>' +
                            '</div>'
                        );
                      }
                    }
                  },
                  onlocalstream: function(stream) {
                    Janus.debug(' ::: Got a local stream :::');
                    mystream = stream;
                    Janus.debug(stream);
                    $('#videojoin').hide();
                    $('#videos')
                      .removeClass('hide')
                      .show();
                    if ($('#myvideo').length === 0) {
                      $('#videolocal').append(
                        '<video class="rounded centered" id="myvideo" width="100%" height="100%" autoplay playsinline muted="muted"/>'
                      );
                      // Add a 'mute' button
                      $('#videolocal').append(
                        '<button class="btn btn-warning btn-xs" id="mute" style="position: absolute; bottom: 0px; left: 0px; margin: 15px;">Mute</button>'
                      );
                      $('#mute').click(toggleMute);
                      // Add an 'unpublish' button
                      $('#videolocal').append(
                        '<i class="fas fa-video" id="unpublish" style="position: absolute; bottom: 0px; right: 0px; margin: 15px; font-size:24px; color: #3f51b5;"/>'
                      );
                      $('#unpublish').click(unpublishOwnFeed);
                    }
                    $('#publisher')
                      .removeClass('hide')
                      .html(myusername)
                      .show();
                    Janus.attachMediaStream($('#myvideo').get(0), stream);
                    $('#myvideo').get(0).muted = 'muted';
                    if (
                      sfutest.webrtcStuff.pc.iceConnectionState !== 'completed' &&
                      sfutest.webrtcStuff.pc.iceConnectionState !== 'connected'
                    ) {
                      $('#videolocal')
                        .parent()
                        .parent()
                        .block({
                          message: '<b>Publishing...</b>',
                          css: {
                            border: 'none',
                            backgroundColor: 'transparent',
                            color: 'white',
                          },
                        });
                    }
                    var videoTracks = stream.getVideoTracks();
                    if (
                      videoTracks === null ||
                      videoTracks === undefined ||
                      videoTracks.length === 0
                    ) {
                      // No webcam
                      $('#myvideo').hide();
                      if ($('#videolocal .no-video-container').length === 0) {
                        $('#videolocal').append(
                          '<div class="no-video-container"></div>'
                        );
                      }
                    } else {
                      $('#videolocal .no-video-container').remove();
                      $('#myvideo')
                        .removeClass('hide')
                        .show();
                    }
                  },
                  onremotestream: function(stream) {
                    // The publisher stream is sendonly, we don't expect anything here
                  },
                  oncleanup: function() {
                    Janus.log(
                      ' ::: Got a cleanup notification: we are unpublished now :::'
                    );
                    mystream = null;
                    $('#videolocal').html(
                      '<button id="publish" class="btn btn-primary">Publish</button>'
                    );
                    $('#publish').click(function() {
                      publishOwnFeed(true);
                    });
                    $('#videolocal')
                      .parent()
                      .parent()
                      .unblock();
                    $('#bitrate')
                      .parent()
                      .parent()
                      .addClass('hide');
                    $('#bitrate a').unbind('click');
                  },
                });
              },
              error: function(error) {
                Janus.error(error);
                props.showHideAlertDialog(true, error, '', [
                  { text: strings.ok, onPress: () => window.location.reload() },
                ]);
              },
              destroyed: function() {
                window.location.reload();
              },
            });
          },
        });
    };

    const requestLeaveRoom = (event) => {
      // if (varIsInCall) {
      if (event && varIsInCall) {
        event.preventDefault();
        event.returnValue = '';
      }
      // } else {
      //   for (var s in Janus.sessions) {
      //     if (
      //       Janus.sessions[s] !== null &&
      //       Janus.sessions[s] !== undefined &&
      //       Janus.sessions[s].destroyOnUnload
      //     ) {
      //       Janus.log('Destroying session ' + s);
      //       Janus.sessions[s].destroy({
      //         asyncRequest: false,
      //         notifyDestroyed: false,
      //       });
      //     }
      //   }
      //   if (oldOBF && typeof oldOBF == 'function') oldOBF();
      //   props.history.push();
      //   leaveRoom(roomId, uid);
      //   janus && janus.destroy();
      // }
    };

    const registerUsername = () => {
      let username = props.profile.email.split('@')[0];
      var register = {
        request: 'join',
        room: roomId,
        ptype: 'publisher',
        display: username,
      };
      myusername = username;
      sfutest.send({ message: register });
    };

    const handleAcceptTerms = () => {
        // console.log("s", this.state, this.props.state.entities.users.currentUserId)
    };

    const onSwitchTranscription = (event, checked) => {
      props.toggleTranscription(roomId, checked);
      setDisableTranscriptionSwitch(true);
      setTimeout(() => {
        setDisableTranscriptionSwitch(false);
      }, 4000);
    };
  
    const onSwitchTranslation = (e, checked) => {
      props.toggleTranslation(roomId, checked);
      setDisableTranslationSwitch(true);
      setTimeout(() => {
        setDisableTranslationSwitch(false);
      }, 4000);
    };

    const publishOwnFeed = (useAudio) => {
      // Publish our stream
      $('#publish')
        .attr('disabled', true)
        .unbind('click');
      sfutest.createOffer({
        media: {
          audioRecv: false,
          videoRecv: false,
          audioSend: useAudio,
          videoSend: true,
          data: true,
        },
        simulcast: doSimulcast,
        simulcast2: doSimulcast2,
        success: function(jsep) {
          Janus.debug('Got publisher SDP!');
          Janus.debug(jsep);
          var publish = { request: 'configure', audio: useAudio, video: true };
          sfutest.send({ message: publish, jsep: jsep });
        },
        error: function(error) {
          Janus.error('WebRTC error:', error);
          if (useAudio) {
            publishOwnFeed(false);
          } else {
            props.showHideAlertDialog(
              true,
              'WebRTC error... ' + JSON.stringify(error)
            );
            $('#publish')
              .removeAttr('disabled')
              .click(function() {
                publishOwnFeed(true);
              });
          }
        },
      });
    };
    
    const newRemoteFeed = (id, display, audio, video) =>  {
      // A new feed has been published, create a new plugin handle and attach to it as a subscriber
      var remoteFeed = null;
      janus.attach({
        plugin: 'janus.plugin.videoroom',
        opaqueId: opaqueId,
        success: function(pluginHandle) {
          remoteFeed = pluginHandle;
          remoteFeed.simulcastStarted = false;
          Janus.log(
            'Plugin attached! (' +
              remoteFeed.getPlugin() +
              ', id=' +
              remoteFeed.getId() +
              ')'
          );
          Janus.log('  -- This is a subscriber' + temp);
          // We wait for the plugin to send us an offer
          var subscribe = {
            request: 'join',
            room: roomId,
            ptype: 'subscriber',
            feed: id,
            private_id: mypvtid,
          };
          if (
            Janus.webRTCAdapter.browserDetails.browser === 'safari' &&
            (video === 'vp9' || (video === 'vp8' && !Janus.safariVp8))
          ) {
            if (video) video = video.toUpperCase();
            props.enqueueSnackbar(
              'Publisher is using ' +
                video +
                ", but Safari doesn't support it: disabling video"
            );
            subscribe['offer_video'] = false;
          }
          remoteFeed.videoCodec = video;
          remoteFeed.send({ message: subscribe });
        },
        error: function(error) {
          Janus.error('  -- Error attaching plugin...', error);
          props.showHideAlertDialog(true, 'Error attaching plugin... ' + error);
        },
        onmessage: function(msg, jsep) {
          Janus.debug(' ::: Got a message (subscriber) :::');
          Janus.debug(msg);
          var event = msg['videoroom'];
          Janus.debug('Event: ' + event);
          if (msg['error'] !== undefined && msg['error'] !== null) {
            props.showHideAlertDialog(true, msg['error']);
          } else if (event !== undefined && event !== null) {
            //only attach user, do not attach audio listener
            if (event === 'attached') {
              // Subscriber created and attached
              if (msg['display']) {
                for (var i = 1; i < 6; i++) {
                  if (feeds[i] === undefined || feeds[i] === null) {
                    feeds[i] = remoteFeed;
                    remoteFeed.rfindex = i;
                    break;
                  }
                }
                remoteFeed.rfid = msg['id'];
                remoteFeed.rfdisplay = msg['display'];
                if (
                  remoteFeed.spinner === undefined ||
                  remoteFeed.spinner === null
                ) {
                  var target = document.getElementById(
                    'videoremote' + remoteFeed.rfindex
                  );
                  /* global Spinner */
                  remoteFeed.spinner = new Spinner({ top: 100 }).spin(target);
                } else {
                  remoteFeed.spinner.spin();
                }
              }
              Janus.log(
                'Successfully attached to feed ' +
                  remoteFeed.rfid +
                  ' (' +
                  remoteFeed.rfdisplay +
                  ') in room ' +
                  msg['room']
              );
              $('#remote' + remoteFeed.rfindex)
                .removeClass('hide')
                .html(remoteFeed.rfdisplay)
                .show();
            } else if (event === 'event') {
              // Check if we got an event on a simulcast-related event from this publisher
              var substream = msg['substream'];
              var temporal = msg['temporal'];
              if (
                (substream !== null && substream !== undefined) ||
                (temporal !== null && temporal !== undefined)
              ) {
                if (!remoteFeed.simulcastStarted) {
                  remoteFeed.simulcastStarted = true;
                  // Add some new buttons
                  addSimulcastButtons(
                    remoteFeed.rfindex,
                    remoteFeed.videoCodec === 'vp8' ||
                      remoteFeed.videoCodec === 'h264'
                  );
                }
                // We just received notice that there's been a switch, update the buttons
                updateSimulcastButtons(remoteFeed.rfindex, substream, temporal);
              }
            } else {
              // What has just happened?
            }
          }
          if (jsep !== undefined && jsep !== null) {
            Janus.debug('Handling SDP as well...');
            Janus.debug(jsep);
            // Answer and attach
            remoteFeed.createAnswer({
              jsep: jsep,
              // Add data:true here if you want to subscribe to datachannels as well
              // (obviously only works if the publisher offered them in the first place)
              media: { audioSend: false, videoSend: false, data: true }, // We want recvonly audio/video
              success: function(jsep) {
                Janus.debug('Got SDP!');
                Janus.debug(jsep);
                var body = { request: 'start', room: roomId };
                remoteFeed.send({ message: body, jsep: jsep });
              },
              error: function(error) {
                Janus.error('WebRTC error:', error);
                props.showHideAlertDialog(
                  true,
                  'WebRTC error... ' + JSON.stringify(error)
                );
              },
            });
          }
        },
        webrtcState: function(on) {
          Janus.log(
            'Janus says this WebRTC PeerConnection (feed #' +
              remoteFeed.rfindex +
              ') is ' +
              (on ? 'up' : 'down') +
              ' now'
          );
        },
        onlocalstream: function(stream) {
          // The subscriber stream is recvonly, we don't expect anything here
        },
        onremotestream: function(stream) {
          Janus.debug('Remote feed #' + remoteFeed.rfindex);
          var addButtons = false;
          if ($('#remotevideo' + remoteFeed.rfindex).length === 0) {
            addButtons = true;
            // No remote video yet
            $('#videoremote' + remoteFeed.rfindex).append(
              '<video class="rounded centered" id="waitingvideo' +
                remoteFeed.rfindex +
                '" width=320 height=240 />'
            );
            $('#videoremote' + remoteFeed.rfindex).append(
              '<video class="rounded centered relative hide" id="remotevideo' +
                remoteFeed.rfindex +
                '" width="100%" height="100%" autoplay playsinline/>'
            );
            $('#videoremote' + remoteFeed.rfindex).append(
              '<span class="label label-primary hide" id="curres' +
                remoteFeed.rfindex +
                '" style="position: absolute; bottom: 0px; left: 0px; margin: 15px;"></span>' +
                '<span class="label label-info hide" id="curbitrate' +
                remoteFeed.rfindex +
                '" style="position: absolute; bottom: 0px; right: 0px; margin: 15px;"></span>'
            );
            // Show the video, hide the spinner and show the resolution when we get a playing event
            $('#remotevideo' + remoteFeed.rfindex).bind('playing', function() {
              if (remoteFeed.spinner !== undefined && remoteFeed.spinner !== null)
                remoteFeed.spinner.stop();
              remoteFeed.spinner = null;
              $('#waitingvideo' + remoteFeed.rfindex).remove();
              if (this.videoWidth)
                $('#remotevideo' + remoteFeed.rfindex)
                  .removeClass('hide')
                  .show();
              var width = this.videoWidth;
              var height = this.videoHeight;
              $('#curres' + remoteFeed.rfindex)
                .removeClass('hide')
                .text(width + 'x' + height)
                .show();
              if (Janus.webRTCAdapter.browserDetails.browser === 'firefox') {
                // Firefox Stable has a bug: width and height are not immediately available after a playing
                setTimeout(function() {
                  var width = $('#remotevideo' + remoteFeed.rfindex).get(0)
                    .videoWidth;
                  var height = $('#remotevideo' + remoteFeed.rfindex).get(0)
                    .videoHeight;
                  $('#curres' + remoteFeed.rfindex)
                    .removeClass('hide')
                    .text(width + 'x' + height)
                    .show();
                }, 2000);
              }
            });
          }
          Janus.attachMediaStream(
            $('#remotevideo' + remoteFeed.rfindex).get(0),
            stream
          );
          var videoTracks = stream.getVideoTracks();
          if (
            videoTracks === null ||
            videoTracks === undefined ||
            videoTracks.length === 0
          ) {
            // No remote video
            $('#remotevideo' + remoteFeed.rfindex).hide();
            if (
              $('#videoremote' + remoteFeed.rfindex + ' .no-video-container')
                .length === 0
            ) {
              $('#videoremote' + remoteFeed.rfindex).append(
                '<div class="no-video-container">' +
                  '<i class="fa fa-video-camera fa-5 no-video-icon"></i>' +
                  '<span class="no-video-text">No remote video available</span>' +
                  '</div>'
              );
            }
          } else {
            $(
              '#videoremote' + remoteFeed.rfindex + ' .no-video-container'
            ).remove();
            $('#remotevideo' + remoteFeed.rfindex)
              .removeClass('hide')
              .show();
          }
          if (!addButtons) return;
          if (
            Janus.webRTCAdapter.browserDetails.browser === 'chrome' ||
            Janus.webRTCAdapter.browserDetails.browser === 'firefox' ||
            Janus.webRTCAdapter.browserDetails.browser === 'safari'
          ) {
            $('#curbitrate' + remoteFeed.rfindex)
              .removeClass('hide')
              .show();
            bitrateTimer[remoteFeed.rfindex] = setInterval(function() {
              // Display updated bitrate, if supported
              var bitrate = remoteFeed.getBitrate();
              $('#curbitrate' + remoteFeed.rfindex).text(bitrate);
              // Check if the resolution changed too
              var width = $('#remotevideo' + remoteFeed.rfindex).get(0)
                ? $('#remotevideo' + remoteFeed.rfindex).get(0).videoWidth
                : 0;
              var height = $('#remotevideo' + remoteFeed.rfindex).get(0)
                ? $('#remotevideo' + remoteFeed.rfindex).get(0).videoHeight
                : 0;
              if (width > 0 && height > 0)
                $('#curres' + remoteFeed.rfindex)
                  .removeClass('hide')
                  .text(width + 'x' + height)
                  .show();
            }, 1000);
          }
        },
        ondataopen: function(data) {
          Janus.log('The DataChannel is available!');
        },
        ondata: function(json) {
          try {
            let data = JSON.parse(json);
            console.log('We got data from the DataChannel! ' + json);
            let { src, trans } = data;
            trans = trans ? trans.trim() : '';
            if (messageList.length === 0) {
              messageList.push({ ...data, trans });
            } else {
              //duyet tu cuoi len dau
              let tempIndex = messageList.length - 1;
              do {
                if (messageList[tempIndex].src === src) {
                  if (!messageList[tempIndex].final) {
                    messageList[tempIndex] = { ...data, trans };
                    break;
                  } else {
                    messageList.push({ ...data, trans });
                    break;
                  }
                }
                if (tempIndex === 0 && messageList[tempIndex].src !== src) {
                  messageList.push({ ...data, trans });
                  break;
                }
                tempIndex--;
              } while (tempIndex > -1);
            }
            setTemp([]);
          } catch (e) {
            console.log('Something went wrong...' + e);
          }
        },
        oncleanup: function() {
          Janus.log(
            ' ::: Got a cleanup notification (remote feed ' + id + ') :::'
          );
          if (remoteFeed.spinner !== undefined && remoteFeed.spinner !== null)
            remoteFeed.spinner.stop();
          remoteFeed.spinner = null;
          $('#remotevideo' + remoteFeed.rfindex).remove();
          $('#waitingvideo' + remoteFeed.rfindex).remove();
          $('#novideo' + remoteFeed.rfindex).remove();
          $('#curbitrate' + remoteFeed.rfindex).remove();
          $('#curres' + remoteFeed.rfindex).remove();
          if (
            bitrateTimer[remoteFeed.rfindex] !== null &&
            bitrateTimer[remoteFeed.rfindex] !== null
          )
            clearInterval(bitrateTimer[remoteFeed.rfindex]);
          bitrateTimer[remoteFeed.rfindex] = null;
          remoteFeed.simulcastStarted = false;
          $('#simulcast' + remoteFeed.rfindex).remove();
        },
      });
    };

    // Helpers to create Simulcast-related UI, if enabled
    const addSimulcastButtons = (feed, temporal) =>  {
      var index = feed;
      $('#remote' + index)
        .parent()
        .append(
          '<div id="simulcast' +
            index +
            '" class="btn-group-vertical btn-group-vertical-xs pull-right">' +
            ' <div class"row">' +
            '   <div class="btn-group btn-group-xs" style="width: 100%">' +
            '     <button id="sl' +
            index +
            '-2" type="button" class="btn btn-primary" data-toggle="tooltip" title="Switch to higher quality" style="width: 33%">SL 2</button>' +
            '     <button id="sl' +
            index +
            '-1" type="button" class="btn btn-primary" data-toggle="tooltip" title="Switch to normal quality" style="width: 33%">SL 1</button>' +
            '     <button id="sl' +
            index +
            '-0" type="button" class="btn btn-primary" data-toggle="tooltip" title="Switch to lower quality" style="width: 34%">SL 0</button>' +
            '   </div>' +
            ' </div>' +
            ' <div class"row">' +
            '   <div class="btn-group btn-group-xs hide" style="width: 100%">' +
            '     <button id="tl' +
            index +
            '-2" type="button" class="btn btn-primary" data-toggle="tooltip" title="Cap to temporal layer 2" style="width: 34%">TL 2</button>' +
            '     <button id="tl' +
            index +
            '-1" type="button" class="btn btn-primary" data-toggle="tooltip" title="Cap to temporal layer 1" style="width: 33%">TL 1</button>' +
            '     <button id="tl' +
            index +
            '-0" type="button" class="btn btn-primary" data-toggle="tooltip" title="Cap to temporal layer 0" style="width: 33%">TL 0</button>' +
            '   </div>' +
            ' </div>' +
            '</div>'
        );
      // Enable the simulcast selection buttons
      $('#sl' + index + '-0')
        .removeClass('btn-primary btn-success')
        .addClass('btn-primary')
        .unbind('click')
        .click(function() {
          props.enqueueSnackbar(
            'Switching simulcast substream, wait for it... (lower quality)',
            null,
            { timeOut: 2000 }
          );
          if (!$('#sl' + index + '-2').hasClass('btn-success'))
            $('#sl' + index + '-2')
              .removeClass('btn-primary btn-info')
              .addClass('btn-primary');
          if (!$('#sl' + index + '-1').hasClass('btn-success'))
            $('#sl' + index + '-1')
              .removeClass('btn-primary btn-info')
              .addClass('btn-primary');
          $('#sl' + index + '-0')
            .removeClass('btn-primary btn-info btn-success')
            .addClass('btn-info');
          feeds[index].send({ message: { request: 'configure', substream: 0 } });
        });
      $('#sl' + index + '-1')
        .removeClass('btn-primary btn-success')
        .addClass('btn-primary')
        .unbind('click')
        .click(function() {
          props.enqueueSnackbar(
            'Switching simulcast substream, wait for it... (normal quality)',
            null,
            { timeOut: 2000 }
          );
          if (!$('#sl' + index + '-2').hasClass('btn-success'))
            $('#sl' + index + '-2')
              .removeClass('btn-primary btn-info')
              .addClass('btn-primary');
          $('#sl' + index + '-1')
            .removeClass('btn-primary btn-info btn-success')
            .addClass('btn-info');
          if (!$('#sl' + index + '-0').hasClass('btn-success'))
            $('#sl' + index + '-0')
              .removeClass('btn-primary btn-info')
              .addClass('btn-primary');
          feeds[index].send({ message: { request: 'configure', substream: 1 } });
        });
      $('#sl' + index + '-2')
        .removeClass('btn-primary btn-success')
        .addClass('btn-primary')
        .unbind('click')
        .click(function() {
          props.enqueueSnackbar(
            'Switching simulcast substream, wait for it... (higher quality)',
            null,
            { timeOut: 2000 }
          );
          $('#sl' + index + '-2')
            .removeClass('btn-primary btn-info btn-success')
            .addClass('btn-info');
          if (!$('#sl' + index + '-1').hasClass('btn-success'))
            $('#sl' + index + '-1')
              .removeClass('btn-primary btn-info')
              .addClass('btn-primary');
          if (!$('#sl' + index + '-0').hasClass('btn-success'))
            $('#sl' + index + '-0')
              .removeClass('btn-primary btn-info')
              .addClass('btn-primary');
          feeds[index].send({ message: { request: 'configure', substream: 2 } });
        });
      if (!temporal)
        // No temporal layer support
        return;
      $('#tl' + index + '-0')
        .parent()
        .removeClass('hide');
      $('#tl' + index + '-0')
        .removeClass('btn-primary btn-success')
        .addClass('btn-primary')
        .unbind('click')
        .click(function() {
          props.enqueueSnackbar(
            'Capping simulcast temporal layer, wait for it... (lowest FPS)',
            null,
            { timeOut: 2000 }
          );
          if (!$('#tl' + index + '-2').hasClass('btn-success'))
            $('#tl' + index + '-2')
              .removeClass('btn-primary btn-info')
              .addClass('btn-primary');
          if (!$('#tl' + index + '-1').hasClass('btn-success'))
            $('#tl' + index + '-1')
              .removeClass('btn-primary btn-info')
              .addClass('btn-primary');
          $('#tl' + index + '-0')
            .removeClass('btn-primary btn-info btn-success')
            .addClass('btn-info');
          feeds[index].send({ message: { request: 'configure', temporal: 0 } });
        });
      $('#tl' + index + '-1')
        .removeClass('btn-primary btn-success')
        .addClass('btn-primary')
        .unbind('click')
        .click(function() {
          props.enqueueSnackbar(
            'Capping simulcast temporal layer, wait for it... (medium FPS)',
            null,
            { timeOut: 2000 }
          );
          if (!$('#tl' + index + '-2').hasClass('btn-success'))
            $('#tl' + index + '-2')
              .removeClass('btn-primary btn-info')
              .addClass('btn-primary');
          $('#tl' + index + '-1')
            .removeClass('btn-primary btn-info')
            .addClass('btn-info');
          if (!$('#tl' + index + '-0').hasClass('btn-success'))
            $('#tl' + index + '-0')
              .removeClass('btn-primary btn-info')
              .addClass('btn-primary');
          feeds[index].send({ message: { request: 'configure', temporal: 1 } });
        });
      $('#tl' + index + '-2')
        .removeClass('btn-primary btn-success')
        .addClass('btn-primary')
        .unbind('click')
        .click(function() {
          props.enqueueSnackbar(
            'Capping simulcast temporal layer, wait for it... (highest FPS)',
            null,
            { timeOut: 2000 }
          );
          $('#tl' + index + '-2')
            .removeClass('btn-primary btn-info btn-success')
            .addClass('btn-info');
          if (!$('#tl' + index + '-1').hasClass('btn-success'))
            $('#tl' + index + '-1')
              .removeClass('btn-primary btn-info')
              .addClass('btn-primary');
          if (!$('#tl' + index + '-0').hasClass('btn-success'))
            $('#tl' + index + '-0')
              .removeClass('btn-primary btn-info')
              .addClass('btn-primary');
          feeds[index].send({ message: { request: 'configure', temporal: 2 } });
        });
    };
  
    const updateSimulcastButtons = (feed, substream, temporal)  => {
      // Check the substream
      var index = feed;
      if (substream === 0) {
        props.enqueueSnackbar(
          'Switched simulcast substream! (lower quality)',
          null,
          {
            timeOut: 2000,
          }
        );
        $('#sl' + index + '-2')
          .removeClass('btn-primary btn-success')
          .addClass('btn-primary');
        $('#sl' + index + '-1')
          .removeClass('btn-primary btn-success')
          .addClass('btn-primary');
        $('#sl' + index + '-0')
          .removeClass('btn-primary btn-info btn-success')
          .addClass('btn-success');
      } else if (substream === 1) {
        props.enqueueSnackbar(
          'Switched simulcast substream! (normal quality)',
          null,
          {
            timeOut: 2000,
          }
        );
        $('#sl' + index + '-2')
          .removeClass('btn-primary btn-success')
          .addClass('btn-primary');
        $('#sl' + index + '-1')
          .removeClass('btn-primary btn-info btn-success')
          .addClass('btn-success');
        $('#sl' + index + '-0')
          .removeClass('btn-primary btn-success')
          .addClass('btn-primary');
      } else if (substream === 2) {
        props.enqueueSnackbar(
          'Switched simulcast substream! (higher quality)',
          null,
          {
            timeOut: 2000,
          }
        );
        $('#sl' + index + '-2')
          .removeClass('btn-primary btn-info btn-success')
          .addClass('btn-success');
        $('#sl' + index + '-1')
          .removeClass('btn-primary btn-success')
          .addClass('btn-primary');
        $('#sl' + index + '-0')
          .removeClass('btn-primary btn-success')
          .addClass('btn-primary');
      }
      // Check the temporal layer
      if (temporal === 0) {
        props.enqueueSnackbar(
          'Capped simulcast temporal layer! (lowest FPS)',
          null,
          {
            timeOut: 2000,
          }
        );
        $('#tl' + index + '-2')
          .removeClass('btn-primary btn-success')
          .addClass('btn-primary');
        $('#tl' + index + '-1')
          .removeClass('btn-primary btn-success')
          .addClass('btn-primary');
        $('#tl' + index + '-0')
          .removeClass('btn-primary btn-info btn-success')
          .addClass('btn-success');
      } else if (temporal === 1) {
        props.enqueueSnackbar(
          'Capped simulcast temporal layer! (medium FPS)',
          null,
          {
            timeOut: 2000,
          }
        );
        $('#tl' + index + '-2')
          .removeClass('btn-primary btn-success')
          .addClass('btn-primary');
        $('#tl' + index + '-1')
          .removeClass('btn-primary btn-info btn-success')
          .addClass('btn-success');
        $('#tl' + index + '-0')
          .removeClass('btn-primary btn-success')
          .addClass('btn-primary');
      } else if (temporal === 2) {
        props.enqueueSnackbar(
          'Capped simulcast temporal layer! (highest FPS)',
          null,
          {
            timeOut: 2000,
          }
        );
        $('#tl' + index + '-2')
          .removeClass('btn-primary btn-info btn-success')
          .addClass('btn-success');
        $('#tl' + index + '-1')
          .removeClass('btn-primary btn-success')
          .addClass('btn-primary');
        $('#tl' + index + '-0')
          .removeClass('btn-primary btn-success')
          .addClass('btn-primary');
      }
    };
  
    const toggleMute = ()  => {
      var muted = sfutest.isAudioMuted();
      Janus.log((muted ? 'Unmuting' : 'Muting') + ' local stream...');
      if (muted) sfutest.unmuteAudio();
      else sfutest.muteAudio();
      muted = sfutest.isAudioMuted();
      $('#mute').html(muted ? 'Unmute' : 'Mute');
    };
  
    const unpublishOwnFeed = () =>  {
      if (publish) {
        $('#unpublish').removeClass('fa-video');
        $('#unpublish').addClass('fa-video-slash');
        sfutest.createOffer({
          media: { removeVideo: true },
          success: function(jsep) {
            Janus.debug(jsep);
            sfutest.send({ message: { audio: true, video: true }, jsep: jsep });
          },
          error: function(error) {
            props.showHideAlertDialog(
              true,
              'WebRTC error... ' + JSON.stringify(error)
            );
          },
        });
        publish = false;
      } else {
        $('#unpublish').removeClass('fa-video-slash');
        $('#unpublish').addClass('fa-video');
        sfutest.createOffer({
          media: { addVideo: true },
          success: function(jsep) {
            Janus.debug(jsep);
            sfutest.send({ message: { audio: true, video: true }, jsep: jsep });
          },
          error: function(error) {
            props.showHideAlertDialog(
              true,
              'WebRTC error... ' + JSON.stringify(error)
            );
          },
        });
        publish = true;
      }
    };


      const classes = useStyles();
      const { uid, role } = props;
      let transcriptionEnabled =
        (props.room &&
          props.room.users &&
          props.room.users[uid] &&
          props.room.users[uid].transcription) ||
        false;
  
      let translationEnabled =
        (props.room &&
          props.room.users &&
          props.room.users[uid] &&
          props.room.users[uid].translation) ||
        false;
  
      let usersInRoom = props.room && props.room.users;
        if (loading) {
            return <LoadingScreen/>;
        }
        let termsMarkdownClasses = 'terms-of-service__markdown';
        if (serverError) {
            termsMarkdownClasses += ' terms-of-service-error__height--fill';
        } else {
            termsMarkdownClasses += ' terms-of-service__height--fill';
        }
        return (
          <Grid container className={classes.root}>
          <InviteDialog
            visible={inviteDialogVisible}
            onClose={() => setInviteDialogVisible(false)}
          />
          <Grid container alignItems="center">
            <Grid container alignItems="center" style={{ flex: 1 }}>
              <Button
                color="primary"
                variant="contained"
                className={classes.button}
                id="start"
                onClick={onStartVideoCall}
              >
                {isInCall ? 'Stop' : 'Start video call'}
              </Button>
              {isInCall ? (
                <Button
                  color="primary"
                  variant="contained"
                  className={classes.button}
                  onClick={() => setInviteDialogVisible(true)}
                >
                  Invite
                </Button>
              ) : null}
              {/* <Button
              color="primary"
              className={classes.button}
              onClick={onClickTest}
            >
              Test button
            </Button> */}
              {isInCall ? (
                <FormControlLabel
                  control={
                    <Switch
                      color="primary"
                      onChange={onSwitchTranscription}
                      checked={transcriptionEnabled}
                      disabled={disableTranscriptionSwitch}
                    />
                  }
                  label="Transcription"
                  labelPlacement="start"
                />
              ) : null}
              {isInCall ? (
                <FormControlLabel
                  control={
                    <Switch
                      color="primary"
                      onChange={onSwitchTranslation}
                      checked={translationEnabled}
                      disabled={disableTranslationSwitch}
                    />
                  }
                  label="Vietnamese translation"
                  labelPlacement="start"
                />
              ) : null}
            </Grid>
            {isInCall ? (
              <Timer ref={timerRef} initialTime={0} startImmediately={false}>
                {({ start }) => (
                  <React.Fragment>
                    <Card style={{ paddingLeft: 20, paddingRight: 20 }}>
                      <Timer.Hours />:<Timer.Minutes />:<Timer.Seconds />
                    </Card>
                    <Button
                      color="primary"
                      variant="contained"
                      className={classes.timerButton}
                      disabled={timerRunning || role !== Const.USER_ROLE.TEACHER}
                      onClick={() => {
                        start();
                        onStartTimer();
                      }}
                    >
                      Start timer
                    </Button>
                  </React.Fragment>
                )}
              </Timer>
            ) : null}
          </Grid>
          <Grid
            container
            spacing={3}
            id="videos"
            className={classes.videoContainer}
          >
            <Grid item xs={7}>
              <Card className={classes.windowStyle}>
                <ScrollToBottom className={classes.listSubtitle}>
                  <List>
                    {messageList.map((m, i) => (
                      <Message
                        key={i}
                        message={m.trans}
                        vi={m.vi}
                        en={m.en}
                        mine={m.src === uid}
                        last={messageList[i - 1]}
                        next={messageList[i + 1]}
                        final={m.final}
                        src={m.src}
                        viTranslation={translationEnabled}
                        photoURL={
                          usersInRoom &&
                          usersInRoom[m.src] &&
                          usersInRoom[m.src].photoURL
                        }
                      />
                    ))}
                  </List>
                </ScrollToBottom>
                <div className={classes.textInputContainer}>
                  <TextField
                    id="standard-textarea"
                    label="Chat"
                    placeholder="Type something..."
                    multiline
                    className={classes.textInput}
                    rowsMax={2}
                    rows={2}
                    variant="outlined"
                    onChange={onChangeText}
                    value={message}
                    onKeyDown={onKeyDown}
                    disabled={!isInCall}
                  />
                  <IconButton
                    className={classes.sendIcon}
                    onClick={onSendMessage}
                    disabled={!isInCall}
                  >
                    <Send />
                  </IconButton>
                </div>
              </Card>
            </Grid>
            <Grid item xs={5}>
              <Card className={classes.windowStyle}>
                <GridList className={classes.gridList}>
                  <GridListTile key={1} className={classes.videoWindowStyle}>
                    <div className="panel-body" id="videolocal" />
                    <GridListTileBar
                      titlePosition="top"
                      title={
                        <Typography variant="body1" id="publisher">
                          Local video
                        </Typography>
                      }
                    />
                  </GridListTile>
                  {remoteList.map((tile, index) => (
                    <GridListTile key={index} className={classes.videoWindowStyle}>
                      <div
                        className="panel-body relative"
                        id={'videoremote' + (tile + 1)}
                      />
                      <GridListTileBar
                        titlePosition="top"
                        title={
                          <Typography variant="body1" id={'remote' + (tile + 1)}>
                            Remote Video #{tile + 1}
                          </Typography>
                        }
                      />
                    </GridListTile>
                  ))}
                </GridList>
              </Card>
            </Grid>
          </Grid>
        </Grid>
        );
}

export default CallScreen

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: '#eee',
    height: 'calc(100vh - 64px)',
  },
  videoContainer: {
    marginTop: 0,
    margin: theme.spacing(2),
  },
  paper: {
    padding: theme.spacing(3),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  button: {
    marginLeft: theme.spacing(3),
    marginTop: 0,
    marginBottom: 0,
  },
  timerButton: {
    margin: theme.spacing(3),
    marginTop: 0,
    marginBottom: 0,
  },
  windowTitle: {},
  windowStyle: {
    height: '77vh',
    padding: theme.spacing(2),
  },
  videoWindowStyle: {
    minHeight: theme.spacing(30),
    border: 'solid 1px #000',
    maxHeight: theme.spacing(60),
  },
  subtitleBox: {
    borderRadius: theme.spacing(8),
    border: 'solid 1px #000',
    paddingLeft: theme.spacing(1),
    margin: theme.spacing(3),
  },
  listSubtitle: {
    overflow: 'auto',
    backgroundColor: '#fff',
    height: '69vh',
  },
  gridList: {
    overflow: 'scroll',
    height: '77vh',
    '&::-webkit-scrollbar': {
      display: 'block',
    },
  },
  textInputContainer: {
    width: '100%',
    justifyContent: 'center',
  },
  textInput: {
    width: '92%',
    fontWeight: 'normal',
  },
}));