import { HttpParams } from "@angular/common/http";
// import { environment } from "enviroments/environment.prod";
import { environment } from "enviroments/environment";

export class UrlFactory {

	// public static readonly BASE_URL = "http://localhost"
	// public static readonly PORT = "3000";
	public static readonly	BASE_URL = environment.apiUrl;
	public static readonly	PORT = environment.port;

	static buildUrl (routePath: string, httpParams: any[]) :string {

		let url: string = UrlFactory.BASE_URL;

		if (UrlFactory.PORT && UrlFactory.PORT.length > 0)
			url += ":" + UrlFactory.PORT;

		if (routePath && routePath.length > 0)
			url += "/" + routePath

		for (let httpParam of httpParams)
			url += "/" + httpParam 

		return url
	}
}