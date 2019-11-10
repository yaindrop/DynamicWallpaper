window.dynamicWPControl = {

	// Wallpaper metadatas
	imgCount: null,
	sunriseImgNo: null,
	sunsetImgNo: null,

	// Properties
	prop: {
		staticMode: null,
		staticImgNo: null,
		netLocation: null,
		sunriseTime: null,
		sunsetTime: null,
		aniDuration: null,
		updateInt: null
	},

	locationServers: [
		{
			name: "geoplugin.net",
			url: "http://www.geoplugin.net/json.gp",
			lngKey: "geoplugin_longitude",
			latKey: "geoplugin_latitude",
			waiting: false
		},
		{
			name: "ip-api.com",
			url: "http://ip-api.com/json",
			lngKey: "lon",
			latKey: "lat",
			waiting: false
		}
	],

	// Control status
	initialized: false, 
	requestingLocation: false,
	requestingSunTime: false,
	sunriseTime: null, 
	sunsetTime: null, 
	timeCycle: null, 
	updateTimer: null,
	preload: [],
	imgNo: 1,

	// Apply new image with number n
	applyImg: function(n) {
		document.body.style.backgroundImage = "url('img/" + n + ".png')";
		this.imgNo = n;
	},

	getImgNo: function(time) {
		for (var i = 1; i <= this.imgCount; i ++) {
			var interval = Math.abs(this.timeCycle[i] - this.timeCycle[i + 1]);
			if ((time >= this.timeCycle[i] && time < this.timeCycle[i] + interval) 
				|| (time >= this.timeCycle[i + 1] - interval && time < this.timeCycle[i + 1])) return i;
		}
		return this.imgNo;
	},

	// Check current image and update as desired
	update: function() {
		if (this.requestingLocation || this.requestingSunTime) return;
		if (this.prop.staticMode) {
			if (this.imgNo != this.prop.staticImgNo) this.applyImg(this.prop.staticImgNo);
		} else {
			var d = new Date();
			var n = this.getImgNo(60 * d.getHours() + d.getMinutes());
			if (this.imgNo != n) this.applyImg(n);
		}
	},

	// Set update timer
	startUpdate: function() {
		this.update();
		if (this.updateTimer) clearInterval(this.updateTimer);
		this.updateTimer = setInterval(function() {
			window.dynamicWPControl.update();
		}, this.prop.updateInt * 1000);
	},

	// Set update timer
	stopUpdate: function() {
		clearInterval(this.updateTimer);
		this.updateTimer = null;
		this.update();
	},

	// Calculate and fill the timeCycle array with start time for each image
	calcTimeCycle: function() {
		var res = new Array(this.imgCount + 1);
		var sunriseFirst = this.sunriseImgNo < this.sunsetImgNo;
		var startImgNo = sunriseFirst ? this.sunriseImgNo : this.sunsetImgNo;
		var endImgNo = sunriseFirst ? this.sunsetImgNo : this.sunriseImgNo;
		var startTime = sunriseFirst ? this.sunriseTime : this.sunsetTime;
		var endTime = sunriseFirst ? this.sunsetTime : this.sunriseTime;
		var insideInterval = (endTime - startTime) / (endImgNo - startImgNo);
		var outsideInterval = (24*60 - endTime + startTime) / (this.imgCount - endImgNo + startImgNo);

		res[startImgNo] = startTime;
		res[endImgNo] = endTime;
		for (var i = startImgNo - 1; i >= 1; i --) res[i] = res[i+1] - outsideInterval;
		for (var i = startImgNo + 1; i < endImgNo; i ++) res[i] = res[i-1] + insideInterval;
		for (var i = endImgNo + 1; i <= this.imgCount + 1; i ++) res[i] = res[i-1] + outsideInterval;
		for (var i = 1; i <= this.imgCount + 1; i ++) {
			if (res[i] >= 24*60) res[i] -= 24*60;
			else if (res[i] < 0) res[i] += 24*60;
		}
		this.timeCycle = res;
	},

	updateTimeCircle: function() {
		this.calcTimeCycle();
		this.update();
	},

	applyManualSunTime: function () {
		this.sunriseTime = this.prop.sunriseTime;
		this.sunsetTime = this.prop.sunsetTime;
		this.updateTimeCircle();
	},

	requestJSON: function(server, handler) {
		var request = new XMLHttpRequest();
		request.open('GET', server.url, true);
		var dwc = window.dynamicWPControl;
		request.onload = function() {
			dwc[handler]({
				server: server,
				data: (this.status >= 200 && this.status < 400) ? JSON.parse(this.response) : null
			});
		};
		request.onerror = function() {
			dwc[handler](null);
		};
		request.send();
	},

	// Use location API to get local latitude and longitude
	requestLocation: function() {
		this.requestingLocation = true;
		for (var i in this.locationServers) {
			this.locationServers[i].waiting = true;
			this.requestJSON(this.locationServers[i], "receiveLocation");
		};
	},

	receiveLocation: function(response) {
		if (!this.requestingLocation) return;
		if (response.data) {
			this.requestingLocation = false;
			this.requestJSON({
				name: "sunrise-sunset.org",
				url: "https://api.sunrise-sunset.org/json?formatted=0&lat=" + response.data[response.server.latKey] + "&lng=" + response.data[response.server.lngKey]
			}, "receiveSunTime");
			this.requestingSunTime = true;
		} else {
			response.server.waiting = false;
			for (var i in this.locationServers) if (this.locationServers[i].waiting) return;
			this.requestingLocation = false;
			this.applyManualSunTime();
		}
	},

	receiveSunTime: function(response) {
		if (!this.requestingSunTime) return;
		if (response.data) {
			this.requestingSunTime = false;
			var sunriseDate = this.parseISOString(response.data.results.sunrise);
			var sunsetDate = this.parseISOString(response.data.results.sunset);
			this.sunriseTime = 60 * sunriseDate.getHours() + sunriseDate.getMinutes();
			this.sunsetTime = 60 * sunsetDate.getHours() + sunsetDate.getMinutes();
			this.makingRequest = false;
			this.updateTimeCircle();
		} else {
			this.requestingSunTime = false;
			this.applyManualSunTime();
		}
	},
	
	// Convert ISO time string to Date object
	parseISOString: function (s) {
		var b = s.split(/\D+/);
		return new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[6]));
	},

	// Apply properties to adjust control status
	applyProps: function(option) {
		if (!option || option == "customint4") document.body.style.transition = "all " + this.prop.aniDuration + "s ease-out";
		if (!option || option == "custombool2")  this[this.prop.netLocation ? "requestLocation" : "applyManualSunTime"]();
		if (!option || option == "customint2" || option == "customint3") this.updateTimeCircle();
		if (!option || option == "custombool") this[this.prop.staticMode ? "stopUpdate" : "startUpdate"]();
		if (!option || option == "customint") if (this.prop.staticMode) this.update();
		if (option == "customint5") {
			this.stopUpdate();
			this.startUpdate();
		}
	},

	// When properties are loaded, initialize the object
	initialize: function() {
		var propLoaded = (this.prop.staticMode !== null) && this.prop.staticImgNo
			&& (this.prop.netLocation !== null) && this.prop.sunriseTime && this.prop.sunsetTime
			&& (this.prop.aniDuration !== null) && this.prop.updateInt;
		if (!propLoaded || this.initialized) return;
		this.applyProps();
		for (var i = 1; i <= this.imgCount; i ++) this.preload += new Image("img/" + i + ".png");
		this.initialized = true;
	}
};
