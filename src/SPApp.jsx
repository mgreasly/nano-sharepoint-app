import React, { useState, useEffect } from "react";
import { PublicClientApplication, EventType } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";

const msalConfig = {
    auth: {
        clientId: '7918b8d8-8a36-4187-83a8-fa86aca92abd',
        authority: "https://login.microsoftonline.com/b8651b44-c93f-47b6-bdea-bf021297ee44",
        redirectUri: window.location.origin
    },
    cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: false,
    }
};
const loginRequest = {
    scopes: ["https://t353r.sharepoint.com/.default"]
};
const siteUrl = "https://t353r.sharepoint.com/sites/t353r";
const folderPath = "Shared Documents/General";

const myMSALObj = new PublicClientApplication(msalConfig);
if (!myMSALObj.getActiveAccount() && myMSALObj.getAllAccounts().length > 0) myMSALObj.setActiveAccount(myMSALObj.getAllAccounts()[0]);
myMSALObj.enableAccountStorageEvents();
myMSALObj.addEventCallback((event) => {
    if (event.eventType === EventType.LOGIN_SUCCESS && event.payload.account) myMSALObj.setActiveAccount(event.payload.account);
});

export default () => {
    const [account, setAccount] = useState(null);
    const [value, setValue] = useState(null);
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
    const getInfo = () => {
        myMSALObj.acquireTokenSilent(loginRequest)
            .catch(error => {
                return myMSALObj.acquireTokenPopup(request)
                    .then(tokenResponse => tokenResponse)
                    .catch(error => console.log(error));
            })
            .then(response => {
                const headers = new Headers();
                headers.append('Authorization', `Bearer ${response.accessToken}`);
                headers.append('Accept', 'application/json;odata=verbose');
                fetch(`${siteUrl}/_api/web/GetFolderByServerRelativeUrl('${folderPath}')/Files`, { method: 'GET', headers: headers })
                    .then(response => response.json())
                    .then(response => setValue(response))
                    .catch(error => console.log(error))
            })
            .catch(error => console.log(error));
    }

    return (
        <MsalProvider instance={myMSALObj}>
            {!account && <button onClick={signIn}>Sign In</button>}
            {account && <button onClick={signOut}>Sign Out</button>}
            <button onClick={getInfo}>Get Web Info</button>
            <hr />
            {value && value.d.results.map((item, id) => <p key={id}>{item.ServerRelativeUrl}</p>)}
            <hr />
            {account && <pre>{JSON.stringify(account, null, 2)}</pre>}
            <hr />
            {value && <pre>{JSON.stringify(value, null, 2)}</pre>}
            <hr />
        </MsalProvider>
    );
}

// <hr />
// {account && <pre>{JSON.stringify(account, null, 2)}</pre>}
