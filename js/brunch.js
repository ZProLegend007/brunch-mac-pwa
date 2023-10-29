window.onload = function () {

	if (window["WebSocket"]) {
		ws_connect();
		ws.onclose = function (evt) {
			document.body.innerHTML = '<div style="direction: ltr; position: fixed; top: 0; z-index: 999999; display: block; width: 100%; height: 100%; background: #33266e"><p style="position: relative; top: 40%; display: block; font-size: 32px; font-weight: bold; color: #fff; margin: 0 auto; text-align: center">To use this feature you need to enable the brunch "pwa" option.</p></div>';
		};
	} else {
		document.body.innerHTML = '<div style="direction: ltr; position: fixed; top: 0; z-index: 999999; display: block; width: 100%; height: 100%; background: #33266e"><p style="position: relative; top: 40%; display: block; font-size: 32px; font-weight: bold; color: #fff; margin: 0 auto; text-align: center">To use this feature you need to enable the brunch "pwa" option.</p></div>';
	}

	checkCookie();
	
	window.addEventListener('appinstalled', () => {
		window.location.reload();
	});

	async function periodicsync() {
		const registration = await navigator.serviceWorker.ready;
		try {
			await registration.periodicSync.register('get-latest-version', {
				minInterval: 12 * 60 * 60 * 1000,
			});
		} catch {
			console.log('Periodic Sync could not be registered!');
			return;
		}
		if (Notification.permission !== "granted") {
			if (await Notification.requestPermission() === "granted") {
				setCookie("notifications", "yes");
				showNotification("Only brunch-mac stable release update notifications are enabled by default. You can add more in the settings tab.", "brunch-mac");
				return;
			}
			console.log("Notifications disabled by user");
			setCookie("notifications", "no");
			await registration.periodicSync.unregister('get-latest-version');
		}
	}

	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.register('/brunch-mac-pwa/sw.js', {scope: '/brunch-mac-pwa/'}).then(function(reg) {
			console.log('Registration succeeded. Scope is ' + reg.scope);
			periodicsync();
		}).catch(function(error) {
			console.log('Registration failed with ' + error);
		});
	};

	refresh_data = function() {
		document.getElementById("log").innerHTML = log;
	};
	
	cookieStore.addEventListener('change', event => {
  		console.log(`${event.changed.length} changed cookies`);
  		for (const cookie of event.changed) {
    			console.log(`Cookie ${cookie.name} changed to ${cookie.value}`);
			if (cookie.value) {
				switch (cookie.name) {
				  case "brunch_version":
					document.getElementById("brunch-mac-version").innerHTML = '<b>Installed Brunch-mac:</b><br>'+cookie.value;
					break;
				  case "latest_stable":
					document.getElementById("latest").innerHTML = '<b>Latest Brunch-mac:</b><br>'+cookie.value+'<br> ;
					document.getElementById("form").innerHTML = '<button type="submit" class="buttonstyle">Install the latest brunch-mac</button>';
					break;
				}
			}
		}

  		console.log(`${event.deleted.length} deleted cookies`);
 		for (const cookie of event.deleted) {
			console.log(`Cookie ${cookie.name} deleted`);
			switch (cookie.name) {
			  case "brunch_version":
				document.getElementById("brunch-mac-version").innerHTML = '';
				break;
			  case "latest_stable":
				document.getElementById("latest").innerHTML = '';
				document.getElementById("form").innerHTML = '';
				break;
			}
		}
	});
	
	document.getElementById("form").onsubmit = function () {
		document.getElementById("log").style.background = "#A9A9A9";
		log = "<center><b>Console log:</b></center><br>";
		document.getElementById("log").innerHTML = log;
		if (!ws) {
			return false;
		}
		ws.send("update");
		return false;
	};

	setTimeout(() => { ws.send("brunch-mac-version\nlatest\nlatest-chromeos"); }, 2000);
};
