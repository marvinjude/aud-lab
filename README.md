## Push Audience data from your app to Facebook Ads

### Development

```bash
npm install
```

```bash
npm run dev
```

## Environment Variables

Grab integration.app workspace credentials from your workspace [settings page](https://console.integration.app/w/0/settings/general).

Add the following to your `.env` file:

```

INTEGRATION_APP_WORKSPACE_KEY=YOUR_WORKSPACE_KEY
INTEGRATION_APP_WORKSPACE_SECRET=YOUR_WORKSPACE_SECRET

MONGODB_URI=mongodb://localhost:27017/aud-lab

```

## Add App Oauth Credentials

Go to Apps > Facebook Ads Then add your app credentials to the `oauth` section of the app. See [Facebook Ad Integration Guide](https://console.integration.app/w/0/external-apps/integrations/67fb377f6d23e22e1c720952/connector/docs/configuration) for details on how to create those.

### How it works

At its core this is a simple app with audiences and members. Using integration app, we are able to push members/users in an audience to facebook Ad Platform.

Your integration app workspace already has several actions that make this work:

- _list-ad-accounts_: list all ad accounts
- _create-users-in-audience_: create users in an audience
- _create-custom-audience_: create a custom audience
- _replace-users-in-audience_: replace users in an audience
- _list-custom-audiences_: list all your custom audiences on facebook

You can search the codebase for these actions to see how they work.

### Syncing to Audience

The replace-user-in-audience and create-users-in-audience actions are used to add users to an audience and they have the same signature.

Both actions use the same payload structure:

```typescript
interface SyncPayload {
  audienceId: string; // Facebook audience ID
  data: UserData[]; // Array of user data to sync
  session: {
    id: string; // Unique session identifier
    batchSeq: number; // Current batch number
    lastBatchFlag: boolean; // Indicates if this is the final batch
  };
}
```

in this POC, we are fetching data in batch of 100 from our database and we are using the sessionId to track the process.

```js
const sessionId = simpleRandomUint64();
```

### Automated sync

If you decide to do the sync with a cron job, we've added a function called `periodicSyncForAllUsers` to the `lib/periodicSync.ts` as an example.
