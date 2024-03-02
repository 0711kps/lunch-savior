import type { ModalView } from 'npm:@slack/types'

export const modalBase: ModalView = {
  type: 'modal',
  title: {
    type: 'plain_text',
    text: ''
  },
  submit: {
    type: 'plain_text',
    text: ''
  },
  close: {
		type: "plain_text",
		text: "取消"
	},
  blocks: []
}
