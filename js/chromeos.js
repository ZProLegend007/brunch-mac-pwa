window.onload = function () {
    if (window["WebSocket"]) {
        ws_connect();
        ws.onclose = function (evt) {
            document.body.innerHTML = '<div style="direction: ltr; position: fixed; top: 0; z-index: 999999; display: block; width: 100%; height: 100%; background: #33266e"><p style="position: relative; top: 40%; display: block; font-size: 32px; font-weight: bold; color: #fff; margin: 0 auto; text-align: center">Connecting to your device.<br>If this screen stays for longer than a brief period please reload or notify ZProLegend007.</p></div>';
        };
    } else {
        document.body.innerHTML = '<div style="direction: ltr; position: fixed; top: 0; z-index: 999999; display: block; width: 100%; height: 100%; background: #33266e"><p style="position: relative; top: 40%; display: block; font-size: 32px; font-weight: bold; color: #fff; margin: 0 auto; text-align: center">Connecting to your device.<br>If this screen stays for longer than a brief period please reload or notify ZProLegend007.</p></div>';
    }

    checkCookie();

    window.addEventListener('appinstalled', () => {
        window.location.reload();
    });

    refresh_data = function() {
        document.getElementById("log").innerHTML = log;
    };
    
    cookieStore.addEventListener('change', event => {
        console.log(`${event.changed.length} changed cookies`);
        for (const cookie of event.changed) {
            console.log(`Cookie ${cookie.name} changed to ${cookie.value}`);
            if (cookie.value) {
                switch (cookie.name) {
                    case "chromeos_version":
                        document.getElementById("chromeos-version").innerHTML = '<b>Installed ChromeOS:</b><br>' + cookie.value;
                        break;
                    case "latest_chromeos":
                        document.getElementById("latest-chromeos").innerHTML = '<b>Latest ChromeOS:</b><br>' + cookie.value;
                        document.getElementById("form3").innerHTML = '<button type="submit" class="buttonstyle">Install the latest chromeos image</button>';
                        break;
                }
            }
        }

        console.log(`${event.deleted.length} deleted cookies`);
        for (const cookie of event.deleted) {
            console.log(`Cookie ${cookie.name} deleted`);
            switch (cookie.name) {
                case "chromeos_version":
                    document.getElementById("chromeos-version").innerHTML = '';
                    break;
                case "latest_chromeos":
                    document.getElementById("latest-chromeos").innerHTML = '';
                    document.getElementById("form3").innerHTML = '';
                    break;
            }
        }
    });

    document.getElementById("form3").onsubmit = function () {
        document.getElementById("log").style.background = "#191e2e";
        log = "<center><b>Console log:</b></center><br>";
        document.getElementById("log").innerHTML = log;
        if (!ws) {
            return false;
        }
        ws.send("update-chromeos");
        return false;
    };

    // Function to show a notification for the update completion
    function showUpdateNotification() {
        if (Notification.permission === "granted") {
            const notification = new Notification("Almost there!", {
                body: "You will need to reboot to finish the update. Click below to reboot.",
            });

            // Add a button to the notification
            notification.addEventListener("click", function () {
                const buttonText = "Reboot"; // Button text is set to "Reboot"
                // Add your reboot logic here
                // For example, you can reload the page or execute a reboot command.
                // window.location.reload(); // Reload the page
                // Send a message to the PWA's helper script to trigger the reboot.
                if (ws) {
                    ws.send("reboot");
                }
            });
        }
    }

    // Simulate an update completion event (call this when the update is completed)
    function simulateUpdateCompletion() {
        // Show the update notification when the update is completed
        showUpdateNotification();
    };

    setTimeout(() => {
        ws.send("chromeos-version\nlatest-chromeos");
    }, 2000);
};
