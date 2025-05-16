import {app, BrowserWindow, desktopCapturer, session} from "electron";
import path from "path";
import { isDev } from "./isDev.js";
import "electron";

app.commandLine.appendSwitch("enable-experimental-web-platform-features")

app.whenReady().then(() => {
	session.defaultSession.setDisplayMediaRequestHandler(
		async (request, callback) => {
			// use the system picker if you want:
			// callback(null, { video: true, audio: true }, { useSystemPicker: true });
			const sources = await desktopCapturer.getSources({ types:['screen','window'] });
			// e.g. pick the first source – replace with your own UI
			callback({ video: sources[0], audio: 'loopback' });
		},
		{ useSystemPicker: true }      // optional: let macOS/Windows show its UI
	);
})

app.on("ready", () => {
	const mainWindow = new BrowserWindow({
		webPreferences: { 
			contextIsolation: true,
			// preload: path.join(__dirname, 'preload.js'),
			nodeIntegration: false,
			sandbox: false,
			webSecurity: true
		}
	})
	session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
		if (permission === 'media' || permission === 'display-capture') {
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
