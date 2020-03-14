import * as express from "express";
import { ApiPostRequest } from "./../../types/index";

import HttpStatus from "http-status-codes";

export abstract class ApiModuleBase {

    public abstract attachModule(app: express.Application): ApiModuleBase;

    protected respondSuccess<T>(res: express.Response, data: T) {
        res.status(200);
        res.json(data);
        res.end();
    }
    protected respondError(res: express.Response, httpCode: number) {

        res.status(httpCode);
        res.json({
            error: HttpStatus.getStatusText(httpCode),
        });
        res.end();
    }
    protected mwFloodLimitText = (maxSize: number) => {
        return (req: ApiPostRequest, res: express.Response, next: () => void) => {

            let error = false;

            if (req.readable) {

                let input = "";

                req.on("data", (data: string) => {
                    const sum = input.length + data.length;
                    if (sum > maxSize) {
                        // Flood attack or error, destroy request.
                        req.connection.destroy();
                        error = true;
                        return;
                    }
                    // Append data.
                    input += data;

                });

                req.on("end", () => {

                    if (error) {
                        res.status(413);
                        res.json({ error: HttpStatus.getStatusText(413) });
                        res.end();
                        return;

                    } else {
                        try {
                            req.postData = JSON.parse(input.toString());
                            next();
                        } catch (ex) {
                            res.status(400);
                            res.json({ error: HttpStatus.getStatusText(400) });
                            res.end();
                            return;
                        }
                    }
                });
            }
        };
    }
}
