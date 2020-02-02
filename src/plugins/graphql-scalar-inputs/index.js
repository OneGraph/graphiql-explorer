import DatePlugin from './bundled/DateInput'

const bundledPlugins = [DatePlugin];

class ScalarInputPluginManager {
  constructor(plugins = [], enableBundledPlugins = false) {
    let enabledPlugins = plugins;
    if (enableBundledPlugins) {
      // ensure bundled plugins are the last plugins checked.
      enabledPlugins.push(...bundledPlugins);
    }
    this.plugins = enabledPlugins;
  }

  process(props) {
    // plugins are provided in order, the first matching plugin will be used.
    const handler = this.plugins.find(plugin => plugin.canProcess(props.arg));
    if (handler) {
      return handler.render(props);
    }
    return null;
  }
}

export default ScalarInputPluginManager;