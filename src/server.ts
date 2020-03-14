import { ArgumentParser } from "argparse";
import { AppServer } from "./api/server/server";
import { RandomOrg } from "./external/random-org/random-org";

enum ServiceArgs {
    ADDRESS = "address",
    PORT = "port",
    MAX_FORMS = "max_forms",
}

const parser = new ArgumentParser({
    version: "0.0.1",
    addHelp: true,
    description: "Microservice example",
});
parser.addArgument(
    ["-a", "--address"],
    {
        help: "Listening address default=0.0.0.0" ,
        defaultValue: "0.0.0.0",
        
    },
);
parser.addArgument(
    ["-p", "--port"],
    {
        help: "Listening port default=3001",
        defaultValue: 3001,
    },
);
parser.addArgument(
    ["-m", "--max-forms"],
    {
        help: "Maximum forms per POST default=10",
        defaultValue: 10,
    },
);

const args = parser.parseArgs();

const address = args[ServiceArgs.ADDRESS];
const port = args[ServiceArgs.PORT];
const maxForms = args[ServiceArgs.MAX_FORMS];

// API key from ENV variable
const randomOrgApiKey = process.env["RANDOM_ORG"];

// check API key - apperently it is UUID  8-4-4-4-12 of hex values
if (RandomOrg.checkApiKey(randomOrgApiKey) === false) {
    console.error("Invalid Random.org API key");
    // exit with error
    process.exit(1);
}

const server = new AppServer(randomOrgApiKey, address, port, maxForms);
server.start();
