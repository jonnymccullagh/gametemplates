SetupWindowPages.TemplatePickerPage = class
{
	constructor(setupWindow, isSavedGame)
	{
		this.gameSettingsController = setupWindow.controls.gameSettingsController;
		this.templateStore = new GameTemplateStore();
		this.isSavedGame = isSavedGame;

		this.templates = [];
		this.selectedIndex = -1;

		this.templatePickerPage = Engine.GetGUIObjectByName("templatePickerPage");
		this.templateSelection = Engine.GetGUIObjectByName("templateSelection");
		this.templateSelectionFeedback = Engine.GetGUIObjectByName("templateSelectionFeedback");
		this.templateDetails = Engine.GetGUIObjectByName("templateDetails");
		this.templateDeleteButton = Engine.GetGUIObjectByName("templateDeleteButton");
		this.templateLoadButton = Engine.GetGUIObjectByName("templateLoadButton");
		this.templateCancelButton = Engine.GetGUIObjectByName("templateCancelButton");

		this.templateSelection.onSelectionChange = this.onSelectionChange.bind(this);
		this.templateSelection.onMouseLeftDoubleClickItem = this.loadSelectedTemplate.bind(this);
		this.templateDeleteButton.onPress = this.deleteSelectedTemplate.bind(this);
		this.templateLoadButton.onPress = this.loadSelectedTemplate.bind(this);
		this.templateCancelButton.onPress = this.closePage.bind(this);
	}

	openPage()
	{
		if (this.isSavedGame)
			return;

		this.templates = this.templateStore.listTemplates();
		this.selectedIndex = this.templates.length ? 0 : -1;
		this.render();
		this.templatePickerPage.hidden = false;
	}

	closePage()
	{
		this.templatePickerPage.hidden = true;
	}

	onSelectionChange()
	{
		this.selectedIndex = this.templateSelection.selected;
		this.renderDetails();
	}

	loadSelectedTemplate()
	{
		const template = this.templates[this.selectedIndex];
		if (!template)
			return;

		try
		{
			this.applyTemplate(template);
			this.templateStore.markTemplateUsed(this.selectedIndex);

			this.closePage();
		}
		catch (err)
		{
			error("Failed to load game template.");
			warn(err?.toString?.() ?? uneval(err));
			if (err?.stack)
				warn(err.stack);

			messageBox(
				520, 240,
				sprintf(translate("Loading the template failed.\n\n%(error)s"), {
					"error": err?.message || err?.toString?.() || translate("Unknown error")
				}),
				translate("Template Error"));
		}
	}

	applyTemplate(template)
	{
		this.gameSettingsController.parseSettings(template.attributes, false);

		if (typeof this.gameSettingsController.updateLayout == "function")
			this.gameSettingsController.updateLayout();

		if (typeof this.gameSettingsController.setNetworkInitAttributes == "function")
			this.gameSettingsController.setNetworkInitAttributes();
	}

	async deleteSelectedTemplate()
	{
		const template = this.templates[this.selectedIndex];
		if (!template)
			return;

		const buttonIndex = await messageBox(
			500, 220,
			sprintf(translate("Delete template \"%(templateName)s\"?\n\nThis cannot be undone."), {
				"templateName": template.name
			}),
			translate("Delete Template"),
			[translate("Cancel"), translate("Delete")]);
		if (buttonIndex !== 1)
			return;

		try
		{
			if (!this.templateStore.deleteTemplate(this.selectedIndex))
				throw new Error(sprintf(translate("Template \"%(templateName)s\" was not found."), {
					"templateName": template.name
				}));

			this.templates = this.templateStore.listTemplates();
			if (!this.templates.length)
				this.selectedIndex = -1;
			else if (this.selectedIndex >= this.templates.length)
				this.selectedIndex = this.templates.length - 1;

			this.render();
		}
		catch (err)
		{
			error("Failed to delete game template.");
			warn(err?.toString?.() ?? uneval(err));
			if (err?.stack)
				warn(err.stack);

			messageBox(
				520, 240,
				sprintf(translate("Deleting the template failed.\n\n%(error)s"), {
					"error": err?.message || err?.toString?.() || translate("Unknown error")
				}),
				translate("Template Error"));
		}
	}

	render()
	{
		this.templateSelection.hidden = !this.templates.length;
		this.templateSelectionFeedback.hidden = !!this.templates.length;

		this.templateSelection.list_name = this.templates.map(template => template.name);
		// COList expects these assignments last.
		this.templateSelection.list = this.templates.map((template, index) => String(index));
		this.templateSelection.list_data = this.templates.map((template, index) => String(index));

		this.templateSelection.selected = this.selectedIndex;
		this.renderDetails();
	}

	renderDetails()
	{
		const template = this.templates[this.selectedIndex];
		this.templateDeleteButton.enabled = !!template;
		this.templateLoadButton.enabled = !!template;

		if (!template)
		{
			this.templateDetails.caption = translate("No template selected.");
			return;
		}

		const settings = template.attributes?.settings || {};
		const mapName = settings.Name || settings.Script || settings.mapName || translate("Unknown map");
		const playerCount = settings.PlayerData?.length || settings.PlayerCount || translate("Unknown");

		this.templateDetails.caption = sprintf(
			translate("Name: %(name)s\nSaved: %(savedAt)s\nMap: %(map)s\nPlayers: %(players)s"),
			{
				"name": template.name,
				"savedAt": this.formatSavedAt(template.savedAt),
				"map": mapName,
				"players": playerCount
			});
	}

	formatSavedAt(savedAt)
	{
		return savedAt ? new Date(savedAt).toLocaleString() : translate("Unknown");
	}
};
