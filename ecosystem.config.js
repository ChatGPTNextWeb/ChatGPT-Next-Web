module.exports = {
    apps: [
        {
            name: "gpt",
            script: "yarn",
            args: "start",
            watch: true,
            env: {
                "PORT": "9999",
                "PRODUCTION_TYPE": "production",
                "NODE_ENV": "production",
                "CODE": "950921",
            }
        },
    ]
}
