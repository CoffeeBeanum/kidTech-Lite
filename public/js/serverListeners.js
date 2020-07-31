import { client } from './startSettings.js'

client.on('server message', function (msg) {
    let id = (messageId.length > 0) ? messageId[messageId.length - 1] + 1 : 0;
    messageId.push(id);
    if (messageId.length > maxMessages) {
        $('#chat' + messageId[0]).remove();
        messageId.shift();
    }

    let output;

    if (msg.type === 0) {
        msg.text = parseModifiers(msg.text);
        output = "<span id='chat" + id + "'><span style='color: #c3c3c3;'>" + msg.name + ": </span>" + msg.text + "<br></span>";
        $('#chatOutput').append(output);
        playChatSound(msg);
    } else if (msg.type === 1) {
        let temp = new Image();
        temp.src = msg.text;
        temp.onload = function () {
            if (temp.width > 0) {
                let width = temp.width;
                if (width > 300) width = 300;
                let height = temp.height / temp.width * width;
                if (height > 300) {
                    height = 300;
                    width = temp.width / temp.height * height;
                }
                output = "<span id='chat" + id + "'><span style='color: #c3c3c3;'>" + msg.name + ": </span><img src='" + msg.text + "' width='" + width + "'><br></span>";
                $('#chatOutput').append(output);
                playChatSound(msg);
            }
        };
    }
});