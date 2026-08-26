sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/ui/core/HTML",
	"sap/ui/core/Fragment"
], function (BaseController, JSONModel, MessageToast, MessageBox, Dialog, Button, HTML, Fragment) {
	"use strict";

	const ENTITY_PATH = "/ServiceMarking";
	const EXPAND = "lineSection,serviceType,condition,status,photos";
	const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

	return BaseController.extend("markingservice.controller.Detail", {

		onInit: function () {
			this.setModel(new JSONModel({ creating: false }), "vm");
			// getResourceBundle() may return a Promise while the i18n model is still loading
			// asynchronously; resolve it once and cache it so message handlers never depend on timing.
			Promise.resolve(this.getResourceBundle()).then((oBundle) => {
				this._oBundle = oBundle;
			});
			this.getRouter().getRoute("detail").attachPatternMatched(this._onDetailMatched, this);
			this.getRouter().getRoute("create").attachPatternMatched(this._onCreateMatched, this);
		},

		_text: function (sKey, aArgs) {
			return this._oBundle ? this._oBundle.getText(sKey, aArgs) : sKey;
		},

		_onDetailMatched: function (oEvent) {
			const sObjectId = oEvent.getParameter("arguments").objectId;
			this.getModel("vm").setProperty("/creating", false);
			this.getView().bindElement({
				path: ENTITY_PATH + "('" + sObjectId + "')",
				parameters: {
					$expand: EXPAND,
					// status_code/condition_code are only read inside binding expressions (visible/state),
					// never a plain control property, so autoExpandSelect can miss them without this.
					$select: "status_code,condition_code"
				}
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
				notes: "",
				photos: []
			}), "new");
		},

		// ponytail: JSONModel list bindings only refresh when the array reference changes,
		// so photo add/remove must replace the array instead of mutating it in place.
		_setPhotos: function (aPhotos) {
			this.getModel("new").setProperty("/photos", aPhotos);
		},

		onUseGps: function () {
			if (!navigator.geolocation) {
				MessageBox.error(this._text("msgGpsUnsupported"));
				return;
			}
			navigator.geolocation.getCurrentPosition(
				(oPosition) => {
					this.getModel("new").setProperty("/latitude", oPosition.coords.latitude);
					this.getModel("new").setProperty("/longitude", oPosition.coords.longitude);
				},
				(oError) => MessageBox.error(this._text("msgGpsError", [oError.message])),
				// timeout needed: without it a stalled location fix hangs forever with no
				// success/error callback, silently leaving the fields empty.
				{ timeout: 10000, maximumAge: 60000 }
			);
		},

		onCapturePhoto: function () {
			if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
				this._openCameraDialog();
			} else {
				this._openFilePicker();
			}
		},

		// ponytail: live getUserMedia preview so the button actually opens the camera instead of
		// a generic file picker; photos are kept as data URLs for preview only, nothing is saved yet.
		_openCameraDialog: function () {
			navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false })
				.then((oStream) => {
					this._oCameraStream = oStream;

					const oVideoHtml = new HTML({
						content: '<video autoplay playsinline muted style="width:100%;max-height:60vh;background:#000;display:block"></video>'
					});
					oVideoHtml.attachEventOnce("afterRendering", () => {
						const oVideoEl = oVideoHtml.getDomRef();
						if (oVideoEl) {
							oVideoEl.srcObject = oStream;
						}
					});

					const oDialog = new Dialog({
						title: this._text("btnTakePhoto"),
						contentWidth: "420px",
						content: [oVideoHtml],
						beginButton: new Button({
							text: this._text("btnCapturePhoto"),
							type: "Emphasized",
							press: () => this._captureFrame(oVideoHtml.getDomRef())
						}),
						endButton: new Button({
							text: this._text("btnCloseCamera"),
							press: () => oDialog.close()
						}),
						afterClose: () => {
							this._stopCameraStream();
							oDialog.destroy();
						}
					});
					this.getView().addDependent(oDialog);
					oDialog.open();
				})
				.catch((oError) => MessageBox.error(this._text("msgCameraError", [oError.message])));
		},

		_captureFrame: function (oVideoEl) {
			if (!oVideoEl || !oVideoEl.videoWidth) {
				return;
			}
			const oCanvas = document.createElement("canvas");
			oCanvas.width = oVideoEl.videoWidth;
			oCanvas.height = oVideoEl.videoHeight;
			oCanvas.getContext("2d").drawImage(oVideoEl, 0, 0);

			const aPhotos = this.getModel("new").getProperty("/photos").concat([{
				fileName: "foto-" + Date.now() + ".jpg",
				mediaType: "image/jpeg",
				url: oCanvas.toDataURL("image/jpeg", 0.85)
			}]);
			this._setPhotos(aPhotos);
			MessageToast.show(this._text("msgPhotoCaptured"));
		},

		_stopCameraStream: function () {
			if (this._oCameraStream) {
				this._oCameraStream.getTracks().forEach((oTrack) => oTrack.stop());
				this._oCameraStream = null;
			}
		},

		// ponytail: fallback for browsers without getUserMedia (e.g. old Safari); still opens the
		// device camera via the capture hint where supported, otherwise a plain file picker.
		_openFilePicker: function () {
			const oInput = document.createElement("input");
			oInput.type = "file";
			oInput.accept = "image/*";
			oInput.capture = "environment";
			oInput.multiple = true;
			oInput.style.display = "none";
			oInput.addEventListener("change", () => {
				this._addPhotos(oInput.files);
				document.body.removeChild(oInput);
			});
			document.body.appendChild(oInput);
			oInput.click();
		},

		_addPhotos: function (oFileList) {
			Array.from(oFileList).forEach((oFile) => {
				if (!oFile.type.startsWith("image/")) {
					MessageBox.error(this._text("msgPhotoInvalidType"));
					return;
				}
				if (oFile.size > MAX_PHOTO_SIZE) {
					MessageBox.error(this._text("msgPhotoTooLarge"));
					return;
				}
				const oReader = new FileReader();
				oReader.onload = () => {
					const aPhotos = this.getModel("new").getProperty("/photos")
						.concat([{ fileName: oFile.name, mediaType: oFile.type, url: oReader.result }]);
					this._setPhotos(aPhotos);
				};
				oReader.readAsDataURL(oFile);
			});
		},

		onRemovePhoto: function (oEvent) {
			const sPath = oEvent.getParameter("listItem").getBindingContext("new").getPath();
			const iIndex = Number(sPath.split("/").pop());
			const aPhotos = this.getModel("new").getProperty("/photos").filter((oPhoto, i) => i !== iIndex);
			this._setPhotos(aPhotos);
		},

		onSave: function () {
			const oDraft = this.getModel("new").getData();
			const aRequired = [
				["lineSection_ID", "fieldLineSection"],
				["kmFrom", "fieldKmFrom"],
				["kmTo", "fieldKmTo"],
				["latitude", "fieldLatitude"],
				["longitude", "fieldLongitude"],
				["inspector", "fieldInspector"],
				["serviceType_code", "fieldServiceType"],
				["condition_code", "fieldCondition"]
			];
			const aMissing = aRequired
				.filter(([sProp]) => oDraft[sProp] === "" || oDraft[sProp] == null)
				.map(([, sLabelKey]) => this._text(sLabelKey));

			if (aMissing.length > 0) {
				MessageBox.error(this._text("msgValidationRequired") + " (" + aMissing.join(", ") + ")");
				return;
			}
			if (Number(oDraft.kmFrom) > Number(oDraft.kmTo)) {
				MessageBox.error(this._text("msgValidationKmOrder"));
				return;
			}

			const oPayload = {
				lineSection_ID: oDraft.lineSection_ID,
				kmFrom: Number(oDraft.kmFrom),
				kmTo: Number(oDraft.kmTo),
				// field is Decimal(9,6); GPS/manual input can carry more decimal digits than that
				latitude: Number(Number(oDraft.latitude).toFixed(6)),
				longitude: Number(Number(oDraft.longitude).toFixed(6)),
				markingDate: new Date(oDraft.markingDate).toISOString(),
				inspector: oDraft.inspector,
				serviceType_code: oDraft.serviceType_code,
				condition_code: oDraft.condition_code,
				notes: oDraft.notes || undefined
			};

			const oListBinding = this.getModel().bindList(ENTITY_PATH);
			const oNewContext = oListBinding.create(oPayload);

			oNewContext.created()
				.then(() => {
					MessageToast.show(this._text("msgCreateSuccess"));
					this.getRouter().navTo("detail", { objectId: oNewContext.getProperty("ID") }, true);
				})
				.catch((oError) => {
					MessageBox.error(this._text("msgCreateError", [oError.message]));
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
					MessageToast.show(this._text("msgSendToPlanningSuccess"));
				})
				.catch((oError) => {
					MessageBox.error(this._text("msgActionError", [oError.message]));
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
				MessageBox.error(this._text("msgReasonRequired"));
				return;
			}

			const oContext = this.getView().getBindingContext();
			const oActionBinding = oContext.getModel().bindContext("MarkingService.reject(...)", oContext);
			oActionBinding.setParameter("reason", sReason);

			oActionBinding.invoke()
				.then(() => {
					oContext.refresh();
					MessageToast.show(this._text("msgRejectSuccess"));
					this._closeRejectDialog();
				})
				.catch((oError) => {
					MessageBox.error(this._text("msgActionError", [oError.message]));
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
