interface ILoginEventData {
	username: string;
}

interface IRequestEventData {
	input: string,
	recipient: string,
}

interface IMessageEventData {
	sender: string,
	recipient: string,
	message: string,
}
