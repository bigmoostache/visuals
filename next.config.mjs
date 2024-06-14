// next.config.mjs
export default {
    webpack(config, { isServer }) {
        // Activer les source maps pour la production
        if (!isServer) {
            config.devtool = 'source-map';
        }

        return config;
    },
};
