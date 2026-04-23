SetupWindowPages.SaveTemplatePage = class
{
	constructor(setupWindow, isSavedGame)
	{
		this.gameSettingsController = setupWindow.controls.gameSettingsController;
		this.templateStore = new GameTemplateStore();
		this.isSavedGame = isSavedGame;
		this.templates = [];

		this.saveTemplatePage = Engine.GetGUIObjectByName("saveTemplatePage");
		this.templateNameDropdown = Engine.GetGUIObjectByName("templateNameDropdown");
		this.templateNameInput = Engine.GetGUIObjectByName("templateNameInput");
		this.templateNameFeedback = Engine.GetGUIObjectByName("templateNameFeedback");
		this.templateSaveButton = Engine.GetGUIObjectByName("templateSaveButton");
		this.templateSaveCancelButton = Engine.GetGUIObjectByName("templateSaveCancelButton");

		this.templateNameDropdown.onSelectionChange = this.onTemplateSelectionChange.bind(this);
		this.templateNameInput.onTextEdit = this.onTextEdit.bind(this);
		this.templateNameInput.onPress = this.saveTemplate.bind(this);
		this.templateSaveButton.onPress = this.saveTemplate.bind(this);
		this.templateSaveCancelButton.onPress = this.closePage.bind(this);
	}

	openPage()
	{
		if (this.isSavedGame)
			return;

		this.templates = this.templateStore.listTemplates();
		this.renderTemplateNameDropdown();
		this.templateNameInput.caption = this.buildDefaultName();
		this.templateNameDropdown.selected = 0;
		this.templateNameFeedback.caption = "";
		this.render();
		this.saveTemplatePage.hidden = false;
		this.templateNameInput.focus();
	}

	closePage()
	{
		this.saveTemplatePage.hidden = true;
	}

	onTextEdit()
	{
		this.templateNameFeedback.caption = "";
		this.syncDropdownSelection();
		this.render();
	}

	onTemplateSelectionChange()
	{
		const selectedName = this.templateNameDropdown.list_data?.[this.templateNameDropdown.selected];
		if (!selectedName)
			return;

		this.templateNameInput.caption = selectedName;
		this.templateNameFeedback.caption = "";
		this.render();
	}

	render()
	{
		this.templateSaveButton.enabled = !!this.getTemplateName();
	}

	getTemplateName()
	{
		return this.templateNameInput.caption.trim();
	}

	async saveTemplate()
	{
		const name = this.getTemplateName();
		if (!name)
		{
			this.templateNameFeedback.caption = translate("Please enter a template name.");
			this.render();
			return;
		}

		if (this.templateStore.hasTemplate(name))
		{
			const buttonIndex = await messageBox(
				500, 220,
				sprintf(translate("Overwrite template \"%(templateName)s\"?\n\nThe previous template with this name will be replaced."), {
					"templateName": name
				}),
				translate("Overwrite Template"),
				[translate("Cancel"), translate("Overwrite")]);
			if (buttonIndex !== 1)
				return;
		}

		try
		{
			const template = this.templateStore.saveTemplate(
				name,
				this.gameSettingsController.getSettings());

			this.closePage();

			messageBox(
				480, 220,
				sprintf(
					translate("Saved template \"%(templateName)s\"."),
					{ "templateName": template.name }),
				translate("Template Saved"));
		}
		catch (err)
		{
			error("Failed to save game template.");
			warn(err?.toString?.() ?? uneval(err));
			if (err?.stack)
				warn(err.stack);

			messageBox(
				520, 240,
				sprintf(translate("Saving the template failed.\n\n%(error)s"), {
					"error": err?.message || err?.toString?.() || translate("Unknown error")
				}),
				translate("Template Error"));
		}
	}

	buildDefaultName()
	{
		return sprintf(
			translate("Template %(date)s"),
			{ "date": new Date().toLocaleString() });
	}

	renderTemplateNameDropdown()
	{
		this.templateNameDropdown.list = [
			translate("Choose..."),
			...this.templates.map(template => template.name)
		];
		this.templateNameDropdown.list_data = [
			"",
			...this.templates.map(template => template.name)
		];
	}

	syncDropdownSelection()
	{
		const index = this.templateNameDropdown.list_data.indexOf(this.getTemplateName());
		this.templateNameDropdown.selected = index == -1 ? 0 : index;
	}
};
