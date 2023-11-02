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
    if (typeof window !== 'undefined') {
        navigator.serviceWorker.ready
            .then(sw => {
                sw.showNotification(title, options);
            })
            .catch(error => {
                console.error('Error showing notification:', error);
            });
    } else {
        self.registration.showNotification(title, options);
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

        // Add a button to the notification
        options.actions = [
            { action: 'reboot', title: 'Reboot' }
        ];

        if (typeof window !== 'undefined') {
            navigator.serviceWorker.ready
                .then(sw => {
                    sw.showNotification(title, options).then(function (notification) {
                    });
                })
                .catch(error => {
                    console.error('Error showing notification:', error);
                });
        } else {
            self.registration.showNotification(title, options).then(function (notification) {
            });
        }
    }
}
console.log = function (message) {
    if (message === "Almost there!") {
        // Trigger a reboot
        reboot();
    }
};
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
                    if (latest_stable && latest_stable.value !== "" && messages[1] !== "" && latest_stable.value !== messages[1]) {
                        showNotification("New brunch-mac release available: " + messages[1], "brunch-mac");
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
                    if (latest_chromeos && latest_chromeos.value !== "" && messages[1] !== "" && latest_chromeos.value !== messages[1]) {
                        showNotification("New recovery image available: " + messages[1], "chromeos");
                    }
                }
                setCookie("latest_chromeos", messages[1]);
                break;
            }
            log += messages[i] + '<br>';
        }
        refresh_data();
    };
}
