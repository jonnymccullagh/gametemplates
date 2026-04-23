class SaveTemplateButton
{
	constructor(setupWindow, isSavedGame)
	{
		this.setupWindow = setupWindow;

		this.button = Engine.GetGUIObjectByName("saveTemplateButton");
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
			this.setupWindow.pages.SaveTemplatePage.openPage();
		}
		catch (err)
		{
			error("Failed to open template save dialog.");
			warn(err?.toString?.() ?? uneval(err));
			if (err?.stack)
				warn(err.stack);

			messageBox(
				520, 240,
				sprintf(translate("Opening the save dialog failed.\n\n%(error)s"), {
					"error": err?.message || err?.toString?.() || translate("Unknown error")
				}),
				translate("Template Error"));
		}
	}
}

SaveTemplateButton.prototype.Caption =
	translate("Save Template");

SaveTemplateButton.prototype.Tooltip =
	translate("Save the current multiplayer match settings as a local template.");
