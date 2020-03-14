import compression from "compression";
import express from "express";
import { createServer, Server, ServerOptions } from "http";
import HttpStatus from "http-status-codes";
import { ApiAppForms } from "../modules/app-forms";

export class AppServer {

    private httpsOptions: ServerOptions = {};

    private expressApp: express.Application = express();
    private server: Server;

    constructor(private randomOrgApiKey: string,
                public address: string = "0.0.0.0",
                public port: number = 3001,
                private maxFormsPerPost: number) {

        this.expressApp.use(compression());
        this.server = createServer(this.httpsOptions, this.expressApp);
        this.initModules();
        this.setupDefault();

    }
    /** Start server @ config.api_port */
    public start(): Promise<void> {
        return new Promise((resolve, reject) => {

            // console.log(`HTTPS Server starting at ${this.address}:${this.port}`);
            this.server.listen(this.port, this.address, () => {
                resolve();
            });

        });
    }

    /** Stop app server @ config.api_port */
    public stop(): Promise<void> {
        return new Promise<any>((resolve, reject) => {
            this.server.close((e) => {
                if (e) {
                    reject(e);
                    return;
                }
                resolve();
            });
        });
    }

    private initModules() {
        const mAppForms = new ApiAppForms(this.randomOrgApiKey, this.maxFormsPerPost).attachModule(this.expressApp);
    }

    private setupDefault() {
        this.expressApp.use("*", (req, res) => {
            res.json({
                error: HttpStatus.getStatusText(404),
            });
            res.status(404);
            res.end();
        });
    }
}
