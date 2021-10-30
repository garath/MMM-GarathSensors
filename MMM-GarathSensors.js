/*
 * Magic Mirror module MMM-GarathSensor
 * https://github.com/garath/MMM-GarathSensors
 *
 * By Michael Stuckey
 * Licensed under MIT licensed
 *
 * Much inspiration for this design taken from MMM's default
 * modules. Thanks, Michael, for such a great project!
 */

Module.register("MMM-GarathSensors", {
	// Default module config.
	defaults: {
		updateIntervalMs: 60 * 1000, // Fetch new data every minute

		initialLoadDelay: 1 * 1000, // Wait one second for first load
		tableClass: "small"
	},

	getStyles: function () {
		return ["font-awesome.css"];
	},

	start: function () {
		// Set locale.
		moment.locale(config.language);

		this.sensors = null;
		this.scheduleUpdate(this.config.initialLoadDelay);
	},

	sensorData: [],

	// Override dom generator.
	getDom: function () {
		var wrapper = document.createElement("div");

		if (this.sensorData === null) {
			return wrapper;
		}

	  let sensorDataEntries = this.sensorData
		.sort((a, b) => a.address.localeCompare(b.address))
		.entries();

		var table = document.createElement("table");
		table.className = this.config.tableClass;
		wrapper.appendChild(table);

		for (const [, sensorDataEntry] of sensorDataEntries) {
			var row = document.createElement("tr");
			table.appendChild(row);

			var signalCell = document.createElement("td");
			signalCell.className = "fc-signal";
			row.appendChild(signalCell);

			var icon = document.createElement("span");
			icon.className = "symbol align-right fas " + this.getBatteryLevelIconClass(sensorDataEntry.battery);
			signalCell.appendChild(icon);

			var addressCell = document.createElement("td");
			addressCell.innerHTML = this.remapAddressName(sensorDataEntry.address);
			addressCell.className = "align-left title bright";
			row.appendChild(addressCell);

			var humidityCell = document.createElement("td");
			humidityCell.innerHTML = Math.round(sensorDataEntry.humidity) + "%";
			row.appendChild(humidityCell);

			var temperatureCell = document.createElement("td");
			temperatureCell.innerHTML = this.celsiusToFahrenheit(sensorDataEntry.temperatureCelsius) + "°" + "F";
			row.appendChild(temperatureCell);
		}

		return wrapper;
	},

	updateSensorData: function () {
		var url = this.config.apiUrl;
		var self = this;
		var retry = true;

		var request = new XMLHttpRequest();
		request.open("GET", url, true);

		request.onreadystatechange = function () {
			if (this.readyState === 4) {
				if (this.status === 200) {
					self.processSensorData(JSON.parse(this.response));
				} else {
					Log.error("Error fetching sensor data");
				}

				if (retry) {
					self.scheduleUpdate(self.loaded ? -1 : self.config.retryDelay);
				}
			}
		};

		request.send();
	},

	processSensorData: function (sensorData) {
		this.sensorData = sensorData;

		this.show(0, { lockString: this.identifier });
		this.loaded = true;
		this.updateDom(0);

		// Send notifications to other modules
		// TODO: use config.indoorAddress to determine which to send
		let indoorSensor = sensorData.find((element) => element.address === this.config.indoorAddress);
		if (indoorSensor) {
			this.sendNotification("INDOOR_TEMPERATURE", indoorSensor.temperatureCelsius);
			this.sendNotification("INDOOR_HUMIDITY", indoorSensor.humidity);
		}
	},

	/* scheduleUpdate()
	 * Schedule next update.
	 *
	 * argument delay number - Milliseconds before next update. If empty, this.config.updateInterval is used.
	 */
	scheduleUpdate: function (delay) {
		var nextLoad = this.config.updateIntervalMs;
		if (typeof delay !== "undefined" && delay >= 0) {
			nextLoad = delay;
		}

		var self = this;
		setTimeout(function () {
			self.updateSensorData();
		}, nextLoad);
	},

	celsiusToFahrenheit: function (temperatureCelsius) {
		return Math.round((9 / 5) * temperatureCelsius + 32);
	},

	remapAddressName: function (address) {
		let el = this.config.addressNameMap.find((element) => element.address === address);

		if (el) {
			return el.name;
		} else {
			return address;
		}
	},

	getBatteryLevelIconClass: function (batteryLevel) {
		if (!batteryLevel) {
			return "fa-battery-empty";
		} else if (batteryLevel >= 90) {
			return "fa-battery-full";
		} else if (batteryLevel >= 65 && batteryLevel < 90) {
			return "fa-battery-three-quarters";
		} else if (batteryLevel >= 40 && batteryLevel < 65) {
			return "fa-battery-half";
		} else if (batteryLevel >= 10 && batteryLevel < 40) {
			return "fa-battery-quarter";
		} else {
			return "fa-battery-empty";
		}
	}
});
