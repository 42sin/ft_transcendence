export class Logger {

	private static readonly DEV_MODE = true

	static log (message: any)
	{
		console.log (message);
	}

	static success_title (message: any, title: any)
	{
		this._log ("\x1b[32m", "(" + title +  "): " + message);
	}

	static success (message: any)
	{
		this._log ("\x1b[32m", message)
	}

	static warning_title (message: any, title: any)
	{
		this._log ("\x1b[33m", "(" + title +  "): " + message)
	}

	static warning (message: any)
	{
		this._log ("\x1b[33m", message)
	}

	static error (message: any)
	{
		this._log ("\x1b[31m", message)
	}

	static title (message: any)
	{
		this._log ("\x1b[36m", message)
	}

	/** for temp logging */
	static higlight (message: any)
	{
		this._log ("\x1b[48:5:208m\x1b[97m", message)
	}

	private static _log (style: string, message: string) 
	{
		if (this.DEV_MODE)
		{
			console.log  (style + message + "\x1b[0m")
		}
	}
}
