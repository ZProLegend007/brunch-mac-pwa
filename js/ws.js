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
    if (typeof Window !== 'undefined') {
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

        if (typeof Window !== 'undefined') {
            navigator.serviceWorker.ready
                .then(sw => {
                    console.log("Service Worker is ready.");
                    sw.showNotification(title, options).then(function (notification) {
                        console.log("Notification shown.");
                        // Handle the button click
                        notification.addEventListener("notificationclick", function (event) {
                            if (event.action === "reboot") {
                                console.log("Reboot button clicked.");
                                // Add your reboot logic here
                                // For example, you can reload the page or execute a reboot command.
                                // window.location.reload(); // Reload the page
                                // Send a message to the PWA's helper script to trigger the reboot.
                                reboot();
                                if (ws) {
                                    console.log("Sending reboot command to ws.");
                                    ws.send("reboot");
                                }
                            }
                        });
                    });
                })
                .catch(error => {
                    console.error('Error showing notification:', error);
                });
        } else {
            console.error('Service Worker is not available.');
            self.registration.showNotification(title, options).then(function (notification) {
                console.log("Notification shown.");
                // Handle the button click
                self.addEventListener("notificationclick", function (event) {
                    if (event.action === "reboot") {
                        console.log("Reboot button clicked.");
                        // Add your reboot logic here
                        // For example, you can reload the page or execute a reboot command.
                        // window.location.reload(); // Reload the page
                        // Send a message to the PWA's helper script to trigger the reboot.
                        reboot();
                        if (ws) {
                            console.log("Sending reboot command to ws.");
                            ws.send("reboot");
                        }
                    }
                });
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
