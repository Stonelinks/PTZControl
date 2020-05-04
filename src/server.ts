import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as express from "express";
import { SERVER_PORT, VIEWER_FOLDER } from "./common/constants";
import { initConfig, registerConfigRoutes } from "./utils/config";
import { getCron } from "./utils/cron";
import { registerVideoDeviceRoutes } from "./utils/videoDevices";
import { Application } from "express";

const app: Application = express();

app.use(express.static(VIEWER_FOLDER));

app.use(cors());

app.use(
  bodyParser.json({
    limit: "1gb", // heaven help us if we ever get more than a gig of JSON
  }),
);

app.get("/ping", (req, res) => {
  res.send(JSON.stringify({ pong: "pong" }));
});

// Clients poll this, so when the server restarts it'll restart clients
let shouldRestart = true;
app.get("/update-apps", (req, res) => {
  res.send(JSON.stringify({ shouldRestart }));
  shouldRestart = false;
});

(async () => {
  try {
    await initConfig();
    await registerVideoDeviceRoutes(app);
    await registerConfigRoutes(app);
  } catch (e) {
    console.error(e);
  } finally {
    // register catchall route
    app.get("*", (req, res) => {
      res.sendFile(`${VIEWER_FOLDER}/index.html`);
    });

    // start the server
    app.listen(SERVER_PORT, err => {
      if (err) {
        return console.log("something bad happened", err);
      }

      console.log(`server listening on ${SERVER_PORT}`);
    });
  }

  const cron = await getCron();
  cron.start();
})();
