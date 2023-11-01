var ws;
var log = "";

function refresh_data() {
    console.log("Data refresh requested without display");
}

function reboot() {
    ws.send("reboot");
}

function showNotification(notification_text, tabname) {
    const title = 'Brunch-mac PWA';
    const options = {
        body: notification_text,
        icon: '/brunch-mac-pwa/images/icons/144.png',
        data: {
            tab: tabname,
        }
    };

    // Check if the Notification API is supported
    if ("Notification" in window) {
        Notification.requestPermission()
            .then(function (permission) {
                if (permission === "granted") {
                    new Notification(title, options);
                }
            });
    }
}

function showUpdateNotification() {
    if (Notification.permission === "granted") {
        const notification_text = "You will need to reboot to finish the update. Click below to reboot.";
        const tabname = "Almost there!"; // You can change the tabname as needed

        const title = 'Brunch-mac PWA';
        const options = {
            body: notification_text,
            icon: '/brunch-mac-pwa/images/icons/144.png',
            data: {
                tab: tabname,
            }
        };
        options.actions = [
            { action: 'reboot', title: 'Reboot' }
        ];
        // Check if the Notification API is supported
        if ("Notification" in window) {
            Notification.requestPermission()
                .then(function (permission) {
                    if (permission === "granted") {
                        new Notification(title, options);
                    }
                });
        }
    }
}

function ws_connect() {
    ws = new WebSocket("ws://localhost:8080");
    ws.onclose = function (evt) {
        console.log("Connection closed");
    };
    ws.onmessage = async function (evt) {
        var notifications = await getCookie("notifications");
        var brunch_stable = await getCookie("brunch_stable");
        var latest_stable = await getCookie("latest_stable");
        var chromeos = await getCookie("chromeos");
        var latest_chromeos = await getCookie("latest_chromeos");
        var messages = evt.data.split(':next:');
        var showUpdateNotificationCondition = false; // Add this condition

        for (var i = 0; i < messages.length; i++) {
            console.log("Message received: " + messages[i]);

            if (messages[i] === "NTriggerwoohoo") {
                showUpdateNotification();
                continue; // Skip other checks if this message is found
            }
            if (messages[0] === "brunch-mac-version") {
                setCookie("brunch_version", messages[1]);
                break;
            }
            if (messages[0] === "latest") {
                if (notifications.value === "yes" && brunch_stable.value === "yes") {
                    if (latest_stable.value !== "" && messages[1] !== "" && latest_stable.value !== messages[1]) {
                        showUpdateNotification();
                        showUpdateNotificationCondition = true;
                    }
                }
                setCookie("latest_stable", messages[1]);
                break;
            }
            if (messages[0] === "chromeos-version") {
                setCookie("chromeos_version", messages[1]);
                break;
            }
            if (messages[0] === "latest-chromeos") {
                if (notifications.value === "yes" && chromeos.value === "yes") {
                    if (latest_chromeos.value !== "" && messages[1] !== "" && latest_chromeos.value !== messages[1]) {
                        showNotification("New recovery image available: " + messages[1], "chromeos");
                    }
                }
                setCookie("latest_chromeos", messages[1]);
                break;
            }
            log += messages[i] + '<br>';
        }

        if (showUpdateNotificationCondition) {
            showUpdateNotification();
        }

        refresh_data();
    };
}

// ... Rest of the code ...
