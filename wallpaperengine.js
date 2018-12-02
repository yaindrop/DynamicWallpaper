window.wallpaperPropertyListener = {
	applyUserProperties: function(properties) {
		var dwc = window.dynamicWPControl;
		if (properties.custombool) {
			dwc.prop.staticMode = properties.custombool.value;
			if (!dwc.initialized) dwc.initialize();
			else dwc.applyProps("custombool");
		}
		if (properties.custombool2) {
			dwc.prop.netLocation = properties.custombool2.value;
			if (!dwc.initialized) dwc.initialize();
			else dwc.applyProps("custombool2");
		}
		if (properties.customint) {
			dwc.prop.staticImgNo = properties.customint.value;
			if (!dwc.initialized) dwc.initialize();
			else dwc.applyProps("customint");
		}
		if (properties.customint2) {
			dwc.prop.sunriseTime = properties.customint2.value * 60;
			if (!dwc.initialized) dwc.initialize();
			else dwc.applyProps("customint2");
		}
		if (properties.customint3) {
			dwc.prop.sunsetTime = (12 + properties.customint3.value) * 60;
			if (!dwc.initialized) dwc.initialize();
			else dwc.applyProps("customint3");
		}
		if (properties.customint4) {
			dwc.prop.aniDuration = properties.customint4.value;
			if (!dwc.initialized) dwc.initialize();
			else dwc.applyProps("customint4");
		}
		if (properties.customint5) {
			dwc.prop.updateInt = properties.customint5.value;
			if (!dwc.initialized) dwc.initialize();
			else dwc.applyProps("customint5");
		}
	}
};
