window.onload = function () {
    const DEBUG = true;

    let conn;
    let msg = document.getElementById("msg");
    let log = document.getElementById("log");
    let screenname = "";

    let websocketurl = (DEBUG ?
        "ws://" : "wss://") + document.location.host + "/ws";

    // Initialize screenname modal
    $('.modal').modal({
        ready: () => {$("#screenname").focus();}
    });
    $("#screennameError").hide();   // hide error initially
    $("#modalAgree").click(() => {
        let sn = $("#screenname").val();
        fetch(`registeruser/${sn}`)
            .then((resp) => {return resp.json()})
            .then((data) => {
                if (data['okay']) {
                    $('#screennameModal').modal('close');
                    screenname = sn;
                    sendMessage();
                } else {
                    $("#screennameError").show();
                }
            })
    })


    /* Set events for send click & enter pressed */
    $("#sendButton").click(sendMessage)
    $("#chatMsg").keypress((e) => {
        if (e.keyCode === 13) {
            sendMessage();
        }
    })

    /* check webscoket support */
    if (window["WebSocket"]) {
        conn = new WebSocket(websocketurl);
        conn.onclose = function (evt) {
            fetch(`unregister/${screenname}`)
            let item = document.createElement("div");
            item.innerHTML = "<b>Connection closed.</b>";
            appendLog(item);
        };
        /* GET MESSAGE */
        conn.onmessage = function (evt) {
            let messages = evt.data.split('\n');
            for (let i = 0; i < messages.length; i++) {
                displayMessage(messages[i]);
            }
        };
    } else {
        let item = document.createElement("div");
        item.innerHTML = "<b>Your browser does not support WebSockets.</b>";
        appendLog(item);
    }

    function displayMessage(mes) {
        let message = JSON.parse(mes)
        let item = document.createElement("h4");

        let backgroundColor = message.from === screenname ? "blue" : "grey"

        if (message.from === screenname) {
            backgroundColor = "blue";
            item.style.cssText = "margin-left: 60px;";
        } else {
            backgroundColor = "grey";
            item.style.cssText = "margin-right: 60px;";
        }

        // display message
        item.innerHTML = `<b>${message.from}</b>: ${message.message}`;
        appendLog(item, backgroundColor);
    }

    function sendMessage() {
        let msg = $("#chatMsg");

        if (!conn) {
            return false;
        }
        if (!msg.val()) {
            return false;
        }
        if (screenname == "") {
            promptUserForScreenName()
            return false;
        }
        let message = {
            message: msg.val(),
            from: screenname
        }
        conn.send(JSON.stringify(message));
        msg.val(""); // clear message input field
        return false;
    }

    function appendLog(item, backgroundColor) {
        let doScroll = log.scrollTop > log.scrollHeight - log.clientHeight - 1;
        item.classList.add("card", "messagecard", backgroundColor, "lighten-1", "flow-text")
        log.appendChild(item);
        if (doScroll) {
            log.scrollTop = log.scrollHeight - log.clientHeight;
        }
    }

    function promptUserForScreenName() {
        $('#screennameModal').modal('open');
    }
};