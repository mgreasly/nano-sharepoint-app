import React, { useState, useEffect } from "react";
import { PublicClientApplication, EventType } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";

const msalConfig = {
    auth: {
        clientId: '7918b8d8-8a36-4187-83a8-fa86aca92abd',
        authority: "https://login.microsoftonline.com/b8651b44-c93f-47b6-bdea-bf021297ee44",
        redirectUri: 'http://localhost:3000'
    },
    cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: false,
    }
};
const loginRequest = { scopes: ["openid", "profile", "User.Read"] };

const myMSALObj = new PublicClientApplication(msalConfig);
if (!myMSALObj.getActiveAccount() && myMSALObj.getAllAccounts().length > 0) myMSALObj.setActiveAccount(myMSALObj.getAllAccounts()[0]);
myMSALObj.enableAccountStorageEvents();
myMSALObj.addEventCallback((event) => {
    if (event.eventType === EventType.LOGIN_SUCCESS && event.payload.account) myMSALObj.setActiveAccount(event.payload.account);
});

export default () => {
    const [account, setAccount] = useState(null);
    const [profile, setProfile] = useState(null);
    useEffect(() => {
        setAccount(myMSALObj.getActiveAccount());
    }, []);

    const signIn = () => {
        myMSALObj.loginPopup(loginRequest)
            .then(loginResponse => {
                setAccount(myMSALObj.getActiveAccount());
            }).catch(error => {
                console.log(error);
            });
    }
    const signOut = () => {
        myMSALObj.logout();
    }
    const getProfile = () => {
        myMSALObj.acquireTokenSilent(loginRequest)
            .catch(error => {
                return myMSALObj.acquireTokenPopup(request)
                    .then(tokenResponse => tokenResponse)
                    .catch(error => console.log(error));
            })
            .then(response => {
                const headers = new Headers();
                headers.append('Authorization', `Bearer ${response.accessToken}`);
                fetch('https://graph.microsoft.com/v1.0/me', { method: 'GET', headers: headers })
                    .then(response => response.json())
                    .then(response => setProfile(response))
                    .catch(error => console.log(error))
            })
            .catch(error => console.log(error));
    }

    return (
        <MsalProvider instance={myMSALObj}>
            {!account && <button onClick={signIn}>Sign In</button>}
            {account && <button onClick={signOut}>Sign Out</button>}
            <button onClick={getProfile}>Get Profile</button>
            <hr />
            {account && <pre>{JSON.stringify(account, null, 2)}</pre>}
            <hr />
            {profile && <pre>{JSON.stringify(profile, null, 2)}</pre>}
            <hr />
        </MsalProvider>
    );
} 