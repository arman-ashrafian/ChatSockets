window.onload = function () {
    var conn;
    var msg = document.getElementById("msg");
    var log = document.getElementById("log");
    var screenname = ""


    function appendLog(item) {
        var doScroll = log.scrollTop > log.scrollHeight - log.clientHeight - 1;
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
        if(screenname == "") {
            promptUserForScreenName()
        }
        var message = {
            message: msg.value,
            from: screenname
        }
        conn.send(JSON.stringify(message));
        msg.value = ""; // clear message box
        return false;
    };

    if (window["WebSocket"]) {
        conn = new WebSocket("wss://" + document.location.host + "/ws");
        conn.onclose = function (evt) {
            var item = document.createElement("div");
            item.innerHTML = "<b>Connection closed.</b>";
            appendLog(item);
        };
        /* GET MESSAGE */
        conn.onmessage = function (evt) {
            var messages = evt.data.split('\n');
            for (var i = 0; i < messages.length; i++) {
                var message = JSON.parse(messages[i])
                var item = document.createElement("div");
                
                // display message
                item.innerHTML = `<b>${message.from}</b>: ${message.message}`;
                appendLog(item);
            }
        };
    } else {
        var item = document.createElement("div");
        item.innerHTML = "<b>Your browser does not support WebSockets.</b>";
        appendLog(item);
    }

    function promptUserForScreenName() {
        screenname = prompt("Enter screen name ya dum bitch");
    }
};