import { WebClient as SlackClient } from 'npm:@slack/web-api'

export const slackClient = new SlackClient(Deno.env.get('SLACK_TOKEN'))
