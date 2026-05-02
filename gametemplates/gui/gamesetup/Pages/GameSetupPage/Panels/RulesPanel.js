class RulesPanel
{
	constructor(setupWindow, gameSettingsPanel)
	{
		this.gameSettingsController = setupWindow.controls.gameSettingsController;
		this.gameSettingsPanel = gameSettingsPanel;

		this.chatPanelWrapper = Engine.GetGUIObjectByName("chatPanelWrapper");
		this.rulesPanelWrapper = Engine.GetGUIObjectByName("rulesPanelWrapper");
		this.rulesPanel = Engine.GetGUIObjectByName("rulesPanel");
		this.rulesLabel = Engine.GetGUIObjectByName("rulesLabel");
		this.rulesInput = Engine.GetGUIObjectByName("rulesInput");
		this.rulesSendButton = Engine.GetGUIObjectByName("rulesSendButton");

		this.updateLayout();

		const available = g_IsNetworked && g_IsController;
		this.rulesPanel.hidden = !available;
		if (!available)
			return;

		this.rulesLabel.caption = this.Label;
		this.rulesLabel.tooltip = this.Tooltip;
		this.rulesInput.tooltip = this.Tooltip;
		this.rulesInput.onTextEdit = this.onTextEdit.bind(this);
		this.rulesInput.onPress = this.sendRules.bind(this);
		this.rulesSendButton.tooltip = this.SendTooltip;
		resizeGUIObjectToCaption(this.rulesSendButton, { "horizontal": "left" }, { "horizontal": 8 });
		this.rulesInput.size.right = this.rulesSendButton.size.left;
		this.rulesSendButton.onPress = this.sendRules.bind(this);
		this.gameSettingsPanel.registerGameSettingsPanelResizeHandler(this.onGameSettingsPanelResize.bind(this));

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

	sendRules()
	{
		executeNetworkCommand("/rules");
		this.rulesInput.focus();
	}

	onGameSettingsPanelResize(settingsPanel)
	{
		this.rulesPanel.size.right = settingsPanel.size.left + this.gameSettingsPanel.MaxColumnWidth + this.Margin;
	}

	updateLayout()
	{
		if (!g_IsNetworked || !g_IsController)
		{
			this.rulesPanelWrapper.hidden = true;
			this.chatPanelWrapper.size = "0 346 100%-795-24 100%";
			return;
		}

		this.rulesPanelWrapper.hidden = false;
		this.rulesPanelWrapper.size = "0 346 100%-795-24 428";
		this.chatPanelWrapper.size = "0 434 100%-795-24 100%";
	}
}

RulesPanel.prototype.Label =
	translate("Game rules");

RulesPanel.prototype.Tooltip =
	translate("Add a short rules summary to save with the current template.");

RulesPanel.prototype.SendTooltip =
	translate("Send the saved rules text to the game chat.");

RulesPanel.prototype.Margin = 10;
