/**
 * Store and retrieve local multiplayer game templates.
 */
class GameTemplateStore
{
	constructor()
	{
		this.engineInfo = Engine.GetEngineInfo();
	}

	loadFile()
	{
		const data =
			Engine.FileExists(this.Filename) &&
			Engine.ReadJSONFile(this.Filename);

		if (!data)
			return this.emptyData();

		if (data?.engine_info?.engine_serialization_version != this.engineInfo.engine_serialization_version)
			return this.emptyData();

		const templates = Array.isArray(data.templates) ? data.templates : [];
		return {
			"engine_info": this.engineInfo,
			"schema_version": this.SchemaVersion,
			"templates": templates
		};
	}

	saveFile(data)
	{
		Engine.WriteJSONFile(this.Filename, {
			"engine_info": this.engineInfo,
			"schema_version": this.SchemaVersion,
			"templates": data.templates || []
		});
	}

	saveTemplate(name, attributes)
	{
		const data = this.loadFile();
		const savedAt = new Date().toISOString();
		const existingIndex = data.templates.findIndex(template => template.name == name);

		if (existingIndex != -1)
			data.templates.splice(existingIndex, 1);

		data.templates.unshift({
			"name": name,
			"savedAt": savedAt,
			"attributes": attributes
		});

		if (data.templates.length > this.MaxTemplates)
			data.templates.length = this.MaxTemplates;

		this.saveFile(data);
		return data.templates[0];
	}

	hasTemplate(name)
	{
		return this.loadFile().templates.some(template => template.name == name);
	}

	deleteTemplate(index)
	{
		const data = this.loadFile();
		if (index < 0 || index >= data.templates.length)
			return false;

		data.templates.splice(index, 1);
		this.saveFile(data);
		return true;
	}

	markTemplateUsed(index)
	{
		const data = this.loadFile();
		if (index < 0 || index >= data.templates.length)
			return false;

		if (index === 0)
			return true;

		const [template] = data.templates.splice(index, 1);
		data.templates.unshift(template);
		this.saveFile(data);
		return true;
	}

	loadMostRecentTemplate()
	{
		return this.loadFile().templates[0];
	}

	listTemplates()
	{
		return this.loadFile().templates;
	}

	emptyData()
	{
		return {
			"engine_info": this.engineInfo,
			"schema_version": this.SchemaVersion,
			"templates": []
		};
	}
}

GameTemplateStore.prototype.Filename =
	"moddata/game_templates/game_templates.mp.json";

GameTemplateStore.prototype.SchemaVersion = 1;

GameTemplateStore.prototype.MaxTemplates = 20;
