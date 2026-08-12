sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/core/Fragment"
], function (BaseController, JSONModel, MessageToast, MessageBox, Fragment) {
	"use strict";

	const ENTITY_PATH = "/ServiceMarking";
	const EXPAND = "lineSection,serviceType,condition,status,photos";

	return BaseController.extend("markingservice.controller.Detail", {

		onInit: function () {
			this.setModel(new JSONModel({ creating: false }), "vm");
			this.getRouter().getRoute("detail").attachPatternMatched(this._onDetailMatched, this);
			this.getRouter().getRoute("create").attachPatternMatched(this._onCreateMatched, this);
		},

		_onDetailMatched: function (oEvent) {
			const sObjectId = oEvent.getParameter("arguments").objectId;
			this.getModel("vm").setProperty("/creating", false);
			this.getView().bindElement({
				path: ENTITY_PATH + "('" + sObjectId + "')",
				parameters: { $expand: EXPAND }
			});
		},

		_onCreateMatched: function () {
			this.getModel("vm").setProperty("/creating", true);
			this.getView().unbindElement();
			this.setModel(new JSONModel({
				lineSection_ID: "",
				kmFrom: "",
				kmTo: "",
				latitude: "",
				longitude: "",
				markingDate: new Date(),
				inspector: "",
				serviceType_code: "",
				condition_code: "",
				notes: ""
			}), "new");
		},

		onSave: function () {
			const oDraft = this.getModel("new").getData();
			const bValid = oDraft.lineSection_ID && oDraft.serviceType_code && oDraft.condition_code &&
				oDraft.inspector && oDraft.kmFrom !== "" && oDraft.kmTo !== "" &&
				oDraft.latitude !== "" && oDraft.longitude !== "";

			if (!bValid) {
				MessageBox.error(this.getResourceBundle().getText("msgValidationRequired"));
				return;
			}
			if (Number(oDraft.kmFrom) > Number(oDraft.kmTo)) {
				MessageBox.error(this.getResourceBundle().getText("msgValidationKmOrder"));
				return;
			}

			const oPayload = {
				lineSection_ID: oDraft.lineSection_ID,
				kmFrom: Number(oDraft.kmFrom),
				kmTo: Number(oDraft.kmTo),
				latitude: Number(oDraft.latitude),
				longitude: Number(oDraft.longitude),
				markingDate: oDraft.markingDate.toISOString(),
				inspector: oDraft.inspector,
				serviceType_code: oDraft.serviceType_code,
				condition_code: oDraft.condition_code,
				notes: oDraft.notes || undefined
			};

			const oListBinding = this.getModel().bindList(ENTITY_PATH);
			const oNewContext = oListBinding.create(oPayload);

			oNewContext.created()
				.then(() => {
					MessageToast.show(this.getResourceBundle().getText("msgCreateSuccess"));
					this.getRouter().navTo("detail", { objectId: oNewContext.getProperty("ID") }, true);
				})
				.catch((oError) => {
					MessageBox.error(this.getResourceBundle().getText("msgCreateError", [oError.message]));
				});
		},

		onCancelCreate: function () {
			this.getRouter().navTo("main");
		},

		onSendToPlanning: function () {
			const oContext = this.getView().getBindingContext();
			const oActionBinding = oContext.getModel().bindContext("MarkingService.sendToPlanning(...)", oContext);

			oActionBinding.invoke()
				.then(() => {
					oContext.refresh();
					MessageToast.show(this.getResourceBundle().getText("msgSendToPlanningSuccess"));
				})
				.catch((oError) => {
					MessageBox.error(this.getResourceBundle().getText("msgActionError", [oError.message]));
				});
		},

		onReject: function () {
			this._getRejectDialog().then((oDialog) => {
				this.byId("rejectReasonInput").setValue("");
				oDialog.open();
			});
		},

		onConfirmReject: function () {
			const oTextArea = this.byId("rejectReasonInput");
			const sReason = oTextArea.getValue().trim();

			if (!sReason) {
				MessageBox.error(this.getResourceBundle().getText("msgReasonRequired"));
				return;
			}

			const oContext = this.getView().getBindingContext();
			const oActionBinding = oContext.getModel().bindContext("MarkingService.reject(...)", oContext);
			oActionBinding.setParameter("reason", sReason);

			oActionBinding.invoke()
				.then(() => {
					oContext.refresh();
					MessageToast.show(this.getResourceBundle().getText("msgRejectSuccess"));
					this._closeRejectDialog();
				})
				.catch((oError) => {
					MessageBox.error(this.getResourceBundle().getText("msgActionError", [oError.message]));
				});
		},

		onCancelReject: function () {
			this._closeRejectDialog();
		},

		_getRejectDialog: function () {
			if (!this._pRejectDialog) {
				this._pRejectDialog = Fragment.load({
					id: this.getView().getId(),
					name: "markingservice.view.fragment.RejectDialog",
					controller: this
				}).then((oDialog) => {
					this.getView().addDependent(oDialog);
					return oDialog;
				});
			}
			return this._pRejectDialog;
		},

		_closeRejectDialog: function () {
			this._getRejectDialog().then((oDialog) => oDialog.close());
		}
	});
});
