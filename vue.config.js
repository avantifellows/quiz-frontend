module.exports = {
  publicPath: "/",
  transpileDependencies: [/@vue\/*/, "vue-router", "vuex"],
  chainWebpack(config) {
    // reference: https://github.com/vuejs/vue-cli/issues/979#issuecomment-372990631
    config.plugins.delete("prefetch");
  },
  parallel: false
};
