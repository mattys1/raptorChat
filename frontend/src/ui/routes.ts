export enum ROUTES {
	ROOT = "/",
	LOGIN = "/login",
	REGISTER = "/register",
	APP = "/app",
	MAIN = "/app/main",
	SETTINGS = "/app/settings",
	CHATROOM = "/app/chatroom",
	MANAGE_ROOM = "/app/chatroom/:chatId/manage",
	roomROOM = "roomROOM",
	ADMIN = '/app/admin',
	INVITE_FRIENDS = `${ROUTES.MAIN}/invite`
}
