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
