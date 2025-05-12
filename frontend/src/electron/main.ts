import {app, BrowserWindow, session} from "electron";
import path from "path";
import { isDev } from "./isDev.js";

app.on("ready", () => {
	const mainWindow = new BrowserWindow({})
	session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
		if (permission === 'media') {
			callback(true);
		} else {
			callback(false);
		}
	});

	if(isDev()) {
		mainWindow.loadURL("http://localhost:3000")
	} else {
		mainWindow.loadFile(path.join(app.getAppPath(),  "/dist-react/index.html"))
	}

})
