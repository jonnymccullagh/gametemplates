class RulesPanel
{
	constructor(setupWindow)
	{
		this.gameSettingsController = setupWindow.controls.gameSettingsController;

		this.rulesPanel = Engine.GetGUIObjectByName("rulesPanel");
		this.rulesLabel = Engine.GetGUIObjectByName("rulesLabel");
		this.rulesInput = Engine.GetGUIObjectByName("rulesInput");

		const available = g_IsController;
		this.rulesPanel.hidden = !available;
		if (!available)
			return;

		this.rulesLabel.caption = this.Label;
		this.rulesLabel.tooltip = this.Tooltip;
		this.rulesInput.tooltip = this.Tooltip;
		this.rulesInput.onTextEdit = this.onTextEdit.bind(this);

		this.gameSettingsController.registerSettingsLoadedHandler(this.onSettingsLoaded.bind(this));
		this.gameSettingsController.registerSettingsChangeHandler(this.onSettingsChange.bind(this));
	}

	onSettingsLoaded()
	{
		this.rulesInput.caption = this.gameSettingsController.guiData.rules || "";
	}

	onSettingsChange()
	{
		if (this.rulesInput.caption == (this.gameSettingsController.guiData.rules || ""))
			return;

		this.rulesInput.caption = this.gameSettingsController.guiData.rules || "";
	}

	onTextEdit()
	{
		this.gameSettingsController.guiData.rules = this.rulesInput.caption;
		this.gameSettingsController.setNetworkInitAttributes();
	}
}

RulesPanel.prototype.Label =
	translate("Game rules");

RulesPanel.prototype.Tooltip =
	translate("Add a short rules summary to save with the current template.");
