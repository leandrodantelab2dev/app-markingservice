sap.ui.define(function () {
	"use strict";

	return {
		kmRange: function (fFrom, fTo) {
			if (fFrom == null || fTo == null) {
				return "";
			}
			return fFrom + " - " + fTo;
		},

		conditionState: function (sConditionCode) {
			switch (sConditionCode) {
				case "CRITICO": return "Error";
				case "ATENCAO": return "Warning";
				case "OK": return "Success";
				default: return "None";
			}
		},

		// ponytail: OSM embed iframe, no map library/API key needed for a preview-only minimap
		mapEmbedHtml: function (fLatitude, fLongitude) {
			const fLat = Number(fLatitude);
			const fLon = Number(fLongitude);
			if (fLatitude === "" || fLongitude === "" || fLatitude == null || fLongitude == null || isNaN(fLat) || isNaN(fLon)) {
				return "<div></div>";
			}
			const fDelta = 0.005;
			const sBbox = [fLon - fDelta, fLat - fDelta, fLon + fDelta, fLat + fDelta].join(",");
			const sSrc = "https://www.openstreetmap.org/export/embed.html?bbox=" + sBbox + "&marker=" + fLat + "," + fLon;
			return '<iframe style="width:100%;height:220px;border:0" src="' + sSrc + '" loading="lazy"></iframe>';
		}
	};
});
