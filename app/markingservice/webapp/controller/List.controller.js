sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageToast"
], function (BaseController, JSONModel, Filter, FilterOperator, MessageToast) {
	"use strict";

	const CONDITION_KPIS = [
		{ key: "critical", code: "CRITICO" },
		{ key: "attention", code: "ATENCAO" },
		{ key: "ok", code: "OK" }
	];

	return BaseController.extend("markingservice.controller.List", {

		onInit: function () {
			this.setModel(new JSONModel({ total: 0, critical: 0, attention: 0, ok: 0 }), "kpi");
			this.getRouter().getRoute("main").attachPatternMatched(this._onMainMatched, this);
		},

		_onMainMatched: function () {
			const oBinding = this.byId("markingTable").getBinding("items");
			if (oBinding) {
				oBinding.refresh();
			}
			this._loadKpis();
		},

		// ponytail: KPI counts fetched as separate $count-only requests (small dataset in dev/mock);
		// switch to a single $apply groupby aggregation if the volume of markings grows.
		_loadKpis: function () {
			const oModel = this.getView().getModel();
			const oKpiModel = this.getModel("kpi");

			const requestCount = (aFilters) => {
				const oBinding = oModel.bindList("/ServiceMarking", null, [], aFilters, { $count: true });
				return oBinding.requestContexts(0, 1).then(() => oBinding.getCount());
			};

			requestCount([]).then((iTotal) => oKpiModel.setProperty("/total", Number(iTotal)));
			CONDITION_KPIS.forEach((oKpi) => {
				requestCount([new Filter("condition_code", FilterOperator.EQ, oKpi.code)])
					.then((iCount) => oKpiModel.setProperty("/" + oKpi.key, Number(iCount)));
			});
		},

		onSync: function () {
			this._onMainMatched();
			Promise.resolve(this.getResourceBundle()).then((oBundle) => {
				MessageToast.show(oBundle.getText("msgSyncDone"));
			});
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
