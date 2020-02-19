import $ from 'jquery';

export class Message {
  private static _errorElement: JQuery<HTMLElement>;
  private static _skipTimeout: boolean = false;
  constructor(message: string, type: 'error' | 'info') {
    if (Message._errorElement) {
      Message._errorElement.remove();
      Message._skipTimeout = true;
    }
    $('body').append(`<div class="message-parent"><div class="${type}-message message">${message}</div></div>`);
    Message._errorElement = $('body > *:last-child');
    setTimeout(() => {
      if (!Message._skipTimeout) Message._errorElement.remove();
      else Message._skipTimeout = false;
    }, 5000);
  }
}
