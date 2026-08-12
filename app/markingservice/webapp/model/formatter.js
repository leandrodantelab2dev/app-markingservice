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
			return sConditionCode === "CRITICO" ? "Error" : "None";
		}
	};
});
