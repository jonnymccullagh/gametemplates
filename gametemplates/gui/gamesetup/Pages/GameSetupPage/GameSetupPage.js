/**
 * This class owns all handlers of the game setup page, excluding controllers that apply to all subpages and handlers for specific subpages.
 */
SetupWindowPages.GameSetupPage = class
{
	constructor(setupWindow, isSavedGame)
	{
		Engine.ProfileStart("GameSetupPage");

		this.setupWindow = setupWindow;
		this.isSavedGame = isSavedGame;
		this.gameSettingsController = setupWindow.controls.gameSettingsController;
		this.templateStore = new GameTemplateStore();

		// This class instance owns all game setting GUI controls such as dropdowns and checkboxes visible in this page.
		this.gameSettingControlManager = new GameSettingControlManager(setupWindow, isSavedGame);

		// These classes manage GUI buttons.
		{
			const startGameButton = new StartGameButton(setupWindow);
			const readyButton = new ReadyButton(setupWindow);
			this.panelButtons = {
				"civInfoButton": new CivInfoButton(),
				"lobbyButton": new LobbyButton(),
				"savedGameLabel": new SavedGameLabel(isSavedGame),
				"saveTemplateButton": new SaveTemplateButton(setupWindow, isSavedGame),
				"loadTemplateButton": new LoadTemplateButton(setupWindow, isSavedGame),
				"cancelButton": new CancelButton(setupWindow, startGameButton, readyButton),
				"readyButton": readyButton,
				"startGameButton": startGameButton
			};
		}

		// These classes manage GUI Objects.
		{
			const gameSettingTabs = new GameSettingTabs(setupWindow, this.panelButtons.lobbyButton);
			const gameSettingsPanel = new GameSettingsPanel(
				setupWindow, gameSettingTabs, this.gameSettingControlManager);

			this.panels = {
				"chatPanel": new ChatPanel(setupWindow, this.gameSettingControlManager, gameSettingsPanel),
				"gameSettingWarning": new GameSettingWarning(setupWindow),
				"gameDescription": new GameDescription(setupWindow, gameSettingTabs),
				"gameSettingsPanel": gameSettingsPanel,
				"gameSettingsTabs": gameSettingTabs,
				"mapPreview": new MapPreview(setupWindow, isSavedGame),
				"resetCivsButton": new ResetCivsButton(setupWindow, isSavedGame),
				"resetTeamsButton": new ResetTeamsButton(setupWindow, isSavedGame),
				"rulesPanel": new RulesPanel(setupWindow, gameSettingsPanel),
				"soundNotification": new SoundNotification(setupWindow),
				"tipsPanel": new TipsPanel(gameSettingsPanel),
				"onscreenToolTip": new Tooltip()
			};
		}

		setupWindow.controls.gameSettingsController.registerLoadingChangeHandler((loading) => this.onLoadingChange(loading));
		setupWindow.registerLoadHandler(this.onSetupWindowLoad.bind(this));

		Engine.ProfileStop();
	}

	onSetupWindowLoad(initData, hotloadData)
	{
		if (this.isSavedGame || hotloadData || !g_IsNetworked || !g_IsController)
			return;

		if (initData?.gameSettings)
			return;

		const template = this.templateStore.loadMostRecentTemplate();
		if (!template)
			return;

		try
		{
			this.gameSettingsController.parseSettings(template.attributes, false);

			if (typeof this.gameSettingsController.updateLayout == "function")
				this.gameSettingsController.updateLayout();

			if (typeof this.gameSettingsController.setNetworkInitAttributes == "function")
				this.gameSettingsController.setNetworkInitAttributes();
		}
		catch (err)
		{
			error("Failed to auto-load game template.");
			warn(err?.toString?.() ?? uneval(err));
			if (err?.stack)
				warn(err.stack);

			messageBox(
				520, 240,
				sprintf(translate("Loading the most recently used template failed.\n\n%(error)s"), {
					"error": err?.message || err?.toString?.() || translate("Unknown error")
				}),
				translate("Template Error"));
		}
	}

	onLoadingChange(loading)
	{
		Engine.GetGUIObjectByName("gameSetupPage").hidden = loading;
	}
};
