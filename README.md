# duty bot: organise

## Setting it Up
1. Fork this repository
2. Go to [Deno Deploy 🦕](deno.com/deploy) and [sign in](dash.deno.com/signin)
3. Create the project:
  - Choose this repo (the one you forked)
  - For entrypoint, select `deploy.ts`
  - Create the project
4. Add the enviroment variables:
  ```
  TOKEN="[your bot token]"
  ADMIN_ID="[user id of the admin]"
  CHANNEL_ID="[channel id of the channel you want the posts in]"
  ```
5. Go to `[your project's name].deno.dev/webhook`
6. The bot is ready to set up!

## Commands
- `/db` - setup the DB (send a list of your students in a single message)
- `/create` - setup the duty pairs (send the pairs in a single message)
- `/cancel` - cancel the current action
- `/duty` - [channel only] send the duty pair for today
