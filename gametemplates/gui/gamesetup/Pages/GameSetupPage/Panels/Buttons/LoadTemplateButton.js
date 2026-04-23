class LoadTemplateButton
{
	constructor(setupWindow, isSavedGame)
	{
		this.setupWindow = setupWindow;
		this.gameSettingsController = setupWindow.controls.gameSettingsController;
		this.templateStore = new GameTemplateStore();

		this.button = Engine.GetGUIObjectByName("loadTemplateButton");
		this.button.caption = this.Caption;
		this.button.tooltip = this.Tooltip;
		this.button.onPress = this.onPress.bind(this);
		this.button.hidden = isSavedGame;

		if (!isSavedGame)
			this.render();
	}

	render()
	{
		this.button.hidden = !g_IsController;
	}

	onPress()
	{
		try
		{
			if (!this.templateStore.listTemplates().length)
			{
				messageBox(
					420, 180,
					translate("No saved templates were found yet."),
					translate("No Templates"));
				return;
			}

			this.setupWindow.pages.TemplatePickerPage.openPage();
		}
		catch (err)
		{
			error("Failed to open template picker.");
			warn(err?.toString?.() ?? uneval(err));
			if (err?.stack)
				warn(err.stack);

			messageBox(
				520, 240,
				sprintf(translate("Opening the template picker failed.\n\n%(error)s"), {
					"error": err?.message || err?.toString?.() || translate("Unknown error")
				}),
				translate("Template Error"));
		}
	}
}

LoadTemplateButton.prototype.Caption =
	translate("Load Template");

LoadTemplateButton.prototype.Tooltip =
	translate("Choose and load a saved local multiplayer template.");
