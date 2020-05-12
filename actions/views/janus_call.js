import firebase from 'firebase'

export const createJanusRoom = (onCreateRoomDone) => {
    let uid = 'ix5kguhyziggtqne99ux96zo3a';
    let roomPath = '/onFlight/getRoomID/' + uid;
    let roomId = moment().valueOf();

    //find room id by user id
    await firebase
      .database()
      .ref(roomPath)
      .set({ roomId, status: 'init' });

    let roomPathRef = firebase.database().ref(roomPath);
    let listener = roomPathRef.on('value', async snapshot => {
      let roomStatus = snapshot.val();
      if (roomStatus && roomStatus.status === 'ready') {
        //set to path
        await onJoinRoomSuccess(
          dispatch,
          roomId,
          uid,
          userName,
          role,
        );
        roomPathRef.off('value', listener);
        onCreateRoomDone(roomId);
      }
    });
}