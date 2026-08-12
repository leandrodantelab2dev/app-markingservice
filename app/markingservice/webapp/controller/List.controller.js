sap.ui.define([
	"./BaseController",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (BaseController, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("markingservice.controller.List", {

		onInit: function () {
			this.getRouter().getRoute("main").attachPatternMatched(this._onMainMatched, this);
		},

		_onMainMatched: function () {
			const oBinding = this.byId("markingTable").getBinding("items");
			if (oBinding) {
				oBinding.refresh();
			}
		},

		onFilterChange: function () {
			const sStatus = this.byId("statusFilter").getSelectedKey();
			const sLineSection = this.byId("lineSectionFilter").getSelectedKey();
			const aFilters = [];

			if (sStatus) {
				aFilters.push(new Filter("status_code", FilterOperator.EQ, sStatus));
			}
			if (sLineSection) {
				aFilters.push(new Filter("lineSection_ID", FilterOperator.EQ, sLineSection));
			}

			this.byId("markingTable").getBinding("items").filter(aFilters);
		},

		onClearFilters: function () {
			this.byId("statusFilter").setSelectedKey("");
			this.byId("lineSectionFilter").setSelectedKey("");
			this.byId("markingTable").getBinding("items").filter([]);
		},

		onNewMarking: function () {
			this.getRouter().navTo("create");
		},

		onMarkingPress: function (oEvent) {
			const oContext = oEvent.getParameter("listItem").getBindingContext();
			this.getRouter().navTo("detail", { objectId: oContext.getProperty("ID") });
		}
	});
});
