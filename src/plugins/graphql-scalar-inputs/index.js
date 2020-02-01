class ScalarInputPluginManager {
  constructor(plugins = []) {
    this.plugins = plugins;
  }

  process(arg, styleConfig, onChangeHandler) {
    const handler = this.plugins.find(plugin => plugin.canProcess(arg));
    if (handler) {
      return handler.render(arg, styleConfig, onChangeHandler);
    }
    return null;
  }
}

export default ScalarInputPluginManager;