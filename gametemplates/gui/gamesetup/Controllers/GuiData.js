/**
 * Extend game setup GUI data so the mod can persist template rules text.
 */
class GameSettingsGuiData
{
	constructor()
	{
		this.mapFilter = new Observable();
		this.mapFilter.filter = "default";

		// Mark some settings as unmodifiable even if they normally would be.
		// TODO: increase support for this feature.
		this.lockSettings = {};
	}

	/**
	 * Serialize for network transmission & settings persistence.
	 */
	Serialize()
	{
		const ret = {
			"linearPopulationCapacity": this.linearPopulationCapacity,
			"mapFilter": this.mapFilter.filter,
			"rules": this.rules || ""
		};
		if (Object.keys(this.lockSettings).length)
			ret.lockSettings = this.lockSettings;
		return ret;
	}

	Deserialize(data)
	{
		this.mapFilter.filter = data.mapFilter;
		this.linearPopulationCapacity = data.linearPopulationCapacity;
		this.rules = data?.rules || "";
		this.lockSettings = data?.lockSettings || {};
	}
}
