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
		window.location.href = "../index.html";
	});

	refresh_data = function() {
		document.getElementById("log").innerHTML = log;
	};
	
	if (navigator.onLine) {
	document.getElementById("form4").innerHTML = '<button type="submit" class="buttonstyle">Install / Update the brunch-toolchain and brioche</button>';
	document.getElementById("warning").innerHTML = '<b>Warning: This will remove any data installed in /usr/local (notably the brunch-toolkit / chromebrew / crouton)</b>';
	document.getElementById("form5").innerHTML = '<button type="submit" class="buttonstyle">Install / Update the brunch-toolkit</button>';

	document.getElementById("form4").onsubmit = function () {
		document.getElementById("log").style.background = " #191e2e";
		log = "<center><b>Console log:</b></center><br>";
		document.getElementById("log").innerHTML = log;
		if (!ws) {
			return false;
		}
		ws.send("install-toolchain");
		return false;
	};

	document.getElementById("form5").onsubmit = function () {
		document.getElementById("log").style.background = " #191e2e";
		log = "<center><b>Console log:</b></center><br>";
		document.getElementById("log").innerHTML = log;
		if (!ws) {
			return false;
		}
		ws.send("install-toolkit");
		return false;
	};
	}
};
