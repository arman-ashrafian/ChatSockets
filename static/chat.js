window.onload = function () {
    const DEBUG = true;

    let conn;
    let msg = document.getElementById("msg");
    let log = document.getElementById("log");
    let screenname = "";

    let websocketurl = (DEBUG ?
        "ws://" : "wss://") + document.location.host + "/ws";

    function appendLog(item) {
        let doScroll = log.scrollTop > log.scrollHeight - log.clientHeight - 1;
        log.appendChild(item);
        if (doScroll) {
            log.scrollTop = log.scrollHeight - log.clientHeight;
        }
    }

    /* SEND MESSAGE EVENT */
    document.getElementById("form").onsubmit = function () {
        if (!conn) {
            return false;
        }
        if (!msg.value) {
            return false;
        }
        if (screenname == "") {
            promptUserForScreenName()
        }
        let message = {
            message: msg.value,
            from: screenname
        }
        conn.send(JSON.stringify(message));
        msg.value = ""; // clear message input field
        return false;
    };

    if (window["WebSocket"]) {
        conn = new WebSocket(websocketurl);
        conn.onclose = function (evt) {
            let item = document.createElement("div");
            item.innerHTML = "<b>Connection closed.</b>";
            appendLog(item);
        };
        /* GET MESSAGE */
        conn.onmessage = function (evt) {
            let messages = evt.data.split('\n');
            for (let i = 0; i < messages.length; i++) {
                let message = JSON.parse(messages[i])
                let item = document.createElement("div");

                // display message
                item.innerHTML = `<b>${message.from}</b>: ${message.message}`;
                appendLog(item);
            }
        };
    } else {
        let item = document.createElement("div");
        item.innerHTML = "<b>Your browser does not support WebSockets.</b>";
        appendLog(item);
    }

    function promptUserForScreenName() {
        screenname = prompt("Enter screen name ya dum bitch");
    }
};