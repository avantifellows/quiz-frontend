module.exports = {
  publicPath: "/",
  transpileDependencies: [/@vue\/*/, "vue-router", "vuex"],
  chainWebpack(config) {
    // reference: https://github.com/vuejs/vue-cli/issues/979#issuecomment-372990631
    config.plugins.delete("prefetch");
  },
  parallel: false,
  // https://www.npmjs.com/package/@vue/cli-plugin-babel
  // `thread-loader` is enabled by default when the machine has more than 1 CPU cores.
  // This can be turned off by setting parallel: false in vue.config.js
};
