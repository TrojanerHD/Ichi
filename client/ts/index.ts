import $ from 'jquery';
import { WebSocketClient } from './WebSocketClient';
import SHA256 from 'crypto-js/sha256';
import { Message } from './Message';
import '../dist/css/index.css';

const ws: WebSocketClient = new WebSocketClient();
ws.connect();
$(ready);

function ready(): void {
  $('form').on('submit', onSubmit);
}

function onSubmit(event: Event) {
  event.preventDefault();
  const username: string = $('input#username')
    .val()
    .toString();
  if (username.match(/^\s$/)) {
    new Message('A name is required', 'error');
    return;
  }
  WebSocketClient.sendMessage({
    event: 'login',
    message: JSON.stringify({
      username: $('input#username')
        .val()
        .toString(),
      password: SHA256(
        $('input#room-password')
          .val()
          .toString()
      ).toString()
    })
  });
}
