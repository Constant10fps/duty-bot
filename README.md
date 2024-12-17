## Setting it Up
- While configuring deployment, add the enviroment variables:
  ```
  TOKEN="[your bot token]"
  ADMIN_ID="[user id of the admin]"
  CHANNEL_ID="[channel id of the channel you want the posts in]"
  ```
- Don't forget to go to `[your project's name].deno.dev/webhook`

## Commands
- `/db` - setup the DB (send a list of your students in a single message)
- `/create` - setup the duty pairs (send the pairs in a single message)
- `/cancel` - cancel the current action
- `/duty` - [channel only] send the duty pair for today
