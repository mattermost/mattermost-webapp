// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

return bindClientFunc({
    clientFunc: Client4.CLIENTFUNC,
    params: [PARAMS],
    onRequest: UserTypes.ONREQUEST,
    onSuccess: UserTypes.ONSUCCESS,
    onFailure: UserTypes.ONFAILURE,
});
